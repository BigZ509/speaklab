import { StyleSheet, Text, View } from 'react-native';
import { practiceSharedStyles, practiceTokens } from './tokens';
export function TranscriptPanel({ transcript }: {transcript:string}) { const empty=!transcript.trim(); return <View style={[practiceSharedStyles.card,styles.card]}><Text style={practiceSharedStyles.label}>TRANSCRIPT</Text><Text selectable style={[styles.body,empty&&styles.empty]}>{empty?'No transcript text was returned. You can practice again.':transcript}</Text></View>; }
const styles=StyleSheet.create({card:{padding:practiceTokens.spacing.lg},body:{color:practiceTokens.color.text,...practiceTokens.type.body,marginTop:practiceTokens.spacing.md},empty:{color:practiceTokens.color.textSecondary}});
