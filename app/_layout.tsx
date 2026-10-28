import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { auth, db } from '@/firebase/config';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View, Alert } from 'react-native';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export const unstable_settings = { anchor: '(tabs)' };
export interface AuthContextType { user: User | null; logout: () => void; }
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<{ uid: string; status: 'loading' | 'ready' | 'missing' | 'error' } | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => onAuthStateChanged(auth, firebaseUser => {
    setUser(firebaseUser);
    setProfile(null);
    setIsLoaded(true);
  }), []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setProfile({ uid: user.uid, status: 'loading' });
    // Wait for a saved profile before opening the main app.
    const unsubscribe = onSnapshot(doc(db, 'user', user.uid), { includeMetadataChanges: true }, snapshot => {
      if (!active || snapshot.metadata.hasPendingWrites) return;
      const data = snapshot.data();
      const complete = data?.uid === user.uid && typeof data?.username === 'string' && data.username.trim().length > 0;
      setProfile({ uid: user.uid, status: complete ? 'ready' : 'missing' });
    }, () => {
      if (active) setProfile({ uid: user.uid, status: 'error' });
    });
    return () => { active = false; unsubscribe(); };
  }, [user, retry]);

  const logout = () => {
    signOut(auth).catch(() => Alert.alert('Could not sign out', 'Please try again.'));
  };
  const profileStatus = profile?.uid === user?.uid ? profile?.status : 'loading';
  if (!isLoaded || (user && (!profileStatus || profileStatus === 'loading'))) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  }
  if (user && profileStatus === 'error') {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Could not load your profile.</Text>
      <Pressable onPress={() => setRetry(value => value + 1)}><Text>Retry</Text></Pressable>
      <Pressable onPress={logout}><Text>Sign out</Text></Pressable>
    </View>;
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Protected guard={!!user && profileStatus === 'ready'}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack.Protected>
          <Stack.Protected guard={!user}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!user || profileStatus === 'missing'}>
            <Stack.Screen name="signup" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
