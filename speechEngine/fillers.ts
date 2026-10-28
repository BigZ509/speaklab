import { TranscriptResults } from "@/scripts/types/types";

export type TranscriptWords = { word: string; start: number; end: number };
export type Occurence = { start: number; end: number };

const unambigousSet = new Set([
    //obvious fillers
    "uh",
    "um",
    "umm",
    "uhh",
    "uhhh",
    "er",
    "err",
    "erm",
    "hmm",
    "hmmm",
    "mm",
    "mhm"
 ]);
const ambigousSet = new Set([
    //need context checked
    "like",
    "so",
    "well",
    "actually",
    "basically",
    "literally",
    "right",
    "okay",
    "ok",
    "you know",
    "i mean",
    "kind of",
    "sort of",
    "just",
    "really",
    "maybe",
    "probably",
    "anyway",
    "anyways",
    "now",
    "then",
    "well then",
    "you see"
 ]);


export function fillerAnalyzer(transcript: TranscriptResults) {
  const occurrences = new Map<string, Occurence[]>();
  // Keep timestamps while normalizing punctuation and case.
  const words = transcript.words.map(item => ({
    ...item,
    word: item.word.trim().toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, ""),
  }));
  const phrases = Array.from(ambigousSet, phrase => phrase.split(" "))
    .sort((a, b) => b.length - a.length);

  const add = (word: string, start: number, end: number) => {
    const matches = occurrences.get(word) ?? [];
    matches.push({ start, end });
    occurrences.set(word, matches);
  };

  for (let i = 0; i < words.length; i++) {
    const item = words[i];
    if (unambigousSet.has(item.word)) {
      add(item.word, item.start, item.end);
      continue;
    }
    // Prefer full phrases and keep the existing adjacent-filler rule.
    const phrase = phrases.find(parts =>
      parts.every((part, offset) => words[i + offset]?.word === part) &&
      (unambigousSet.has(words[i - 1]?.word) ||
       unambigousSet.has(words[i + parts.length]?.word))
    );
    if (phrase) {
      add(phrase.join(" "), item.start, words[i + phrase.length - 1].end);
      i += phrase.length - 1;
    }
  }
  return occurrences;
}
