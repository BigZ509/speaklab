import { TranscriptResults } from "@/scripts/types/types";
export async function transcribeAudio(
  recordingAudio: string,
): Promise<TranscriptResults> {
  const formData = new FormData();
  formData.append("audio", {
    uri: recordingAudio,
    name: "recording.m4a",
    type: "audio/m4a",
  } as any);

  const response = await fetch(
    "https://speaklab-backend-production.up.railway.app/transcribe",
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    console.error("Transcription request failed", response.status);
  }

  const data = await response.json();

  return data;
}
