import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { practiceSharedStyles, practiceTokens } from './tokens';
export function TranscriptPanel({ transcript }: { transcript: string }) {
  const empty = !transcript.trim();
  return <View style={[practiceSharedStyles.card, styles.card]}>
    <Text style={practiceSharedStyles.label}>TRANSCRIPT</Text>
    <ScrollView nestedScrollEnabled style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Text selectable style={[styles.body, empty && styles.empty]}>{empty ? 'No transcript text was returned. You can practice again.' : transcript}</Text>
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: practiceTokens.spacing.lg },
  scroll: { maxHeight: 320, marginTop: practiceTokens.spacing.md },
  scrollContent: { paddingRight: practiceTokens.spacing.xs },
  body: { color: practiceTokens.color.text, ...practiceTokens.type.body },
  empty: { color: practiceTokens.color.textSecondary },
});
