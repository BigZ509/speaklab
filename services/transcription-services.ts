import useAudioRecording from "@/hooks/use-audio-recording";
import OpenAI from "openai";



export async function transcribeAudio(recordingAudio: string){

  const formData = new FormData();
  formData.append('audio',{uri: recordingAudio,
                  name:'recording.m4a',
                  type: 'audio/m4a',
                }as any
              );

  const response = await fetch('https://speaklab-backend-production.up.railway.app/transcribe', {
    method: 'POST',
    body: formData,
  });

  if(!response.ok){
    console.error('Transcription request failed', response.status);
    return;
  }

  const data = await response.json();
  console.log(data.text)
  return data.text;
}