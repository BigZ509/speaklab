import { StyleSheet, Text, View } from 'react-native';
import { countFillerOccurrences, FillerResults, fillerSummaryCopy } from './feedback';
import { practiceSharedStyles, practiceTokens } from './tokens';
export function FeedbackSummary({ fillerResults }: {fillerResults:FillerResults|null}) { const count=countFillerOccurrences(fillerResults); return <View style={[practiceSharedStyles.card,styles.card]}><Text style={practiceSharedStyles.label}>FILLER WORDS</Text><Text style={styles.count}>{count}</Text><Text style={styles.copy}>{fillerSummaryCopy(count)}</Text></View>; }
const styles=StyleSheet.create({card:{padding:practiceTokens.spacing.md,borderLeftWidth:4,borderLeftColor:practiceTokens.color.primary},count:{color:practiceTokens.color.text,...practiceTokens.type.display,marginTop:practiceTokens.spacing.xs},copy:{color:practiceTokens.color.textSecondary,...practiceTokens.type.body}});
