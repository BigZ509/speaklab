import { useState } from "react";
import {
    Pressable,
    TextInput,
    View,
    Text,
    StyleSheet,
    Alert
} from "react-native";
import { auth, db } from "@/firebase/config";
import {createUserWithEmailAndPassword} from "firebase/auth"
import { useRouter } from "expo-router";
import { collection, setDoc, doc } from "firebase/firestore";
import { User } from "@/scripts/types/types";
 
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
     const router = useRouter();
    


    async function handleSubmit() {
      console.log("pressed");
     try{
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if(result.user.email === null){
        return
      }
      const userDoc = doc(db, "user", result.user.uid); //createes locatoin in database
      
     const userData:User = { // give data the userobj type
        email: result.user.email,
        uid: result.user.uid,
        username: username
      }
      await setDoc(userDoc,userData);//gives doc location and data
      Alert.alert("creating Account...");
      
      router.replace("/(tabs)");//replaces screen
     
     }catch(error){
     console.error(error);
     }
           
    }
    


    return(
        <View style = {styles.view}>
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
      <View style = {styles.fieldRow}>
      <Text style = {styles.label}>username</Text>
      <TextInput style = {styles.input}
        value = {username}
        onChangeText={setUserName}
        placeholder="Username"
       /> 
      </View>

      <View style = {styles.fieldRow}>

      <Pressable onPress={handleSubmit}
      style={{
      padding: 20,
      backgroundColor: "red",
      }}>
        <Text>Sign Up</Text>
      </Pressable>
      
      </View>
      </View>
     
    )


   
}
