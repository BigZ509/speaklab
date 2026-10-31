import { StyleSheet, Text, View } from 'react-native';
import { practiceSharedStyles, practiceTokens } from './tokens';
export const PRACTICE_PROMPT = 'Tell me about a time you had to explain a complex idea clearly.';
export function PracticePromptCard() { return <View style={[practiceSharedStyles.card, styles.card]}><Text style={practiceSharedStyles.label}>TODAY’S PROMPT</Text><Text style={styles.prompt}>{PRACTICE_PROMPT}</Text><Text style={styles.hint}>Take a moment to organize your answer, then record when you’re ready.</Text></View>; }
const styles = StyleSheet.create({ card:{ padding:practiceTokens.spacing.lg, borderRadius:practiceTokens.radius.prompt, borderColor:'#E7E2D8' }, prompt:{ color:practiceTokens.color.text, marginTop:practiceTokens.spacing.sm, ...practiceTokens.type.title }, hint:{ color:practiceTokens.color.textSecondary, marginTop:practiceTokens.spacing.md, ...practiceTokens.type.body } });
