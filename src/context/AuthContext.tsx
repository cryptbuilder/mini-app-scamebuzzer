import { fetchCurrentUser, logoutUser } from "@/lib/auth";
import { createContext, useContext, useState, useEffect } from "react";
import { trackGA } from "@/utils/ga";
import { storeSession, getSession, removeSession, storeUserPlan } from "@/lib/farcasterStorage";

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  session: any;
  subscription: any;
  login: (email: string, password: string) => Promise<void>;
  loading: boolean;
  handleLogout: () => Promise<void>;
  accessFree: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: (user: any) => {},
  session: null,
  subscription: null,
  login: async () => {},
  loading: false,
  handleLogout: async () => {},
  accessFree: async () => {},
});

// Helper function to format user data from session
const formatUserData = (sessionUser: any) => {
  if (!sessionUser) return null;
  
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'User',
    avatar: sessionUser.user_metadata?.avatar_url || null,
    isEarlyUser: false,
    subscriptionData: sessionUser.subscriptionData || null,
    // Keep original data for compatibility
    ...sessionUser
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedSession = await getSession();
        console.log("Stored session:", storedSession);
        
        if (storedSession) {
          setSession(storedSession);
          // Use user data from session if available, otherwise try to fetch
          if (storedSession.user) {
            console.log("Using user from session:", storedSession.user);
            const formattedUser = formatUserData(storedSession.user);
            console.log("Formatted user:", formattedUser);
            setUser(formattedUser);
            setSubscription(formattedUser?.subscriptionData);
          } else {
            console.log("No user in session, fetching...");
            const user = await fetchCurrentUser();
            console.log("Fetched user:", user);
            setUser(user);
            setSubscription(user?.subscriptionData);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.scambuzzer.com/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!json.success) {
        trackGA("login_failure", { method: "email", error: json.error });
        throw new Error(json.error || "Login failed");
      }

      console.log("Login response:", json);
      

      const session = json.data.session;
      const expiresAt = Date.now() + session.expires_in * 1000;
      const sessionWithExpiry = { ...session, expiresAt };
      
      await storeSession(sessionWithExpiry);
      setSession(sessionWithExpiry);

      if (json.data) {
        trackGA("login_success", {
          method: "email",
          user_id: json.data.user.id,
        });
        
        // Use user data from the session response directly
        const userData = session.user;
        console.log("Setting user data:", userData);
        const formattedUser = formatUserData(userData);
        console.log("Formatted user data:", formattedUser);
        setUser(formattedUser);

        const plan = formattedUser?.subscriptionData?.plan || 0;
        await storeUserPlan(plan);
        setSubscription(formattedUser?.subscriptionData);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const accessFree = async () => {
    setLoading(true);

    // Store free plan in session storage
    await storeUserPlan(0);
    sessionStorage.setItem("freePlan", "true");

    await new Promise((resolve) => setTimeout(resolve, 300));

    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      await removeSession();
      sessionStorage.removeItem("freePlan");
      setUser(null);
      setSession(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  console.log("AuthContext state - user:", user, "loading:", loading, "session:", session);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        session,
        subscription,
        login,
        loading,
        handleLogout,
        accessFree,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
