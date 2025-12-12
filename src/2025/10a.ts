import { Rig } from '../main_modules/rig';
import { parseToObjects } from '../main_modules/lineParser';
import { generateCompositions } from './modules/partitionGenerator'
import { factorial } from 'js-combinatorics';

const atos = (arr: number[]): string => arr.join(',');
const stoa = (str: string): number[] => str.split(',').map(Number);
type Machine = {
    target: string;
    buttons: number[][];
    jolt: number[];
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
    let positions = [...targetArr].map((v, i) => [v, i])
        .sort((a, b) =>   a[0] - b[0])
                    .map(v => v[1]).reverse();
    let reachable = {};
    reachable[atos(targetArr)] = 0;

    while(true) {
        let pos = positions.pop();
        //let pos = calculateBestPos(reachable);
        const buttonsWithPos = buttonMap[pos]; 
        let newReachable = {};
        console.log("Starting pos ", pos, " reachable size ", Object.keys(reachable).length);   
        for (const key in reachable) {
            const arr = stoa(key);
            var newReachables = findNewReachablesByClearingPos(arr, buttonsWithPos, machine.buttons, pos);
            const pushesToAdd = arr[pos];
            for (const nrArr of newReachables) {
                if(nrArr.some(v => v < 0)) continue;
                const nrKey = atos(nrArr);
                const totalPushes = reachable[key] + pushesToAdd;
                if (nrKey in newReachable) {
                    if (totalPushes < newReachable[nrKey]) {
                        newReachable[nrKey] = totalPushes;
                    }
                } else {
                    newReachable[nrKey] = totalPushes;
                }
            }
        }
        reachable = newReachable;
        if(empty in reachable){
            // clear out all that are less optimal
            for (const key in reachable) {
                if (key !== empty && reachable[key] >= reachable[empty]) {
                    delete reachable[key];
                }
            }
        };
        if (Object.keys(reachable).length === 1) break;
    }

    return reachable[empty];
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
    await rig.test(`[###.#..#..] (0,1,3,5,6,7,8,9) (7,9) (0,4,8) (0,1,2,6,7,9) (2,4,7) (0,1,2,3,4,5,7,8,9) (1,2,3,4,5,7,9) (0,1,5,9) (0,1,2,3,4,7,8,9) {190,192,169,50,50,45,147,196,48,203}
[..##...#.#] (6) (1,2,3,4,5,8,9) (5,6) (1,5,8,9) (0,2,3,5,6,7,8,9) (0,1,2,3,6,7,8,9) (2,3,7,9) (1,2,3,4,5,7,8,9) (0,1,6) (1,3,4,6,7,8) (2,4,5,9) (0,1,2,8) {29,70,55,43,37,57,36,32,57,63}`, 
        33);
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

