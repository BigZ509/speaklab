import { Pressable, Text } from "react-native";
import useAudioRecording from "../../hooks/use-audio-recording";
import { StyleSheet } from "react-native";

export function RecordButton(){
    
    const { isRecording,startRecording,stopRecording,} = useAudioRecording();
    
    return(
        <Pressable onPress ={isRecording?stopRecording:startRecording}>
        <Text>Record</Text>
        
        {isRecording && <Text>Recording...</Text>}
        
        
    </Pressable>
    )
    
}