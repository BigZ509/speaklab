import { TranscriptResults } from "@/scripts/types/types";
import { useState } from "react";



 export type TranscriptWords = {
    word:string,
    start: number,
    end: number
}

 export type Occurence = {
    start: number,
    end: number,
 }



function getWord(word: TranscriptWords[], index: number):TranscriptWords | undefined{

    return word[index];
}

export function fillerAnalyzer(transcript: TranscriptResults){
  const fillerOccurence = new Map<string, Occurence[]>();

  findAmbigous(transcript, fillerOccurence);   // hand the notebook to person 1
  findUnambigous(); // hand the same notebook to person 2
  
  return fillerOccurence; // read the final result, after both wrote in it

}

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

   function findAmbigous(transcript: TranscriptResults, fillerOccurence: Map<string, Occurence[]>){
  
    let fillerExist = false;
        
        for(const [index,item] of transcript.words.entries()){
            fillerExist = false;
            const  prevWord = getWord(transcript.words, index - 1);
            const nextWord = getWord(transcript.words, index + 1);
            if(ambigousSet.has(item.word)){
                console.log("this word is flagged: ", item.word);
                if(prevWord){
                    if(unambigousSet.has(prevWord.word)){ // if prev is in obvfiller hashset
                        console.log("This is obvious caught by prev check filler: ", item.word);
                        
                        if(!fillerOccurence.has(item.word)){ // check if words in hashmap before adding
                            fillerOccurence.set(item.word,[{start: item.start, end: item.end}]);
                        }else{
                            fillerOccurence.get(item.word)?.push({start: item.start, end: item.end});
                        }

                        fillerExist = true;
                    }
                }
                //bascially an or situation
                if(nextWord && !fillerExist){ // only run if its within bounds and fillerexist is false
                    if(unambigousSet.has(nextWord.word)){
                        console.log("caguht by next word check: ", item.word);
                        if(!fillerOccurence.has(item.word)){
                            fillerOccurence.set(item.word,[{start: item.start, end: item.end}]); 
                        }else{
                            fillerOccurence.get(item.word)?.push({start: item.start, end: item.end});
                        }
                    }
                }
                
            }

            
        }
        return fillerOccurence;
    }
   
    
 

 function findUnambigous(){



 }

 
