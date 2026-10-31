import { StyleSheet, Text, View } from 'react-native';
import { practiceTokens } from './tokens';

export function ResultsHeader() {
  return <View style={styles.wrap}>
    <Text style={styles.eyebrow}>YOUR RESPONSE</Text>
    <Text style={styles.title}>Practice review.</Text>
    <View style={styles.rule} />
  </View>;
}

const styles = StyleSheet.create({
  wrap: { paddingTop: practiceTokens.spacing.xs },
  eyebrow: { color: practiceTokens.color.primary, ...practiceTokens.type.label, letterSpacing: 1.2 },
  title: { color: practiceTokens.color.text, ...practiceTokens.type.display, marginTop: practiceTokens.spacing.xs },
  rule: { backgroundColor: practiceTokens.color.primary, height: 3, marginTop: practiceTokens.spacing.md, width: 40 },
});
