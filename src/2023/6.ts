import {Rig} from "./modules/rig";

const rig = new Rig(6,
    async (d) => {
        const lines = d.split('\n');
        const parts = lines.map(l => l.split(/\s+/).slice(1).map(s=>s.trim()).filter(s=>s).map(Number));
        const races = parts[0].map((v, i) =>
        {
            return {time:v, dist:parts[1][i]};
        });
        const nrsOfWaysToBeat: number[] = races.map(numbersOfWays);

        return nrsOfWaysToBeat.reduce((a,v)=> a*v, 1);

    }
);


(async () => {
    await rig.test(`Time:      7  15   30
Distance:  9  40  200`, 288);
    await rig.runPrint();
})().then(() => {console.log("Done"); });


function numbersOfWays(value: { time: number; dist: number; }, index: number, array: { time: number; dist: number; }[]): number {
    let count = 0;
    for (let wait = 0; wait <= value.time; wait++) {
        const distance = (value.time - wait) * wait;
        if(distance > value.dist) count++;
    }
    return count;
}

