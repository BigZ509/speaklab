import { useState } from "react";
import {
    Pressable,
    TextInput,
    View,
    Text,
    StyleSheet,
    Alert
} from "react-native";
import { auth} from "@/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";


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


export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

   async function handleSubmit() {
   
    try{
      // Routing waits for the authenticated user's profile.
      await signInWithEmailAndPassword(auth, email.trim(), password);

    }catch(error){
      if(error instanceof FirebaseError){
        switch(error.code){

          case "auth/invalid-credential":
            Alert.alert("Wrong email or password");
            break;
          case "auth/user-not-found":
            Alert.alert("No account with that email");
            break;
          case "auth/too-many-requests":
            Alert.alert("Too many attemps - try again later");
            break;
          default:
            Alert.alert("Failed to login");
        }


      }else{
        console.log(error);
        Alert.alert("Failed to login");
      }


    }


  }
  

  return (
      <View style={styles.view} > 
      <Text style = {styles.title} >Welcome Back</Text>
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
      <Text style = {styles.label}>Password:</Text>
      <TextInput style = {styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      </View>

      <Pressable onPress={handleSubmit}>
        <Text>Login</Text>
      </Pressable>
      
    </View>

    
  );

  

}
