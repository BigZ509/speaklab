import { Pressable, Text } from "react-native";
import useAudioRecording from "../../hooks/use-audio-recording";
import { StyleSheet } from "react-native";
import { View } from "react-native";

export function RecordButton(){
    
    const { isRecording,startRecording,stopRecording,recordingAudio, replayRecording, submitRecording,audioStatus} = useAudioRecording();
    
    
    return(
        <View>
        <Pressable onPress ={isRecording?stopRecording:startRecording}>
        <Text>Record</Text>
        {isRecording && <Text>Recording...</Text>}
         </Pressable>
         <Pressable onPress = { replayRecording}>
            <Text>Replay</Text>
            {audioStatus.playing && <Text>Replaying...</Text>}

         </Pressable>
         
    </View>
    )
    
}