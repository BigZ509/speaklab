import { useState } from "react";
import {
    Pressable,
    TextInput,
    View,
    Text,
    StyleSheet,
    Alert
} from "react-native";
import { auth, app, db} from "@/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { errorHandling } from "@/utils/handle-error";
import { getDoc, doc} from "firebase/firestore";


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
  const router = useRouter();

   async function handleSubmit() {
   
    try{
     const logIn = await signInWithEmailAndPassword(auth, email, password);
      const userDataLocation = doc(db,"user", logIn.user.uid); //creates userdata refrence
     getDoc(userDataLocation);

       router.replace("/(tabs)");
       Alert.alert("Loggin in!!")
       
    }catch(error){
      console.error(error);
      Alert.alert("Failed to login");
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
