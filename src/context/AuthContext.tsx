import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type User = { name: string; email: string };
type StoredUser = User & { passwordHash: string };

type AuthContextData = {
  user: User | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const USERS_KEY = '@patinhas:users';
const SESSION_KEY = '@patinhas:session';

const AuthContext = createContext({} as AuthContextData);

const normalize = (email: string) => email.trim().toLowerCase();

const hashPassword = (email: string, password: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${email}:${password}`);

async function readUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const email = await AsyncStorage.getItem(SESSION_KEY);
      if (email) {
        const found = (await readUsers()).find(u => u.email === email);
        if (found) setUser({ name: found.name, email: found.email });
      }
      setLoading(false);
    })();
  }, []);

  async function signUp(name: string, email: string, password: string) {
    const normalized = normalize(email);
    const users = await readUsers();
    if (users.some(u => u.email === normalized)) {
      throw new Error('Já existe uma conta com este e-mail.');
    }
    const passwordHash = await hashPassword(normalized, password);
    const newUser: StoredUser = { name: name.trim(), email: normalized, passwordHash };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    await AsyncStorage.setItem(SESSION_KEY, normalized);
    setUser({ name: newUser.name, email: normalized });
  }

  async function signIn(email: string, password: string) {
    const normalized = normalize(email);
    const found = (await readUsers()).find(u => u.email === normalized);
    const passwordHash = await hashPassword(normalized, password);
    if (!found || found.passwordHash !== passwordHash) {
      throw new Error('E-mail ou senha incorretos.');
    }
    await AsyncStorage.setItem(SESSION_KEY, normalized);
    setUser({ name: found.name, email: found.email });
  }

  async function signOut() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
