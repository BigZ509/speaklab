import { File } from 'expo-file-system';
import { TranscriptResults } from "@/scripts/types/types";
export async function transcribeAudio(
  recordingAudio: string,
): Promise<TranscriptResults> {
  const formData = new FormData();
  // SDK 58 uses standard FormData; native URI descriptor objects are unsupported.
  const audio = recordingAudio.startsWith('blob:')
    ? await (await fetch(recordingAudio)).blob()
    : new File(recordingAudio);
  formData.append('audio', audio, 'recording.m4a');

  const response = await fetch(
    "https://speaklab-backend-production.up.railway.app/transcribe",
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    // Reject failed requests before analysis.
    throw new Error(`Transcription failed (HTTP ${response.status}). Please try again.`);
  }

  const data: unknown = await response.json();

  // Validate the transcript returned by the server.
  if (!isTranscriptResults(data)) {
    throw new Error("The server returned an invalid transcript. Please try again.");
  }

  return data;
}

function isTranscriptResults(data: unknown): data is TranscriptResults {
  if (typeof data !== "object" || data === null) return false;
  if (!("text" in data) || typeof data.text !== "string") return false;
  if (!("words" in data) || !Array.isArray(data.words)) return false;

  return data.words.every((word: unknown) =>
    typeof word === "object" && word !== null &&
    "word" in word && typeof word.word === "string" &&
    "start" in word && typeof word.start === "number" && Number.isFinite(word.start) &&
    "end" in word && typeof word.end === "number" && Number.isFinite(word.end) &&
    word.start >= 0 && word.end >= word.start
  );
}
