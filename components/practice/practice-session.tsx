import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PracticePromptCard } from './practice-prompt-card';
import { practiceTokens as t } from './tokens';

/** Shared product composition; recording state and callbacks belong to its caller. */
export function PracticeSession({ children }: { children: ReactNode }) {
  return <View style={styles.session}>
    <Text style={styles.label}>SPEAKING PRACTICE</Text>
    <PracticePromptCard />
    <View style={styles.stage}>{children}</View>
  </View>;
}

const styles = StyleSheet.create({
  session: { flexGrow: 1 },
  label: {
    color: t.color.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2.6,
    textAlign: 'center',
    marginBottom: t.spacing.sm,
  },
  stage: { flexGrow: 1, justifyContent: 'center', gap: t.spacing.md },
});
