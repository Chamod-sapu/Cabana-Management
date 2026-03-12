import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [systemActive, setSystemActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session?.user) {
        await loadUser(session.user);
      } else {
        setLoading(false);
      }

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((_event, sess) => {
        if (sess?.user) {
          loadUser(sess.user);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    };

    init();
  }, []);

  const loadUser = async (authUser) => {
    setUser(authUser);
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    setProfile(profileData);

    const { data: settings } = await supabase
      .from("system_settings")
      .select("*")
      .single();

    setSystemActive(settings?.is_active ?? true);
    setLoading(false);
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    if (data.user) {
      await loadUser(data.user);
      navigate("/");
    }
  };

  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    if (data.user) {
      await loadUser(data.user);
      navigate("/");
    }
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const value = {
    user,
    profile,
    role: profile?.role,
    systemActive,
    loading,
    login,
    logout,
    signup
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

