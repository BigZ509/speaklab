import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAudioRecording from '../../hooks/use-audio-recording';
import { FeedbackSummary } from '@/components/practice/feedback-summary';
import { PracticePromptCard } from '@/components/practice/practice-prompt-card';
import { RecordingControl } from '@/components/practice/recording-control';
import { RecordingReviewBar } from '@/components/practice/recording-review-bar';
import { ResultsHeader } from '@/components/practice/results-header';
import { SubmissionState } from '@/components/practice/submission-state';
import { TranscriptPanel } from '@/components/practice/transcript-panel';
import { practiceTokens } from '@/components/practice/tokens';

export function RecordButton() {
  const { isRecording, startRecording, stopRecording, recordingAudio, replayRecording, submitRecording, transcriptText, isSubmitted, submissionStatus, submissionError, fillerResults, hasMicrophonePermission, recordingDurationSeconds } = useAudioRecording();
  const sessionTitle = isRecording ? 'You’re recording.' : 'Practice with focus.';

  return <SafeAreaView edges={['top']} style={styles.safe}>
    <ScrollView contentContainerStyle={styles.screen}>
      {isSubmitted ? <View style={styles.results}>
        <ResultsHeader />
        <FeedbackSummary fillerResults={fillerResults} />
        <TranscriptPanel transcript={transcriptText?.text ?? ''} />
        <Pressable accessibilityRole="button" accessibilityLabel="Practice again" onPress={startRecording} style={styles.again}>
          <Text style={styles.againText}>Practice again</Text>
        </Pressable>
      </View> : <>
        <Text style={styles.eyebrow}>SPEAKLAB · PRACTICE RESPONSE</Text>
        <Text style={styles.title}>{sessionTitle}</Text>
        <PracticePromptCard />
        {hasMicrophonePermission === false && <SubmissionState type="permission" onRetry={startRecording} />}
        {hasMicrophonePermission !== false && !recordingAudio && <RecordingControl isRecording={isRecording} elapsedSeconds={recordingDurationSeconds} onPress={isRecording ? stopRecording : startRecording} />}
        {recordingAudio && !isRecording && <RecordingReviewBar submitting={submissionStatus === 'submitting'} onReplay={replayRecording} onReplace={startRecording} onSubmit={submitRecording} />}
        {submissionStatus === 'submitting' && <SubmissionState type="submitting" />}
        {submissionStatus === 'error' && <SubmissionState type="error" message={submissionError ?? undefined} onRetry={submitRecording} />}
      </>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: practiceTokens.color.canvas },
  screen: { flexGrow: 1, gap: practiceTokens.spacing.md, paddingBottom: practiceTokens.spacing.xxl, paddingHorizontal: 20, paddingTop: practiceTokens.spacing.xs },
  eyebrow: { color: practiceTokens.color.textSecondary, ...practiceTokens.type.label, letterSpacing: 1.1, marginTop: practiceTokens.spacing.xs },
  title: { color: practiceTokens.color.text, ...practiceTokens.type.display },
  results: { gap: practiceTokens.spacing.md },
  again: { alignItems: 'center', backgroundColor: practiceTokens.color.primary, borderRadius: practiceTokens.radius.card, justifyContent: 'center', minHeight: 56 },
  againText: { color: practiceTokens.color.onPrimary, ...practiceTokens.type.label },
});
