import { Pressable, Text } from "react-native";
import useAudioRecording from "../../hooks/use-audio-recording";
import { StyleSheet } from "react-native";
import { View } from "react-native";


export function RecordButton(){
    
    const { isRecording,startRecording,stopRecording,recordingAudio,
         replayRecording, submitRecording,audioStatus,transcriptText,
         isSubmitted, submissionStatus, submissionError, fillerResults } = useAudioRecording();
        
        // console.log("render:", recordingAudio)
    
    return(
        <View>
        <Pressable disabled={submissionStatus === "submitting"} onPress ={isRecording?stopRecording:startRecording}>
        <Text>Record</Text>
        {isRecording && <Text>Recording...</Text>}
         </Pressable>
         <Pressable onPress = { replayRecording}>
            <Text>Replay</Text>
            {audioStatus.playing && <Text>Replaying...</Text>}

         </Pressable>
         {/* Submit only when the recording is ready. */}
         <Pressable
            onPress={submitRecording}
            disabled={!recordingAudio || isRecording || submissionStatus === "submitting"}
         >
            <Text>{submissionStatus === "submitting" ? "Submitting..." : submissionStatus === "error" ? "Retry" : "Submit"}</Text>
         </Pressable>
         {submissionError && <Text accessibilityRole="alert">{submissionError}</Text>}
         {/* Show the saved analysis results. */}
         {isSubmitted && (
            <View>
               <Text selectable style={{fontSize: 16}}>{transcriptText?.text}</Text>
               {fillerResults && (
                  <Text>Filler words detected: {Array.from(fillerResults.values()).reduce((total, occurrences) => total + occurrences.length, 0)}</Text>
               )}
            </View>
         )}
         
    </View>
    )
    
}