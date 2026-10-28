import { transcribeAudio } from "@/services/transcription-services";
import { errorHandling } from "@/utils/handle-error";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { fillerAnalyzer } from "@/speechEngine/fillers";
import { TranscriptResults } from "@/scripts/types/types";

export default function useAudioRecording() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingAudio, setRecordingAudio] = useState<string | null>(null);
  

  const player = useAudioPlayer(recordingAudio);
  const audioStatus = useAudioPlayerStatus(player);

  // Track submission progress and errors.
  const [submissionStatus, setSubmissionStatus] =
    useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [fillerResults, setFillerResults] =
    useState<ReturnType<typeof fillerAnalyzer> | null>(null);
  const submissionInFlight = useRef(false);
  const isSubmitted = submissionStatus === "success";
  const [transcriptText, setTranscriptText] =
    useState<TranscriptResults | null>(null);
  const startRecording = async () => {
    // Keep the recording stable during submission.
    if (submissionInFlight.current) return;
    try {
      setRecordingAudio(null);
      setTranscriptText(null);
      setFillerResults(null);
      setSubmissionError(null);
      setSubmissionStatus("idle");
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (error) {
      if (error instanceof Error) {
        errorHandling("Recording Error", error);
      }
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      setRecordingAudio(audioRecorder.uri);
      console.log(audioStatus.isLoaded);
      console.log(recordingAudio);
      setIsRecording(false);
    } catch (error) {
      if (error instanceof Error) {
        errorHandling("Failed to stop recording", error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      }
      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const replayRecording = () => {
    if (!audioStatus.isLoaded) {
      Alert.alert("audio is not ready");
    } else {
      player.play();
    }
  };

  const submitRecording = async () => {
    // Block duplicate taps before the next render.
    if (!recordingAudio || isRecording || submissionInFlight.current) return;
    submissionInFlight.current = true;
    setSubmissionStatus("submitting");
    setSubmissionError(null);
    setTranscriptText(null);
    setFillerResults(null);

    try {
      const transcript = await transcribeAudio(recordingAudio);
      const fillers = fillerAnalyzer(transcript);
      // Save results after analysis succeeds.
      setTranscriptText(transcript);
      setFillerResults(fillers);
      setSubmissionStatus("success");
    } catch (error) {
      const failure = error instanceof Error
        ? error
        : new Error("Could not process your recording. Please try again.");
      setSubmissionError(failure.message);
      setSubmissionStatus("error");
      errorHandling("Could not submit recording", failure);
    } finally {
      // Allow another submission or retry.
      submissionInFlight.current = false;
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    recordingAudio,
    replayRecording,
    submitRecording,
    audioStatus,
    transcriptText,
    isSubmitted,
    submissionStatus,
    submissionError,
    fillerResults,
    
  };
}
