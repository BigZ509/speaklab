export type FillerResults = ReadonlyMap<string, ReadonlyArray<unknown>>;

export function countFillerOccurrences(fillerResults: FillerResults | null | undefined): number {
  if (!fillerResults) return 0;

  return Array.from(fillerResults.values()).reduce(
    (total, occurrences) => total + occurrences.length,
    0,
  );
}

export function fillerSummaryCopy(count: number): string {
  if (count === 0) return 'No filler words detected in this response.';
  return `${count} filler ${count === 1 ? 'word' : 'words'} detected in this response.`;
}
