import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { practiceTokens } from './tokens';

export function RecordingControl({
  isRecording,
  elapsedSeconds = 0,
  onPress,
}: {
  isRecording: boolean;
  elapsedSeconds?: number;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (!isRecording || reduceMotion) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.045, duration: 1_100, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 1_100, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [isRecording, pulse, reduceMotion]);

  const label = isRecording ? 'Stop recording' : 'Start recording';
  const time = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

  return <View style={styles.wrap}>
    <Text
      accessibilityLiveRegion="polite"
      accessibilityLabel={isRecording ? `Recording time ${time}` : 'Ready to record'}
      style={styles.timer}
    >
      {isRecording ? time : 'Ready'}
    </Text>
    <Text style={styles.status}>{isRecording ? 'Recording in progress' : 'When you are, begin your response.'}</Text>
    <View style={styles.stage}>
      <View style={[styles.ring, styles.outerRing, isRecording && styles.outerActive]} />
      <Animated.View style={[styles.ring, styles.middleRing, isRecording && styles.middleActive, { transform: [{ scale: pulse }] }]} />
      <View style={[styles.ring, styles.innerRing, isRecording && styles.innerActive]} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={[styles.button, isRecording && styles.stop]}
      >
        <Text style={styles.text}>{isRecording ? 'Stop' : 'Record'}</Text>
      </Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: practiceTokens.spacing.lg, paddingBottom: practiceTokens.spacing.xxl },
  timer: { color: practiceTokens.color.text, ...practiceTokens.type.timer, fontVariant: ['tabular-nums'], letterSpacing: -1.5 },
  status: { color: practiceTokens.color.textSecondary, ...practiceTokens.type.label, marginTop: practiceTokens.spacing.xxs, textAlign: 'center' },
  stage: { alignItems: 'center', height: practiceTokens.recording.stageSize, justifyContent: 'center', marginTop: practiceTokens.spacing.md, width: practiceTokens.recording.stageSize },
  ring: { borderRadius: practiceTokens.radius.pill, position: 'absolute' },
  outerRing: { backgroundColor: '#EDF0FD', height: practiceTokens.recording.stageSize, width: practiceTokens.recording.stageSize },
  middleRing: { backgroundColor: '#D9E0FA', height: 202, width: 202 },
  innerRing: { backgroundColor: '#BDCAF5', height: 160, width: 160 },
  outerActive: { backgroundColor: '#E8ECFC' },
  middleActive: { backgroundColor: '#CED8FA' },
  innerActive: { backgroundColor: '#B7C5F6' },
  button: { alignItems: 'center', backgroundColor: practiceTokens.color.primary, borderColor: '#EFF1FD', borderRadius: practiceTokens.recording.controlSize / 2, borderWidth: 7, height: practiceTokens.recording.controlSize, justifyContent: 'center', width: practiceTokens.recording.controlSize },
  stop: { backgroundColor: '#24242B', borderColor: '#E6E8F4' },
  text: { color: practiceTokens.color.onPrimary, ...practiceTokens.type.label },
});
