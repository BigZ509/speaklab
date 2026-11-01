import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { practiceTokens as t } from './tokens';

export function RecordingControl({ isRecording, elapsedSeconds = 0, onPress }: {
  isRecording: boolean;
  elapsedSeconds?: number;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  // Stay still until the asynchronous system preference is known.
  const [reduceMotion, setReduceMotion] = useState(true);
  const { width } = useWindowDimensions();
  const stageSize = Math.min(t.recording.stageSize, width - 48);
  const scale = stageSize / t.recording.stageSize;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) setReduceMotion(enabled);
    }).catch(() => { /* Keep the instrument still if the preference is unavailable. */ });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (!isRecording || reduceMotion) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.035, duration: 1_400, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 1_400, useNativeDriver: true }),
    ]));
    loop.start();
    return () => { loop.stop(); pulse.setValue(1); };
  }, [isRecording, pulse, reduceMotion]);

  const label = isRecording ? 'Stop recording' : 'Start recording';
  const time = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`;
  const circle = (size: number) => ({ width: size * scale, height: size * scale, borderRadius: size * scale / 2 });

  return <View style={styles.wrap}>
    {/* Already display-sized; scaling its line box creates gaps at accessibility sizes. */}
    <Text accessibilityLabel={`Recording time ${time}`} style={styles.timer} allowFontScaling={false} adjustsFontSizeToFit minimumFontScale={0.5} numberOfLines={1}>{time}</Text>
    <View accessibilityLiveRegion="polite" style={styles.statusRow}>
      {isRecording && <View style={styles.statusDot} />}
      <Text style={styles.status}>{isRecording ? 'Recording…' : 'Ready when you are'}</Text>
    </View>
    <View style={[styles.stage, { width: stageSize, height: stageSize }]}>
      <View pointerEvents="none" accessible={false} style={[styles.ring, styles.outerRing, circle(t.recording.stageSize)]} />
      <Animated.View pointerEvents="none" accessible={false} style={[styles.ring, styles.middleRing, circle(t.recording.middleSize), { transform: [{ scale: pulse }] }]} />
      <View pointerEvents="none" accessible={false} style={[styles.ring, styles.innerRing, circle(t.recording.innerSize)]} />
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
        style={({ pressed }) => [styles.button, circle(t.recording.controlSize), pressed && styles.pressed]}>
        <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {isRecording ? <View style={styles.stopGlyph} /> : <View style={styles.microphone}>
            <View style={styles.micCapsule} /><View style={styles.micCradle} /><View style={styles.micStem} /><View style={styles.micFoot} />
          </View>}
        </View>
      </Pressable>
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingBottom: t.spacing.md },
  timer: { color: t.color.text, ...t.recording.timer, fontVariant: ['tabular-nums'], letterSpacing: -4, width: '100%', textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.spacing.xs, marginTop: t.spacing.xxs },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: t.recording.cobalt },
  status: { flexShrink: 1, textAlign: 'center', color: t.color.textSecondary, fontSize: 15, lineHeight: 22 },
  stage: { alignItems: 'center', justifyContent: 'center', marginTop: t.spacing.md },
  ring: { position: 'absolute' },
  outerRing: { backgroundColor: t.recording.outerRing },
  middleRing: { backgroundColor: t.recording.middleRing },
  innerRing: { backgroundColor: t.recording.innerRing },
  button: { alignItems: 'center', backgroundColor: t.recording.cobalt, justifyContent: 'center' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },
  stopGlyph: { width: 27, height: 27, borderRadius: 5, backgroundColor: t.color.onPrimary },
  microphone: { width: 30, height: 42, alignItems: 'center' },
  micCapsule: { position: 'absolute', top: 0, width: 12, height: 25, borderRadius: 6, backgroundColor: t.color.onPrimary },
  micCradle: { position: 'absolute', top: 13, width: 26, height: 21, borderWidth: 2.5, borderTopWidth: 0, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, borderColor: t.color.onPrimary },
  micStem: { position: 'absolute', top: 33, width: 2.5, height: 7, backgroundColor: t.color.onPrimary },
  micFoot: { position: 'absolute', bottom: 0, width: 14, height: 2.5, borderRadius: 2, backgroundColor: t.color.onPrimary },
  actionLabel: { color: t.color.text, ...t.type.label, marginTop: t.spacing.md, textAlign: 'center' },
});
