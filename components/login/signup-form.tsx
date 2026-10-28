import { useEffect, useRef, useState } from "react";
import {
    Pressable,
    TextInput,
    View,
    Text,
    StyleSheet,
    Alert
} from "react-native";
import { auth, db } from "@/firebase/config";
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth"
import { setDoc, doc } from "firebase/firestore";
import { User } from "@/scripts/types/types";
import { FirebaseError} from "firebase/app";
 
  const styles = StyleSheet.create({
  
    view:{
        justifyContent:"center",
        alignItems:"center",
        flex:1
    },
    fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    width: 80,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    padding: 8,
  },
  title:{
    fontSize: 30,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 24,
  }
});



    export function SignUpForm() {
    const[email, setEmail] = useState("");
    const [password, setPassWord] = useState("");
    const [username, setUserName] = useState("");
    


    const [account, setAccount] = useState(auth.currentUser);
    const [isSaving, setIsSaving] = useState(false);
    const saving = useRef(false);
    useEffect(() => onAuthStateChanged(auth, setAccount), []);

    async function handleSubmit() {
      if (saving.current) return;
      if (!username.trim()) {
        Alert.alert("Enter a username");
        return;
      }
      saving.current = true;
      setIsSaving(true);
      try {
        // Retry profile setup without creating another account.
        const user = auth.currentUser ??
          (await createUserWithEmailAndPassword(auth, email.trim(), password)).user;
        setAccount(user);
        if (!user.email) throw new Error("This account has no email address.");
        const userData: User = {
          email: user.email,
          uid: user.uid,
          username: username.trim(),
        };
        await setDoc(doc(db, "user", user.uid), userData, { merge: true });
        Alert.alert("Profile saved!");
      } catch (error) {
        if (auth.currentUser) {
          Alert.alert("Profile not saved", "Your account exists. Retry saving your profile.");
        } else if (error instanceof FirebaseError && error.code === "auth/email-already-in-use") {
          Alert.alert("Email already in use", "Log in to finish setting up your profile.");
        } else if (error instanceof FirebaseError && error.code === "auth/weak-password") {
          Alert.alert("Weak password");
        } else {
          Alert.alert("Could not create account", "Please try again.");
        }
      } finally {
        saving.current = false;
        setIsSaving(false);
      }
    }

    return(
        <View style = {styles.view}>
        {account && <Text>Finish setting up your profile</Text>}
        {!account && <>
        <View style = {styles.fieldRow}>
        <Text style = {styles.label}>Email</Text>
        <TextInput style = {styles.input} 
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        />
      </View>
      
      <View style = {styles.fieldRow}>
      <Text style = {styles.label}>password</Text>
      <TextInput style = {styles.input}
        value={password}
        onChangeText={setPassWord}
        placeholder="Password"
        secureTextEntry
        />
      </View>
      </>}
      <View style = {styles.fieldRow}>
      <Text style = {styles.label}>username</Text>
      <TextInput style = {styles.input}
        value = {username}
        onChangeText={setUserName}
        placeholder="Username"
       /> 
      </View>

      <View style = {styles.fieldRow}>

      <Pressable disabled={isSaving} onPress={handleSubmit}
      style={{
      padding: 20,
      backgroundColor: "red",
      }}>
        <Text>{isSaving ? "Saving..." : account ? "Save profile" : "Sign Up"}</Text>
      </Pressable>
      {account && <Pressable disabled={isSaving} onPress={() => {
        signOut(auth).catch(() => Alert.alert("Could not sign out", "Please try again."));
      }}><Text>Sign out</Text></Pressable>}
      
      </View>
      </View>
     
    )


   
}
