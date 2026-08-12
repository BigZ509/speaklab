import useAudioRecording from "@/hooks/use-audio-recording";
import { TranscriptResults } from "@/hooks/use-audio-recording";

const{transcriptText} = useAudioRecording()


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

  export function findAmbigous(transcript: TranscriptResults){
    
        for(const [index,item] of transcript.words.entries()){
            if(ambigousSet.has(item.word)){
                console.log("this word is flagged: ", item.word);
                
            }
        }
    }
   
    
 

 function findUnambigous(){


 }

 function analyzeAmbiguousContext(){


 }

 
