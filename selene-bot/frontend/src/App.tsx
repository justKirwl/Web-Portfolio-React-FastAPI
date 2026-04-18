import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import './App.css'
import Auth from "./pages/AuthPage";
import ProtectPage from "./components/ProtectPage";
import OnlyUnauthorizedPage from "./components/OnlyUnauthorized";
import NewChat from "./pages/NewChat";
import Chat from "./pages/Chat";
import Recents from "./pages/RecentChats";
import 'regenerator-runtime/runtime'
import UpgradePage from "./pages/Upgrade";
import UpgradePro from "./pages/UpgradePro";
import UpgradeMax from "./pages/UpgradeMax";
import Settings from "./pages/Settings";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark'

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      document.documentElement.dataset.theme = mediaQuery.matches ? 'dark' : 'light'
      return
    }

    document.documentElement.dataset.theme = theme;
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={'/new'} replace/>}/>
        <Route path="/new" element={<ProtectPage location="/new"><NewChat /></ProtectPage>}/>
        <Route path="/auth" element={<OnlyUnauthorizedPage><Auth /></OnlyUnauthorizedPage>}/>
        <Route path="/chat/:id" element={<ProtectPage location="/new"><Chat /></ProtectPage>}/>
        <Route path="/recents" element={<ProtectPage location="/recents"><Recents /></ProtectPage>}/>
        <Route path="/upgrade" element={<ProtectPage location="/upgrade"><UpgradePage /></ProtectPage>}/>
        <Route path="/upgrade/pro" element={<ProtectPage location="/upgrade/pro"><UpgradePro /></ProtectPage>}/>
        <Route path="/upgrade/max" element={<ProtectPage location="/upgrade/max"><UpgradeMax /></ProtectPage>}/>
        <Route path="/settings" element={<ProtectPage location="/settings"><Settings /></ProtectPage>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App