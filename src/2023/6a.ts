import {Rig} from "./modules/rig";

const rig = new Rig(6,
    async (d) => {
        const lines = d.split('\n');
        const parts = lines.map(l => l.split(/\s+/).slice(1).map(s=>s.trim()).filter(s=>s).map(Number));
        const race = {
            time: Number(parts[0].join('')),
            dist: Number(parts[1].join(''))
        };
        const nrsOfWaysToBeat: number = numbersOfWays(race);

        return nrsOfWaysToBeat;

    }
);


(async () => {
    await rig.test(`Time:      7  15   30
Distance:  9  40  200`, 71503);
    await rig.runPrint();
})().then(() => {console.log("Done"); });


function numbersOfWays(value: { time: number; dist: number; }): number {
    let count = 0;
    for (let wait = 0; wait <= value.time; wait++) {
        const distance = (value.time - wait) * wait;
        if(distance > value.dist) count++;
    }
    return count;
}

