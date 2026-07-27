import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorder,
    useAudioRecorderState,
} from "expo-audio";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { errorHandling } from "@/utils/handle-error";

export default function useAudioRecording() {
  
 

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const startRecording = async () => {
    
    try{
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();

    }
    catch(error){
        if(error instanceof Error){
            errorHandling("Recording Error",error);
        }    
    }
       
  };

  const stopRecording = async () => {
    try{
        await audioRecorder.stop();
        console.log(audioRecorder.uri);
    }
    catch(error){
        if(error instanceof Error){
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

  return {startRecording, stopRecording, recorderState };
}
