import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { auth } from '@/firebase/config';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react';
import {onAuthStateChanged, signOut, User} from "firebase/auth"
export const unstable_settings = {
  anchor: '(tabs)',
};

 export interface AuthContextType {
  user: User | null;
  logout: () => void;
}

const AuthContext = React.createContext< AuthContextType | undefined >(undefined);
export default function RootLayout() {

  const colorScheme = useColorScheme();
  const [user, setUser] = useState< User | null>(null);
  const [isLoaded, setIsloaded] = useState(false);

  //launches call back function store it in user
  useEffect(()=> {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsloaded(true);
    });

    return unsubscribe;
  },[]);

  if(!isLoaded){
    return null; //change to loading screen later
  }

  const logout = () => signOut(auth);


  return (
    <AuthContext.Provider value = {{ user, logout}}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Protected guard = {!!user}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
           </Stack.Protected>

          <Stack.Protected guard = {!user}>
               <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="signup" options={{ headerShown: false }} />
          </Stack.Protected>


        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />

      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
    </AuthContext.Provider>
  );
}
