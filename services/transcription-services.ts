import useAudioRecording from "@/hooks/use-audio-recording";
import OpenAI from "openai";


const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export async function uploadRecording(recordingAudio: string) {
  const fileData = await fetch(recordingAudio);
  if (!fileData.ok) {
    console.error("error loading file", fileData);
    return;
  }
  const blob = await fileData.blob();
  return blob;
}

export async function transcribeAudio(blob: Blob) {
  const openai = new OpenAI({ apiKey: API_KEY });
  const transcription = await openai.audio.transcriptions.create({
    file: blob,
    model: "gpt-transcribe",
  });

  console.log(transcription.text);
  return transcription.text;
  
}
