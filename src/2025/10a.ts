import { Rig } from '../main_modules/rig';
import { parseToObjects } from '../main_modules/lineParser';
import { generateCompositions } from './modules/partitionGenerator'

const atos = (arr: number[]): string => arr.join(',');
const stoa = (str: string): number[] => str.split(',').map(Number);
type Machine = {
    target: string;
    buttons: number[][];
    jolt: number[];
}
interface reached {
    remaining: number[],
    pushesUsed: number,
    score?: number
}
const totalButtonPushesNeeded = (machine: Machine): number => {
    console.log("Starting", machine.jolt, "buttons:", machine.buttons.length);
    const targetArr = machine.jolt;
    const empty = atos(machine.jolt.map(() => 0));
    // invert the buttons to an array
    const buttonMap = targetArr.map((_, i) => machine.buttons
        .map((b, j) => ({button: b, pos: j}))
        .filter(bj => bj.button.includes(i)))
        .map(bj => bj.map(b => b.pos));
    let reachable : reached[] = [];
    reachable.push({remaining: [...targetArr], pushesUsed: 0});
    let bestSolution: reached = null;
    let sortCount = 0;
    let maximalPushesSeen = Infinity;
    let skipCount = 0;

    while(true) {
        if (reachable.length === 0) break;
        const exploring = reachable.shift();
        if(minimalPushes(exploring) > maximalPushesSeen) 
        {            
            skipCount++;
            continue;
        }
        const maximum = maximalPushes(exploring);
        if(maximum < maximalPushesSeen){
            maximalPushesSeen = maximum;
        }

        let pos = exploring.remaining.map((v,i) =>({v,i})).filter(v => v.v > 0).sort((a,b) => a.v - b.v)[0].i;
        //const buttonsWithPos = machine.buttons.filter(b => );
        const buttonsWithPos = buttonMap[pos];
        const newReachables = findNewReachablesByClearingPos(exploring.remaining, buttonsWithPos, machine.buttons, pos);
        const pushesToAdd = exploring.remaining[pos];
        for (const nrArr of newReachables) {
            if(nrArr.some(v => v < 0)) continue;
            const nrKey = atos(nrArr);
            const totalPushes = exploring.pushesUsed + pushesToAdd;
            if(nrKey === empty) {
                if(bestSolution === null || totalPushes < bestSolution.pushesUsed) {
                    bestSolution = {remaining: nrArr, pushesUsed: totalPushes};
                }
                maximalPushesSeen = totalPushes;
                continue;
            } 
            reachable.push({remaining: nrArr, pushesUsed: totalPushes});

        }
        if(sortCount++ % 500 === 0 && reachable.length > 1)
        {
            reachable.sort((a,b) => score(a) - score(b));
            if(sortCount % 50000 === 1) {
                console.log("Used:", reachable[0].pushesUsed, reachable[0].score, reachable.length);
            }
        }
    }

    return bestSolution.pushesUsed;
}

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
    const totalButtonPushes = machines.map(totalButtonPushesNeeded)

    return totalButtonPushes.reduce((a,v)=>a+v, 0);
});

(async () => {
//     await rig.test(`[###.#..#..] (0,1,3,5,6,7,8,9) (7,9) (0,4,8) (0,1,2,6,7,9) (2,4,7) (0,1,2,3,4,5,7,8,9) (1,2,3,4,5,7,9) (0,1,5,9) (0,1,2,3,4,7,8,9) {190,192,169,50,50,45,147,196,48,203}
// [..##...#.#] (6) (1,2,3,4,5,8,9) (5,6) (1,5,8,9) (0,2,3,5,6,7,8,9) (0,1,2,3,6,7,8,9) (2,3,7,9) (1,2,3,4,5,7,8,9) (0,1,6) (1,3,4,6,7,8) (2,4,5,9) (0,1,2,8) {29,70,55,43,37,57,36,32,57,63}`, 
//         33);
    await rig.test(`[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`, 
        33);
    await rig.runPrint();
})().then(() => {console.log("Done"); });


function findNewReachablesByClearingPos(from: number[], buttonsWithPos: number[], allButtons: number[][], pos: number) {
    const usefulButtons = buttonsWithPos
        .filter(b => !allButtons[b].some(ix => from[ix] === 0));
    let combis = [...generateCompositions(usefulButtons.length, from[pos])];
    let newReachables = combis.map(combi => {
        var newCombi = combi.reduce((acc, i, ix) => {
            const thisButton = allButtons[usefulButtons[ix]];
            subtractPushes(acc, thisButton, i);
            return acc;
        }, [...from]);
        return newCombi;
    });
    if (combis.length === 0 && from[pos] === 0) newReachables.push(from);
    return newReachables;
}

function subtractPushes(arr: number[], thisButton: number[], i: number) {
    for (const pos of thisButton) {
        arr[pos] -= i;
    }
}
function calculateBestPos(reachable: {}) {
    const allRegisters = Object.keys(reachable).map(stoa);
    const averageFilling = allRegisters[0].map((_, i) => {
        const total = allRegisters.reduce((acc, arr) => acc + arr[i], 0);
        return total / allRegisters.length;
    });
    return averageFilling.indexOf(Math.min(...averageFilling.filter(v => v > 0)));
}

function score(a: reached): number {
    if(a.score) return a.score;
    a.score = a.pushesUsed + a.remaining.reduce((acc, v) => acc + v, 0);
    return a.score;
}

function minimalPushes(sample: reached) {
    return sample.pushesUsed + Math.max(...sample.remaining);
}
function maximalPushes(sample: reached) {
    return sample.pushesUsed + sample.remaining.reduce((acc, v) => acc + v, 0);
}

