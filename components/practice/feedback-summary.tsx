import { StyleSheet, Text, View } from 'react-native';
import { countFillerOccurrences, FillerResults, fillerSummaryCopy } from './feedback';
import { practiceSharedStyles, practiceTokens } from './tokens';
export function FeedbackSummary({ fillerResults }: { fillerResults: FillerResults | null }) {
  const count = countFillerOccurrences(fillerResults);
  const details = Array.from(fillerResults?.entries() ?? []);
  return <View style={[practiceSharedStyles.card, styles.card]}>
    <View style={styles.summaryRule} />
    <Text style={practiceSharedStyles.label}>FILLER WORDS</Text>
    <View style={styles.summary}>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.copy}>{fillerSummaryCopy(count)}</Text>
    </View>
    {details.length > 0 && <View style={styles.breakdown}>{details.map(([word, occurrences]) => <Text key={word} style={styles.item}>{word} · {occurrences.length}</Text>)}</View>}
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: practiceTokens.spacing.lg },
  summaryRule: { backgroundColor: practiceTokens.color.primary, height: 3, marginBottom: practiceTokens.spacing.md, width: 28 },
  summary: { flexDirection: 'row', alignItems: 'baseline', gap: practiceTokens.spacing.sm, marginTop: practiceTokens.spacing.xs },
  count: { color: practiceTokens.color.text, ...practiceTokens.type.title },
  copy: { color: practiceTokens.color.textSecondary, ...practiceTokens.type.body, flex: 1 },
  breakdown: { flexDirection: 'row', flexWrap: 'wrap', gap: practiceTokens.spacing.xs, marginTop: practiceTokens.spacing.md },
  item: { color: practiceTokens.color.text, backgroundColor: practiceTokens.color.surfaceSubtle, borderRadius: practiceTokens.radius.pill, paddingHorizontal: 10, paddingVertical: 6, ...practiceTokens.type.label },
});
