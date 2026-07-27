import { Pressable, Text } from "react-native";
import useAudioRecording from "../../hooks/use-audio-recording";

export function RecordButton(){
    
    const {isRecording, startRecording,stopRecording,recorderState} = useAudioRecording();
    
    return(
        <Pressable onPress ={isRecording?stopRecording:startRecording}>
        <Text>Record</Text>
        {isRecording && <Text>Recording...</Text>}
        
    </Pressable>
    )
    
}