import { Alert } from "react-native";

    export function errorHandling(title:string,error:Error){
        
            console.log(error)
            Alert.alert(title, error.message);
        
    }