import { parseToObjects } from "./modules/lineParser";
import {Rig} from "./modules/rig";

const rig = new Rig(12,
    async (d) => {
        const lines = parseToObjects(d, /([#*?.]+) ([\d,]+)/, (s) =>{
            return {
                pattern: s[1] + '?' + s[1] + '?' + s[1] + '?' + s[1] + '?' + s[1],
                summary: (s[2] + ',' + s[2] + ',' + s[2] + ',' + s[2] + ',' + s[2]).split(',').filter(s=>s).map(Number)
            };

        });
        const optionsPerLine = lines.map(nrOfOptions);
        return optionsPerLine.reduce((a,v)=> a+v, 0);
    }
);
let cache = {};
function nrOfOptions(value: { pattern: string; summary: number[]; }, index: number): number {
    console.log(`Starting on nr ${index} (${value.pattern})`);
    cache = {};
    const charArray = value.pattern.split('');
    const length = value.pattern.length;
    const possiblePatterns = getPatterns(length, value.summary, charArray);
    return possiblePatterns;

}
function getPatterns(totalSize, blocks: number[], 
        charArray: string[]){
    const combinations = getGapSizeCombinations(totalSize, [0, ...blocks.filter((v,i)=> i>0).map(b=>1), 0], blocks, charArray);
    return combinations;
}
function getGapSizeCombinations(remainingSpace: number, minimalSizes: number[], 
        blocks: number[], charArray: string[]): number {
    const key = `${remainingSpace}_${minimalSizes.join('|')}`;
    if(key in cache) return cache[key];
    let result: number = 0;
    if(remainingSpace < 0) return 0;

    if(minimalSizes.length == 1){
        if(fits(remainingSpace, 0, 0, blocks, charArray))
            result = 1;
    }else{
        const firstMin = minimalSizes[0];
        const rest = minimalSizes.slice(1);
        const minSizeOfRest = rest.reduce((a,v)=>a+v,0) + 
            blocks.slice(blocks.length - rest.length).reduce((a,v)=>a+v,0);
        const indexFromEnd = rest.length;
        const blockAfterThisGap = blocks[blocks.length - indexFromEnd];
        for (let s = firstMin; s <= remainingSpace-minSizeOfRest; s++) {
            const variantsOfRest = getGapSizeCombinations(remainingSpace-s-blockAfterThisGap, rest, blocks, charArray);
            if(variantsOfRest > 0 && fits(s, indexFromEnd, remainingSpace - s, blocks, charArray)){
                result += variantsOfRest;
            }
        }
    }
    cache[key] = result;
    //console.log(`In ${remainingSpace} with ${minimalSizes.join('|')} we have ${result} possibilities`);
    return result;
}
function fits(gapSize: number, indexFromEnd:number, charsAfter:number, blocks:number[], charArray:string[])
        : boolean {
    const endIx = charArray.length - charsAfter - 1;
    for (let index = 0; index < gapSize; index++) {
        if(charArray[endIx - index] === '#') return false;
    }
    const block = blocks[blocks.length - 1 - indexFromEnd];
    for (let index = 0; index < block; index++) {
        if(charArray[endIx - gapSize - index] === '.') return false;
    }
    return true;
}
(async () => {
    await rig.test(`???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`, 525152);
    await rig.runPrint();
})().then(() => {console.log("Done"); });



