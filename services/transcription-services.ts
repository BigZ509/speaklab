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
