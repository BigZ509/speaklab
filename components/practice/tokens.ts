import { StyleSheet } from 'react-native';

export const practiceTokens = {
  color: {
    canvas: '#F8F6F1',
    surface: '#FFFFFF',
    surfaceSubtle: '#EEECE6',
    text: '#17171C',
    textSecondary: '#5B5B66',
    border: '#DEDCD5',
    primary: '#3346B8',
    onPrimary: '#FFFFFF',
    success: '#247A4A',
    error: '#B42318',
  },
  spacing: { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 40 },
  radius: { card: 12, prompt: 16, pill: 999 },
  recording: { controlSize: 128, stageSize: 244, timerSize: 56 },
  type: {
    display: { fontSize: 34, lineHeight: 40, fontWeight: '400' as const, fontFamily: 'Georgia' },
    title: { fontSize: 24, lineHeight: 30, fontWeight: '400' as const, fontFamily: 'Georgia' },
    body: { fontSize: 17, lineHeight: 25, fontWeight: '400' as const },
    label: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
    timer: { fontSize: 56, lineHeight: 64, fontWeight: '400' as const, fontFamily: 'Georgia' },
  },
} as const;

export const practiceSharedStyles = StyleSheet.create({
  card: {
    backgroundColor: practiceTokens.color.surface,
    borderColor: practiceTokens.color.border,
    borderRadius: practiceTokens.radius.card,
    borderWidth: 1,
  },
  label: {
    color: practiceTokens.color.textSecondary,
    ...practiceTokens.type.label,
  },
});
