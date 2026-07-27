import { Pressable, Text } from "react-native";
import useAudioRecording from "../../hooks/use-audio-recording";

export function RecordButton(){
    
    const { startRecording,stopRecording,recorderState} = useAudioRecording();
    
    return(
        <Pressable onPress ={recorderState.isRecording?stopRecording:startRecording}>
        <Text>Record</Text>
        {recorderState.isRecording && <Text>Recording...</Text>}
        
    </Pressable>
    )
    
}