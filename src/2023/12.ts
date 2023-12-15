import { parseToObjects } from "./modules/lineParser";
import {Rig} from "./modules/rig";

const rig = new Rig(12,
    async (d) => {
        const lines = parseToObjects(d, /([#*?.]+) ([\d,]+)/, (s) =>{
            return {
                pattern: s[1],
                summary: s[2].split(',').filter(s=>s).map(Number)
            };

        });
        const optionsPerLine = lines.map(nrOfOptions);
        return optionsPerLine.reduce((a,v)=> a+v, 0);
    }
);
function nrOfOptions(value: { pattern: string; summary: number[]; }): number {
    // make regex
    const regex = new RegExp("^" + value.pattern.replaceAll(".", "\\.").replaceAll("?", "[.#]") + "$");
    const length = value.pattern.length;
    const possiblePatterns = getPatterns(length, value.summary);
    let count = 0;
    for (const pattern of possiblePatterns) {
        if(regex.test(pattern))count++;
    }
    return count;
}
function* getPatterns(totalSize, blocks: number[]){
    const totalBlockSize = blocks.reduce((a,v)=>a+v,0);
    const gapSizes = getGapSizes(totalSize - totalBlockSize, [0, ...blocks.filter((v,i)=> i>0).map(b=>1), 0]);
    for (const gaps of gapSizes) {
        yield blocks.map((n,i)=> ".".repeat(gaps[i]) + "#".repeat(n)).join("") + ".".repeat(gaps[blocks.length]);
    }
}
function* getGapSizes(totalGapSize: number, minimalSizes: number[]): Generator<number[]>{
    if(minimalSizes.length == 1){
        yield [totalGapSize];
    }else{
        const firstMin = minimalSizes[0];
        const rest = minimalSizes.slice(1);
        const minSizeOfRest = rest.reduce((a,v)=>a+v,0);
        for (let s = firstMin; s <= totalGapSize-minSizeOfRest; s++) {
            const sizesOfRest = getGapSizes(totalGapSize-s, rest);
            for (const sizeOfRest of sizesOfRest) {
                yield [s, ...sizeOfRest];
            }
        }
    }
}

(async () => {
    await rig.test(`???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`, 21);
    await rig.runPrint();
})().then(() => {console.log("Done"); });



