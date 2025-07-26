import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { HomeComponent } from "@/components/Home";
import { Settings } from "@/components/Settings";
import { SidebarComponents } from "@/components/SidebarComponents";
import { Header } from "@/components/Header";
import { Toaster } from "react-hot-toast";
import SignIn from "./signIn";
import Profile from "@/components/profile";
import { Plan } from "@/components/plan";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { useAuth } from "@/context/AuthContext";
import { callReady } from "@/lib/farcaster";

const App = () => {
  const { user, loading } = useAuth();
  const [freePlan, setFreePlan] = useState(false);

  // Check free plan from sessionStorage
  useEffect(() => {
    const checkFreePlan = () => {
      const isFreePlan = sessionStorage.getItem("freePlan") === "true";
      setFreePlan(isFreePlan);
    };
    
    checkFreePlan();
    // Listen for storage changes
    window.addEventListener('storage', checkFreePlan);
    return () => window.removeEventListener('storage', checkFreePlan);
  }, []);

  console.log(freePlan, user, "app tsx------>");

  // Call Farcaster SDK ready() when the app is loaded
  useEffect(() => {
    if (!loading) {
      // Call ready when authentication loading is complete
      const timer = setTimeout(async () => {
        await callReady();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <Router>
      <Toaster />
      <div className="flex h-screen bg-gray-900 border-1 border-gray-900">
        <SidebarComponents user={user} />
        <div className="flex-1">
          <Header />
          {loading ? (
            <div className="flex items-center justify-center h-full w-full min-w-xs">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
            </div>
          ) : (
            <Routes>
              {user || freePlan ? (
                <>
                  <Route path="/" element={<HomeComponent />} />
                  <Route path="/plan" element={<Plan />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                  {user && (
                    <>
                      <Route path="/profile" element={<Profile />} />
                    </>
                  )}
                  <Route path="/login" element={<SignIn />} />
                </>
              ) : (
                <Route path="*" element={<SignIn />} />
              )}
            </Routes>
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;
