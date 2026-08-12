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
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { findAmbigous } from "@/speechEngine/fillers";
export type TranscriptResults = {
    text: string;
    words: Array<{
      start: number;
      end: number;
      word: string;
    }>;
  };

export default function useAudioRecording() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingAudio, setRecordingAudio] = useState<string | null>(null);
  

  const player = useAudioPlayer(recordingAudio);
  const audioStatus = useAudioPlayerStatus(player);

  const [isSubmitted, setIsSubmiteed] = useState(false);
  const [transcriptText, setTranscriptText] =
    useState<TranscriptResults | null>(null);
  const startRecording = async () => {
    try {
      setRecordingAudio(null);
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
    console.log("submit press");
    setIsSubmiteed(false);
    if (recordingAudio !== null) {
      try {
        const transcript = await transcribeAudio(recordingAudio);
        findAmbigous(transcript);
        
        
      } catch (error) {
        if (error instanceof Error) {
          console.log(error);
          errorHandling("Could not load file", error);
        }
      }
      setIsSubmiteed(true);
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
    
  };
}
