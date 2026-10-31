import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import useAudioRecording from "../../hooks/use-audio-recording";
import { FeedbackSummary } from "@/components/practice/feedback-summary";
import { PracticePromptCard } from "@/components/practice/practice-prompt-card";
import { RecordingControl } from "@/components/practice/recording-control";
import { RecordingReviewBar } from "@/components/practice/recording-review-bar";
import { SubmissionState } from "@/components/practice/submission-state";
import { TranscriptPanel } from "@/components/practice/transcript-panel";
import { practiceTokens } from "@/components/practice/tokens";


export function RecordButton(){
    
    const { isRecording,startRecording,stopRecording,recordingAudio,
         replayRecording, submitRecording,transcriptText,
         isSubmitted, submissionStatus, submissionError, fillerResults, hasMicrophonePermission } = useAudioRecording();
        
        // console.log("render:", recordingAudio)
    
    return <ScrollView contentContainerStyle={styles.screen}><Text style={styles.eyebrow}>SPEAKLAB · PRACTICE RESPONSE</Text><Text style={styles.title}>{isSubmitted ? 'Practice review.' : isRecording ? 'You’re recording.' : 'Practice with focus.'}</Text>{!isSubmitted && <PracticePromptCard />}{hasMicrophonePermission === false && <SubmissionState type="permission" onRetry={startRecording} />}{!isSubmitted && hasMicrophonePermission !== false && !recordingAudio && <RecordingControl isRecording={isRecording} onPress={isRecording ? stopRecording : startRecording} />}{!isSubmitted && recordingAudio && !isRecording && <RecordingReviewBar submitting={submissionStatus === 'submitting'} onReplay={replayRecording} onReplace={startRecording} onSubmit={submitRecording} />}{submissionStatus === 'submitting' && <SubmissionState type="submitting" />}{submissionStatus === 'error' && <SubmissionState type="error" message={submissionError ?? undefined} onRetry={submitRecording} />}{isSubmitted && <View style={styles.results}><FeedbackSummary fillerResults={fillerResults} /><TranscriptPanel transcript={transcriptText?.text ?? ''} /><Pressable accessibilityRole="button" onPress={startRecording} style={styles.again}><Text style={styles.againText}>Practice again</Text></Pressable></View>}</ScrollView>
    
}
const styles = StyleSheet.create({ screen:{backgroundColor:practiceTokens.color.canvas,flexGrow:1,padding:20,gap:16},eyebrow:{color:practiceTokens.color.textSecondary,...practiceTokens.type.label,marginTop:16},title:{color:practiceTokens.color.text,...practiceTokens.type.display},results:{gap:16},again:{minHeight:56,backgroundColor:practiceTokens.color.primary,borderRadius:12,alignItems:'center',justifyContent:'center'},againText:{color:practiceTokens.color.onPrimary,...practiceTokens.type.label}});
