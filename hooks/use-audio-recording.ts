import { errorHandling } from "@/utils/handle-error";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus
} from "expo-audio";
import { useEffect, useState } from "react";
import { Alert } from "react-native";


export default function useAudioRecording() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingAudio, setRecordingAudio] = useState<string | null>(
    null,
  );
  
  const player = useAudioPlayer(recordingAudio);
  const audioStatus = useAudioPlayerStatus(player);
 

  const startRecording = async () => {
    try {
      setRecordingAudio(null);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      
    } 
    catch (error) {
      if (error instanceof Error) {
        errorHandling("Recording Error", error);
      }
    }
  };

  const stopRecording = async () => {
    try {
       await audioRecorder.stop();
      setRecordingAudio(audioRecorder.uri);
      console.log(audioStatus.isLoaded)
      console.log(recordingAudio);
      setIsRecording(false);
    }
     catch (error) {
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

  const replayRecording = () =>{
    if(!audioStatus.isLoaded){
      Alert.alert("audio is not ready")
    }
    else{
      player.play();
    }
  };
    

  const submitRecording = async () => {
    try{

    }
    catch(error){

    }
  }
    

  return { isRecording, startRecording, stopRecording,recordingAudio, replayRecording,submitRecording,audioStatus};
}
