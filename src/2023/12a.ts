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
    // make regexes
    const regexes = makeRegexes(value.pattern);
    cache = {};
    const length = value.pattern.length;
    const possiblePatterns = getPatterns(length, value.summary, regexes);
    return possiblePatterns.length;

}
function getPatterns(totalSize, blocks: number[], 
        regexes:{[id: number]: RegExp}){
    const totalBlockSize = blocks.reduce((a,v)=>a+v,0);
    const gapSizes = getGapSizes(totalSize - totalBlockSize, [0, ...blocks.filter((v,i)=> i>0).map(b=>1), 0], blocks, regexes);
    return gapSizes.map(l => l.length);
}
function getGapSizes(totalGapSize: number, minimalSizes: number[], 
        blocks: number[], regexes:{[id: number]: RegExp}): number[][]{
    const key = `${totalGapSize}_${minimalSizes.join('|')}`;
    if(key in cache)return cache[key];
    const result: number[][] = [];

    if(minimalSizes.length == 1){
        result.push([totalGapSize]);
    }else{
        const firstMin = minimalSizes[0];
        const rest = minimalSizes.slice(1);
        const minSizeOfRest = rest.reduce((a,v)=>a+v,0);
        for (let s = firstMin; s <= totalGapSize-minSizeOfRest; s++) {
            const sizesOfRest = getGapSizes(totalGapSize-s, rest, blocks, regexes);
            for (const sizeOfRest of sizesOfRest) {
                const toYield = [s, ...sizeOfRest];
                if(endMatches(toYield, blocks, regexes)){
                    //console.log('gaps', toYield);
                    result.push(toYield);
                }
            }
        }
    }
    if(result.length < 500){
        if(key.length < 30 && Object.keys(cache).length < 10000){
            cache[key] = result;
        }
    }
    return result;
}

function endMatches(gapsEnd: number[], blocks: number[], regexes: { [id: number]: RegExp; }) {
    const tail = makePattern(gapsEnd,blocks);
    if(!regexes[tail.length]){
        console.log();
    }
    return regexes[tail.length].test(tail);
}
function makePattern(gaps: number[], blocks: number[]){
    const tail = gaps.map((g, i) => {
        const b = blocks[blocks.length - (gaps.length - i)];
        return `${'#'.repeat(b)}${'.'.repeat(g)}`;
    }).join('');
    return tail;

}
function makeRegexes(pattern: string){
    const result: {[id:number]: RegExp} = {};
    for (let index = 1; index <= pattern.length; index++) {

        result[index] = new RegExp(makeRegex(pattern.substring(pattern.length - index)) + "$");        
    }
    function makeRegex(from: string) {
        return from.replaceAll(".", "\\.").replaceAll("?", "[.#]");
    }
    return result;
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



