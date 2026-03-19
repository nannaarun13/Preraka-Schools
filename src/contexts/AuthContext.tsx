import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  User
} from "firebase/auth";
import { auth } from "@/lib/firebase"; // adjust path if needed

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });

    return () => unsubscribe();

  }, []);

  const logout = async () => {
    await signOut(auth);

    localStorage.clear();
    sessionStorage.clear();

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
