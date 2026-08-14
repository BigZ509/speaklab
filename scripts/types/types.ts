

export type TranscriptResults = {
    text: string;
    words: Array<{
      start: number;
      end: number;
      word: string;
    }>;
  };

export type MetricResults = {
    label: string,  // filler words
    raw: number,    // e.g 14
    target: number, // e.g 5
    score: number    // 0 - 10 normalized

}