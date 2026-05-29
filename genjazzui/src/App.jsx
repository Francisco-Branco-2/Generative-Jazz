import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";
import SmartphoneFrame from "./components/SmartphoneFrame";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import GenerationScreen from "./screens/GenerationScreen";
import ResultScreen from "./screens/ResultScreen";
import LibraryScreen from "./screens/LibraryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import BottomNav from "./components/BottomNav";
import { useGenJazz } from "./hooks/useGenJazz";

function AppShell() {
  const gj = useGenJazz();
  const location = useLocation();
  const protectedPaths = ["/home", "/generate", "/result", "/library", "/profile"];
  const showNav = protectedPaths.some(p => location.pathname.startsWith(p));

  return (
    <SmartphoneFrame>
      <div className="phone-top-bar" />
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Routes>
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/home" element={<RequireAuth><HomeScreen gj={gj} /></RequireAuth>} />
          <Route path="/generate" element={<RequireAuth><GenerationScreen gj={gj} /></RequireAuth>} />
          <Route path="/result" element={<RequireAuth><ResultScreen gj={gj} /></RequireAuth>} />
          <Route path="/library" element={<RequireAuth><LibraryScreen gj={gj} /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfileScreen /></RequireAuth>} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </div>
      {showNav && <BottomNav />}
    </SmartphoneFrame>
  );
}

function RequireAuth({ children }) {
  const { email } = useAuth();
  return email ? children : <Navigate to="/login" replace />;
}

function RootRedirect() {
  const { email } = useAuth();
  return <Navigate to={email ? "/home" : "/splash"} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
