import { TranscriptResults } from "@/scripts/types/types";

export type TranscriptWords = {
    word: string;
    start: number;
    end: number;
};
export type Occurence = { start: number; end: number };

const unambigousSet = new Set([
    // obvious fillers
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
    // need context checked
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


function cleanWord(word: string): string {
    return word.trim().toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, "");
}

function cleanTranscript(transcript: TranscriptResults): TranscriptWords[] {
    const words: TranscriptWords[] = [];

    for (const item of transcript.words) {
        words.push({
            word: cleanWord(item.word),
            start: item.start,
            end: item.end
        });
    }

    return words;
}

function addFiller(
    fillerOccurence: Map<string, Occurence[]>,
    word: string,
    start: number,
    end: number
) {
    if (!fillerOccurence.has(word)) {
        fillerOccurence.set(word, []);
    }

    fillerOccurence.get(word)?.push({ start, end });
}

function findUnambigous(
    words: TranscriptWords[],
    fillerOccurence: Map<string, Occurence[]>
) {
    for (const word of words) {
        if (unambigousSet.has(word.word)) {
            addFiller(fillerOccurence, word.word, word.start, word.end);
        }
    }
}

function getPhraseAt(
    words: TranscriptWords[],
    index: number,
    phrase: string[]
): TranscriptWords[] | undefined {
    const phraseWords: TranscriptWords[] = [];

    for (let offset = 0; offset < phrase.length; offset++) {
        const word = words[index + offset];

        if (!word || word.word !== phrase[offset]) {
            return undefined;
        }

        phraseWords.push(word);
    }

    return phraseWords;
}

function hasObviousFillerBeside(
    words: TranscriptWords[],
    startIndex: number,
    phraseLength: number
): boolean {
    const wordBefore = words[startIndex - 1];
    const wordAfter = words[startIndex + phraseLength];

    return Boolean(
        (wordBefore && unambigousSet.has(wordBefore.word)) ||
        (wordAfter && unambigousSet.has(wordAfter.word))
    );
}

function findAmbigous(
    words: TranscriptWords[],
    fillerOccurence: Map<string, Occurence[]>
) {
    const phrases = Array.from(ambigousSet).sort(
        (first, second) => second.split(" ").length - first.split(" ").length
    );

    for (let index = 0; index < words.length; index++) {
        for (const phrase of phrases) {
            const phraseWords = getPhraseAt(words, index, phrase.split(" "));

            if (!phraseWords) {
                continue;
            }

            if (!hasObviousFillerBeside(words, index, phraseWords.length)) {
                continue;
            }

            addFiller(
                fillerOccurence,
                phrase,
                phraseWords[0].start,
                phraseWords[phraseWords.length - 1].end
            );
            index += phraseWords.length - 1;
            break;
        }
    }
}

export function fillerAnalyzer(transcript: TranscriptResults) {
    const fillerOccurence = new Map<string, Occurence[]>();
    const words = cleanTranscript(transcript);

    // Obvious fillers are always recorded.
    findUnambigous(words, fillerOccurence);

    // Ambiguous fillers need an obvious filler next to them.
    findAmbigous(words, fillerOccurence);

    return fillerOccurence;
}
