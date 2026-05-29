import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const USERS_KEY = "gj_users";
const SESSION_KEY = "gj_email";

const TEST_ACCOUNTS = {
  "miguel.rodrigues@ubi.pt": {
    hash: "050f1ce3b8f8ea407779d87788cd18dc65d2ea8f7a92bb3453c96f7845e44e95",
    name: "Miguel Rodrigues"
  },
  "sofia.oliveira@ubi.pt": {
    hash: "e87a83e1b562d18046eada24545307fe66f5f379d74225e5a5ec4d063c857c26",
    name: "Sofia Oliveira"
  },
  "ana.martins@ubi.pt": {
    hash: "7cf1eeb19cd01a32d318ff5525e8e2969fe6d575df11d02c0206e92a053b198f",
    name: "Ana Martins"
  },
};

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); }
  catch { return {}; }
}

const BLOCKED_ACCOUNTS = ["francisco.branco@ubi.pt"];

function seedTestAccounts() {
  const users = loadUsers();
  let changed = false;
  for (const [email, data] of Object.entries(TEST_ACCOUNTS)) {
    if (!users[email]) { users[email] = data; changed = true; }
  }
  for (const email of BLOCKED_ACCOUNTS) {
    if (users[email]) { delete users[email]; changed = true; }
  }
  if (changed) localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(() => {
    seedTestAccounts();
    return sessionStorage.getItem(SESSION_KEY);
  });
  // bumped whenever profile data changes so consumers re-render
  const [profileVersion, setProfileVersion] = useState(0);
  const bump = () => setProfileVersion(v => v + 1);

  function getName() {
    if (!email) return "";
    const users = loadUsers();
    return users[email]?.name || email.split("@")[0];
  }

  function getPhoto() {
    if (!email) return null;
    const users = loadUsers();
    return users[email]?.photo || null;
  }

  async function register(name, em, pwd) {
    const users = loadUsers();
    if (users[em]) throw new Error("Este email já tem uma conta registada.");
    users[em] = { hash: await sha256(pwd), name };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    sessionStorage.setItem(SESSION_KEY, em);
    setEmail(em);
  }

  async function login(em, pwd) {
    const users = loadUsers();
    if (!users[em]) throw new Error("Email não registado. Cria uma conta primeiro.");
    const hash = await sha256(pwd);
    const stored = users[em];
    const storedHash = typeof stored === "string" ? stored : stored.hash;
    if (storedHash !== hash) throw new Error("Palavra-passe incorreta.");
    sessionStorage.setItem(SESSION_KEY, em);
    setEmail(em);
  }

  function updateName(newName) {
    if (!email) return;
    const users = loadUsers();
    users[email] = { ...users[email], name: newName };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    bump();
  }

  async function updatePassword(currentPwd, newPwd) {
    if (!email) return;
    const users = loadUsers();
    const stored = users[email];
    const storedHash = typeof stored === "string" ? stored : stored.hash;
    const currentHash = await sha256(currentPwd);
    if (storedHash !== currentHash) throw new Error("Palavra-passe atual incorreta.");
    users[email] = { ...users[email], hash: await sha256(newPwd) };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function updatePhoto(base64) {
    if (!email) return;
    const users = loadUsers();
    users[email] = { ...users[email], photo: base64 };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    bump();
  }

  function signOut() {
    sessionStorage.removeItem(SESSION_KEY);
    setEmail(null);
  }

  return (
    <AuthContext.Provider value={{
      email, profileVersion,
      getName, getPhoto,
      register, login, signOut,
      updateName, updatePassword, updatePhoto,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
