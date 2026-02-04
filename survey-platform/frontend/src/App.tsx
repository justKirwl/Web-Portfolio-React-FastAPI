import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Dashboard from "./pages/Dashboard";
import { useEffect } from "react";
import { useAuthStore } from "./stores/AuthStore";
import Survey from "./pages/Survey";
import Quiz from "./pages/Quiz";
import StartSurvey from "./pages/StartSurvey";
import StartQuiz from "./pages/StartQuiz";
import QuizLeaderboard from "./components/QuizLeaderboard";
import Confirmation from "./pages/Confirmation";
import NotFound from "./pages/NotFound";
import ContactUs from "./pages/ContactUs";
import Profile from "./pages/Profile";
import Auth from "./components/Auth";
import ChangePassword from "./pages/ChangePassword";
import UnathorizedPage from "./utils/UnauthorizedPage";
import ProtectPage from "./utils/ProtectPage";
import PricingPage from "./pages/Pricing";
import FeaturesPage from "./pages/Features";
import { useUserDropdownStore } from "./stores/UserDropdownStore";
import Settings from "./pages/Settings";
import PublicItems from "./pages/Items";
import PricingPayment from "./components/PricingPayment";
import FaqPage from "./pages/FaqPage";
import SurveyWrapper from "./utils/SurveyWrapper";
import QuizWrapper from "./utils/QuizWrapper";

export default function App() {
  useEffect(() => {
    useAuthStore.getState().getAuthInfo()

    const userTheme = localStorage.getItem('user-theme') || 'dark'
    useUserDropdownStore.getState().setCurrentTheme(userTheme)
    document.documentElement.setAttribute('data-theme', userTheme)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />}/>
        <Route path="/auth" element={<UnathorizedPage><Auth /></UnathorizedPage>}/>
        <Route path="/dashboard" element={<ProtectPage location="dashboard"><Dashboard /></ProtectPage>}/>
        <Route path="/dashboard/survey/:id" element={<ProtectPage location="dashboard"><SurveyWrapper><Survey /></SurveyWrapper></ProtectPage>}/>
        <Route path="/dashboard/quiz/:id" element={<ProtectPage location="dashboard"><QuizWrapper><Quiz /></QuizWrapper></ProtectPage>}/>
        <Route path="/start/survey/:id" element={<ProtectPage location="dashboard"><StartSurvey /></ProtectPage>}/>
        <Route path="/start/quiz/:id" element={<ProtectPage location="dashboard"><StartQuiz /></ProtectPage>}/>
        <Route path="/quiz/leaderboard/:id" element={<ProtectPage location="dashboard"><QuizLeaderboard /></ProtectPage>}/>
        <Route path="/confirmation" element={<Confirmation />}/>
        <Route path="/account/change-password" element={<ChangePassword />}/>
        <Route path="/contact-us" element={<ContactUs />}/>
        <Route path="/upgrade" element={<PricingPage />}/>
        <Route path="/upgrade/payment" element={<ProtectPage location="upgrade/payment"><PricingPayment /></ProtectPage>}/>
        <Route path="/features" element={<FeaturesPage />}/>
        <Route path="/items" element={<ProtectPage location="items"><PublicItems /></ProtectPage>}/>
        <Route path="/profile" element={<ProtectPage location="profile"><Profile /></ProtectPage>}/>
        <Route path="/account/settings" element={<ProtectPage location="account/settings"><Settings /></ProtectPage>}/>
        <Route path="/faq" element={<FaqPage />}/>
        <Route path="*" element={<NotFound />}/>
      </Routes>
    </BrowserRouter>
  )
}