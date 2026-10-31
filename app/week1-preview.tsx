import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FeedbackSummary } from '@/components/practice/feedback-summary';
import { PracticePromptCard } from '@/components/practice/practice-prompt-card';
import { RecordingControl } from '@/components/practice/recording-control';
import { RecordingReviewBar } from '@/components/practice/recording-review-bar';
import { SubmissionState } from '@/components/practice/submission-state';
import { TranscriptPanel } from '@/components/practice/transcript-panel';
import { practiceTokens } from '@/components/practice/tokens';

type PreviewState = 'idle' | 'recording' | 'recorded' | 'processing' | 'results' | 'empty' | 'error' | 'permission';
const fixtures = new Map([['um', [{}, {}]], ['you know', [{}]]]);

export default function Week1Preview() {
  const [state, setState] = useState<PreviewState>('idle');
  if (!__DEV__) return <Redirect href="/login" />;
  const select = (next: PreviewState) => () => setState(next);
  const results = state === 'results' || state === 'empty';
  return <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.badge}>DEVELOPMENT PREVIEW · FIXTURES ONLY</Text>
    <Text style={styles.title}>{results ? 'Practice review.' : state === 'recording' ? 'You’re recording.' : 'Practice with focus.'}</Text>
    <View style={styles.chooser}>{(['idle','recording','recorded','processing','results','empty','error','permission'] as PreviewState[]).map(value => <Pressable key={value} onPress={select(value)} style={[styles.choice,state===value&&styles.choiceActive]}><Text style={[styles.choiceText,state===value&&styles.choiceTextActive]}>{value}</Text></Pressable>)}</View>
    {!results && <PracticePromptCard />}
    {state === 'idle' && <RecordingControl isRecording={false} onPress={select('recording')} />}
    {state === 'recording' && <RecordingControl isRecording onPress={select('recorded')} />}
    {state === 'recorded' && <RecordingReviewBar submitting={false} onReplay={() => {}} onReplace={select('idle')} onSubmit={select('processing')} />}
    {state === 'processing' && <SubmissionState type="submitting" />}
    {state === 'error' && <SubmissionState type="error" message="Fixture: transcription could not be completed." onRetry={select('processing')} />}
    {state === 'permission' && <SubmissionState type="permission" message="Fixture: microphone permission was denied." onRetry={select('idle')} />}
    {results && <View style={styles.results}><FeedbackSummary fillerResults={state === 'empty' ? new Map() : fixtures} /><TranscriptPanel transcript={state === 'empty' ? '' : 'I started with the customer impact, then explained each migration step and why the team chose it.'} /><Pressable onPress={select('idle')} style={styles.primary}><Text style={styles.primaryText}>Practice again</Text></Pressable></View>}
  </ScrollView>;
}
const styles=StyleSheet.create({screen:{backgroundColor:practiceTokens.color.canvas,flexGrow:1,padding:20,gap:16},badge:{color:practiceTokens.color.error,...practiceTokens.type.label},title:{color:practiceTokens.color.text,...practiceTokens.type.display},chooser:{flexDirection:'row',flexWrap:'wrap',gap:8},choice:{paddingHorizontal:10,paddingVertical:8,borderWidth:1,borderColor:practiceTokens.color.border,borderRadius:12},choiceActive:{backgroundColor:practiceTokens.color.primary,borderColor:practiceTokens.color.primary},choiceText:{color:practiceTokens.color.textSecondary,...practiceTokens.type.label},choiceTextActive:{color:practiceTokens.color.onPrimary},results:{gap:16},primary:{minHeight:56,backgroundColor:practiceTokens.color.primary,borderRadius:12,alignItems:'center',justifyContent:'center'},primaryText:{color:practiceTokens.color.onPrimary,...practiceTokens.type.label}});
