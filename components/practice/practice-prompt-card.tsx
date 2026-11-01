import { StyleSheet, Text, View } from 'react-native';
import { practiceTokens as t } from './tokens';

export const PRACTICE_PROMPT = 'Tell me about a time you had to explain a complex idea clearly.';

export function PracticePromptCard() {
  return <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.editorialRule} />
      <Text style={styles.label}>{"TODAY\u2019S PROMPT"}</Text>
    </View>
    <Text accessibilityRole="header" style={styles.prompt}>{PRACTICE_PROMPT}</Text>
  </View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: t.recording.promptSurface,
    borderColor: t.recording.promptBorder,
    borderRadius: t.radius.prompt,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm,
    marginHorizontal: t.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editorialRule: {
    backgroundColor: t.recording.cobalt,
    height: 2,
    width: 16,
  },
  label: {
    color: t.color.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.8,
  },
  prompt: {
    color: t.color.text,
    fontFamily: 'Georgia',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 24,
    marginTop: 6,
  },
});
