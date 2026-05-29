import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../AuthContext";

const BASE_URL = "https://genjazz-api.fly.dev";

function lsKey(email) { return `gj_progs_${email}`; }
function lsLoad(email) {
  if (!email) return [];
  try { return JSON.parse(localStorage.getItem(lsKey(email)) || "[]"); }
  catch { return []; }
}
function lsSave(email, items) {
  if (!email) return;
  localStorage.setItem(lsKey(email), JSON.stringify(items));
}

export function useGenJazz() {
  const { email } = useAuth();

  // ── catalog data ────────────────────────────────────────────────
  const [keys, setKeys]               = useState([]);
  const [structures, setStructures]   = useState([]);
  const [modulations, setModulations] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError,   setCatalogError]   = useState(null);

  // ── user selections ──────────────────────────────────────────────
  const [selectedKey,        setSelectedKey]        = useState("");
  const [selectedStructure,  setSelectedStructure]  = useState("");
  const [selectedModulation, setSelectedModulation] = useState("");

  // ── generation ──────────────────────────────────────────────────
  const [progression,   setProgression]   = useState(null);
  const [generating,    setGenerating]    = useState(false);
  const [generateError, setGenerateError] = useState(null);

  // ── audio ────────────────────────────────────────────────────────
  const [audioUrl,   setAudioUrl]   = useState(null);
  const [converting, setConverting] = useState(false);

  // ── library ─────────────────────────────────────────────────────
  const [savedProgressions, setSavedProgressions] = useState([]);
  const [libraryLoading,    setLibraryLoading]    = useState(false);
  const [saving,            setSaving]            = useState(false);

  // ── load catalog ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setCatalogLoading(true);
        setCatalogError(null);

        const [kRes, sRes, mRes] = await Promise.all([
          fetch(`${BASE_URL}/api/keys`),
          fetch(`${BASE_URL}/api/structures`),
          fetch(`${BASE_URL}/api/modulations`),
        ]);

        const [kData, sData, mData] = await Promise.all([
          kRes.json(), sRes.json(), mRes.json(),
        ]);

        setKeys(kData.map(k => k.key ?? k));
        setStructures(sData.map(s => s.structure ?? s).slice(0, 10));
        setModulations(mData.map(m => m.modulation ?? m));
      } catch (err) {
        setCatalogError(err.message);
      } finally {
        setCatalogLoading(false);
      }
    };
    load();
  }, []);

  // ── load library ────────────────────────────────────────────────
  const loadLibrary = useCallback(async () => {
    if (!email) return;

    // Carrega localStorage imediatamente (sem esperar rede)
    const local = lsLoad(email);
    setSavedProgressions(local);

    // Tenta sincronizar com API em background
    try {
      setLibraryLoading(true);
      const res  = await fetch(`${BASE_URL}/api/chords/user/${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return;

      // Funde items da API com os locais (evita duplicados por chords)
      const merged = [...local];
      for (const apiItem of data) {
        if (!merged.some(l => l.chords === apiItem.chords)) {
          merged.push(apiItem);
        }
      }
      merged.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      lsSave(email, merged);
      setSavedProgressions(merged);
    } catch {
      // mantém dados locais
    } finally {
      setLibraryLoading(false);
    }
  }, [email]);

  useEffect(() => {
    if (email) loadLibrary();
  }, [email, loadLibrary]);

  // ── generate ────────────────────────────────────────────────────
  const generate = async () => {
    try {
      setGenerating(true);
      setGenerateError(null);
      setProgression(null);
      setAudioUrl(null);

      const key = selectedKey        || "Random";
      const str = selectedStructure  || "Random";
      const mod = selectedModulation || "Random";

      const res  = await fetch(
        `${BASE_URL}/api/generate/${encodeURIComponent(key)}/${encodeURIComponent(str)}/${encodeURIComponent(mod)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProgression(data);
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // ── convert to MP3 ──────────────────────────────────────────────
  const convertToMp3 = async (chordsOverride) => {
    const chords = chordsOverride ?? progression?.chords;
    if (!chords) return null;

    try {
      setConverting(true);
      const res  = await fetch(`${BASE_URL}/api/chords2mp3/${encodeURIComponent(chords)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const mp3Path = data.mp3_url;
      if (typeof mp3Path !== "string" || !mp3Path.startsWith("/")) return null;
      const url = `${BASE_URL}${mp3Path}`;

      if (!chordsOverride) setAudioUrl(url);
      return url;
    } catch {
      return null;
    } finally {
      setConverting(false);
    }
  };

  // ── save ────────────────────────────────────────────────────────
  const save = async (name = "Nova Progressão") => {
    if (!progression?.chords || !email) return;
    setSaving(true);
    try {
      const str = selectedStructure  || "Random";
      const mod = selectedModulation || "Random";
      const newItem = {
        id: `local_${Date.now()}`,
        name,
        chords: progression.chords,
        key: progression.key || selectedKey || "?",
        structure: str,
        modulation: mod,
        created_at: new Date().toISOString(),
      };

      // Guarda localmente de imediato (evita duplicados por chords)
      const existing = lsLoad(email).filter(p => p.chords !== newItem.chords);
      const updated  = [newItem, ...existing];
      lsSave(email, updated);
      setSavedProgressions(updated);

      // Tenta enviar à API em background (sem bloquear)
      const enc = encodeURIComponent;
      fetch(
        `${BASE_URL}/api/chords/${enc(email)}/${enc(progression.chords)}/${enc(progression.key || "C")}/${enc(str)}/${enc(mod)}`,
        { method: "POST" }
      ).catch(() => {});
    } finally {
      setSaving(false);
    }
  };

  // ── delete ──────────────────────────────────────────────────────
  const deleteProgression = async (id) => {
    if (!email) return;
    const updated = lsLoad(email).filter(p => p.id !== id);
    lsSave(email, updated);
    setSavedProgressions(updated);

    // Tenta apagar na API em background
    fetch(`${BASE_URL}/api/chords/${encodeURIComponent(email)}/${id}`, {
      method: "DELETE",
    }).catch(() => {});
  };

  return {
    keys, structures, modulations, catalogLoading, catalogError,
    selectedKey, setSelectedKey,
    selectedStructure, setSelectedStructure,
    selectedModulation, setSelectedModulation,
    progression, generating, generateError, generate,
    audioUrl, setAudioUrl, converting, convertToMp3,
    savedProgressions, libraryLoading, saving, save, deleteProgression, loadLibrary,
    email,
  };
}
