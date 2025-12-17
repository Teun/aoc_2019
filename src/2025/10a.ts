import { Rig } from '../main_modules/rig';
import { parseToObjects } from '../main_modules/lineParser';
import { power } from "js-combinatorics";
let cache = new Map<string, number>();

const rig = new Rig(10, async (input, opt, testOpt) => {
    const machines = parseToObjects(input, /^\[(\S+)\] ((\(\S+\) )+){(\S+)}$/, (m) => {
        return {
            target: m[1],
            buttons: m[2].trim()
                    .split(" ").map(b => b.replace(/[()]/g, "")
                    .split(',').map(Number)),
            jolt: m[4].split(",").map(Number)
        };
    });
    const results = machines.map(m => {
        cache.clear();
        console.log("Starting", m.jolt, m.buttons.length);
        return getPushesNeeded(m.buttons, m.jolt);
    });   
    return results.reduce((a,v)=>a+v, 0);

});

(async () => {
    await rig.test(`[...##..] (2,3) (5,6) (0,1,3,4,5) (0,1,2,6) (2,3,4,5,6) (0,1,5) {12,12,13,13,2,31,19}`, 42);
    await rig.test(`[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`, 33);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

function uniqueButtonCombis(buttons: number[][], len: number) {
    const buttonCombis = power(buttons).toArray();
    
    let result = buttonCombis.map(c =>{
        const sum = c.reduce((a: number[], b) => {
            for (const n of b) {
                a[n] += 1;
            }
            return a;
        }, new Array(len).fill(0));

        return { pushes: c.length, combi: sum};
    });
    return result;
}

function getPushesNeeded(buttons: number[][], jolt: number[]): any {
    const key = makeKey(jolt, buttons);
    if(cache.has(key)) return cache.get(key);
    if(jolt.every(n => n === 0)) return 0;
    if(jolt.some(n => n < 0)) return Infinity;

    const buttonCombis = uniqueButtonCombis(buttons, jolt.length);
    const combisThatMakeEven = buttonCombis.filter(c => 
        {
            return c.combi.every((v, i) => v % 2 === jolt[i] % 2);
        });
    if(combisThatMakeEven.length === 0) return Infinity;

    const pushesNeeded = combisThatMakeEven.map(c => {
        const next = split(sub(jolt, c.combi));
        return c.pushes + 2*getPushesNeeded(buttons, next);
    });

    pushesNeeded.sort((a, b) => a - b);
    cache.set(key, pushesNeeded[0]);
    return pushesNeeded[0];
}

function sub(jolt: number[], diff: number[]): number[] {
    return jolt.map((v, i) => v - diff[i]);
}

function split(jolt: number[]): number[] {
    return jolt.map(v => v / 2);
}

function makeKey(jolt: number[], buttons: number[][]) {
    return jolt.join(',') + '~' + buttons.map(b => b.join(',')).join('|');
}

