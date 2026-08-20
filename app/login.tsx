import { LoginForm } from "@/components/login/login-form";
import { View } from "react-native";
import { Link } from "expo-router";

export default function LoginScreen() {
  return (
    <View style = {{flex: 1}}>
      <LoginForm />
      <Link href = "/signup">Dont have an account? Sign up</Link>
    </View>
  );
}
