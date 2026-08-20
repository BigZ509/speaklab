import { useState } from "react";
import {
    Pressable,
    TextInput,
    View,
    Text,
    StyleSheet
} from "react-native";
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
    const [username, setUserName] = useState("")


    async function handleSubmit() {
      
      console.log("submit")
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

      <Pressable onPress={handleSubmit}>
        <Text>Sign Up</Text>
      </Pressable>
      
      </View>
      </View>
     
    )


   
}
