import * as lcm from 'lcm';
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

        let starts = Object.keys(moves).filter(k => k.endsWith('A'));
        const cycleInfo = starts.map(start => {

            const seen: {[id:string]: number} = {};
            let curr = start;
            let count = 0;
            seen[`${start}_0`] = 0;
            while(true){
                for (const d of directions) {
                    curr = moves[curr][d];
                    count++;
                    const i = count % directions.length;
                    const key = `${curr}_${i}`;
                    if(key in seen){
                        console.log(`Found cycle: step ${count} and ${seen[key]} are same`);
                        const endpoints = Object.keys(seen).filter(k => k.indexOf('Z') > -1).map(k => `${k} (${seen[k]})`);
                        console.log(`Endpoints at ${endpoints.join(', ')}`);
                        return {modularity: count - seen[key]};
                        
                    }
                    seen[key] = count;
                }
            }
        });
        var result = cycleInfo.reduce((a,v)=> lcm(a, v.modularity), 1);
        console.log(`Result: ${result}`);
    }
);

(async () => {
//     await rig.test(`LR

// 11A = (11B, XXX)
// 11B = (XXX, 11Z)
// 11Z = (11B, XXX)
// 22A = (22B, XXX)
// 22B = (22C, 22C)
// 22C = (22Z, 22Z)
// 22Z = (22B, 22B)
// XXX = (XXX, XXX)`, 6);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

function possible(g: { game: number; moves: any[]; }, max: { red: number; green: number; blue: number; }): boolean {
    return g.moves.every(m => (m.red||0) <= max.red && (m.green||0) <= max.green && (m.blue||0) <= max.blue)
}

