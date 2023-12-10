import { firstBy as by } from "thenby";
import { parseToObjects } from "./modules/lineParser";
import {Rig} from "./modules/rig";
interface Hand {hand:string, bid:number};
const rig = new Rig(9,
    async (d) => {
        const lines = parseToObjects(d, /[\d \-]+/, (s, n) => {
            return s[0].split(' ').map(s => s.trim()).filter(s=>s).map(Number);
        });
        const extensions = lines.map(prepend);
        return extensions.reduce((a,v)=> a+v, 0);
    }
);
function prepend(values: number[]): number {
    values.reverse();
    return extend(values);
}
function extend(values: number[]): number {
    if(values.every(v=> v===0))return 0;
    const nextLevel = [];
    for (let index = 0; index < values.length - 1; index++) {
        const diff = values[index + 1] - values[index];
        nextLevel.push(diff);
    }
    return extend(nextLevel) + values[values.length-1];
}

(async () => {
    await rig.test(`0 3 6 9 12 15
    1 3 6 10 15 21
    10 13 16 21 30 45`, 2);
    await rig.runPrint();
})().then(() => {console.log("Done"); });


