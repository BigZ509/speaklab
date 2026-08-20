
import { TranscriptResults } from "@/scripts/types/types";




type WpmObject = {
    wordCount: number,
    startTime: number,
    endTime: number,
    wpm: number
}



// Divide a transcript into balanced word windows and measure each window's
// speaking rate in words per minute.
export function pace(transcript: TranscriptResults): WpmObject[] {

        const windows : WpmObject[] = []; //assign type obj to variable
        
        const totalWords = transcript.words.length;

        if(totalWords === 0){
            return windows;
        }

        const totalCount = Math.round(totalWords / 15); // round answer
        
        const windowCount = Math.min(Math.max(totalCount, 3), 6); // takes max and floor capped at 3 or 6
        const chunkSize = Math.ceil(totalWords/windowCount);

        for(let i = 0; i < windowCount; i++){

            const startIndex = i * chunkSize; //0 -16
            const endIndex = startIndex + chunkSize; //current + 16
            const windowWords = transcript.words.slice(startIndex,endIndex);
            const wordCount = windowWords.length;

            if(wordCount === 0){
                break;
            }

            const startTime = windowWords[0].start
            const endTime = windowWords[wordCount - 1].end;

            if(startTime === endTime){
                console.error("bad script data");
                continue; // logs & move to next interation
            }

            const duration = endTime - startTime;
            
            const wpm = (wordCount/ duration) * 60;

            windows.push({
                wordCount,
                startTime,
                endTime,
                wpm
            })




        }

        return windows;

    }