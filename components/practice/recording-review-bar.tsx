import { Pressable, StyleSheet, Text, View } from 'react-native';
import { practiceTokens } from './tokens';
export function RecordingReviewBar({ submitting, onReplay, onReplace, onSubmit }: { submitting: boolean; onReplay: () => void; onReplace: () => void; onSubmit: () => void }) {
  return <View style={styles.wrap}>
    <Text style={styles.eyebrow}>RESPONSE CAPTURED</Text>
    <View style={styles.secondary}>
      <Pressable accessibilityRole="button" disabled={submitting} onPress={onReplay}><Text style={styles.link}>Replay</Text></Pressable>
      <View style={styles.divider} />
      <Pressable accessibilityRole="button" disabled={submitting} onPress={onReplace}><Text style={styles.link}>Replace</Text></Pressable>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={submitting ? 'Reviewing response' : 'Review my response'} disabled={submitting} onPress={onSubmit} style={[styles.primary, submitting && styles.disabled]}><Text style={styles.primaryText}>{submitting ? 'Reviewing response…' : 'Review my response'}</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({
  wrap: { backgroundColor: practiceTokens.color.surface, borderColor: practiceTokens.color.border, borderRadius: practiceTokens.radius.prompt, borderWidth: 1, gap: practiceTokens.spacing.sm, padding: practiceTokens.spacing.lg },
  eyebrow: { color: practiceTokens.color.textSecondary, ...practiceTokens.type.label, letterSpacing: 1 },
  secondary: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: practiceTokens.spacing.xs },
  divider: { backgroundColor: practiceTokens.color.border, height: 18, marginHorizontal: practiceTokens.spacing.md, width: 1 },
  link: { color: practiceTokens.color.primary, ...practiceTokens.type.label, padding: practiceTokens.spacing.sm },
  primary: { alignItems: 'center', backgroundColor: practiceTokens.color.primary, borderRadius: practiceTokens.radius.card, justifyContent: 'center', minHeight: 56 },
  disabled: { opacity: .55 },
  primaryText: { color: practiceTokens.color.onPrimary, ...practiceTokens.type.label },
});
