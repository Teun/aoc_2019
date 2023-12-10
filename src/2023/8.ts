import { firstBy as by } from "thenby";
import { parseToObjects } from "./modules/lineParser";
import {Rig} from "./modules/rig";
interface Hand {hand:string, bid:number};
const rig = new Rig(8,
    async (d) => {
        const prelude = d.split('\n\n');
        var directions = prelude[0].trim().split('');
        const moves = parseToObjects(prelude[1], /(\w{3}) = \((\w{3}), (\w{3})\)/, (s, n) => {
            return {from: s[1], L: s[2], R: s[3]};
        }).reduce((a,v)=> {
            a[v.from] = v;
            return a;
        }, {});
        let curr = 'AAA';
        let count = 0;
        while(true){
            for (const d of directions) {
                count++;
                curr = moves[curr][d];
                if(curr === 'ZZZ')return count;
            }
        }
        return 0;

    }
);

(async () => {
    await rig.test(`LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)`, 6);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

function possible(g: { game: number; moves: any[]; }, max: { red: number; green: number; blue: number; }): boolean {
    return g.moves.every(m => (m.red||0) <= max.red && (m.green||0) <= max.green && (m.blue||0) <= max.blue)
}

