import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FeedbackSummary } from '@/components/practice/feedback-summary';
import { PracticePromptCard } from '@/components/practice/practice-prompt-card';
import { RecordingControl } from '@/components/practice/recording-control';
import { RecordingReviewBar } from '@/components/practice/recording-review-bar';
import { ResultsHeader } from '@/components/practice/results-header';
import { SubmissionState } from '@/components/practice/submission-state';
import { TranscriptPanel } from '@/components/practice/transcript-panel';
import { practiceTokens } from '@/components/practice/tokens';
import { SafeAreaView } from 'react-native-safe-area-context';

type PreviewState = 'idle' | 'recording' | 'recorded' | 'processing' | 'results' | 'empty' | 'error' | 'permission';
const states: PreviewState[] = ['idle', 'recording', 'recorded', 'processing', 'results', 'empty', 'error', 'permission'];
const fixtures = new Map([['um', [{}, {}]], ['you know', [{}]]]);
const isPreviewState = (value: string | string[] | undefined): value is PreviewState => typeof value === 'string' && states.includes(value as PreviewState);

export default function Week1Preview() {
  const { state: requestedState } = useLocalSearchParams<{ state?: string }>();
  const [selectedState, setSelectedState] = useState<PreviewState>('idle');
  if (!__DEV__) return <Redirect href="/login" />;
  const presentationMode = isPreviewState(requestedState);
  const state = presentationMode ? requestedState : selectedState;
  const select = (next: PreviewState) => () => setSelectedState(next);
  const results = state === 'results' || state === 'empty';
  return <SafeAreaView edges={['top']} style={styles.safe}><Stack.Screen options={{ headerShown: false }} /><ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.badge}>DEVELOPMENT PREVIEW · FIXTURES ONLY</Text>
    {!presentationMode && <View style={styles.chooser}>{states.map(value => <Pressable key={value} onPress={select(value)} style={[styles.choice,state===value&&styles.choiceActive]}><Text style={[styles.choiceText,state===value&&styles.choiceTextActive]}>{value}</Text></Pressable>)}</View>}
    {results ? <View style={styles.results}><ResultsHeader /><FeedbackSummary fillerResults={state === 'empty' ? new Map() : fixtures} /><TranscriptPanel transcript={state === 'empty' ? '' : 'I started with the customer impact, then explained each migration step and why the team chose it.'} /><Pressable onPress={select('idle')} style={styles.primary}><Text style={styles.primaryText}>Practice again</Text></Pressable></View> : <>
    <Text style={styles.title}>{state === 'recording' ? 'You’re recording.' : 'Practice with focus.'}</Text>
    <PracticePromptCard />
    {state === 'idle' && <RecordingControl isRecording={false} onPress={select('recording')} />}
    {state === 'recording' && <RecordingControl isRecording elapsedSeconds={42} onPress={select('recorded')} />}
    {state === 'recorded' && <RecordingReviewBar submitting={false} onReplay={() => {}} onReplace={select('idle')} onSubmit={select('processing')} />}
    {state === 'processing' && <SubmissionState type="submitting" />}
    {state === 'error' && <SubmissionState type="error" message="Fixture: transcription could not be completed." onRetry={select('processing')} />}
    {state === 'permission' && <SubmissionState type="permission" message="Fixture: microphone permission was denied." onRetry={select('idle')} />}
    </>}
  </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:practiceTokens.color.canvas},screen:{flexGrow:1,paddingHorizontal:20,paddingBottom:32,gap:16},badge:{color:practiceTokens.color.error,...practiceTokens.type.label},title:{color:practiceTokens.color.text,...practiceTokens.type.display},chooser:{flexDirection:'row',flexWrap:'wrap',gap:8},choice:{paddingHorizontal:10,paddingVertical:8,borderWidth:1,borderColor:practiceTokens.color.border,borderRadius:12},choiceActive:{backgroundColor:practiceTokens.color.primary,borderColor:practiceTokens.color.primary},choiceText:{color:practiceTokens.color.textSecondary,...practiceTokens.type.label},choiceTextActive:{color:practiceTokens.color.onPrimary},results:{gap:16},primary:{minHeight:56,backgroundColor:practiceTokens.color.primary,borderRadius:12,alignItems:'center',justifyContent:'center'},primaryText:{color:practiceTokens.color.onPrimary,...practiceTokens.type.label}});
