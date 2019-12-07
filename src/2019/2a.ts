import { IntCodeMachine } from "./modules/IntCodeMachine";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const rig = new Rig(2,
    async (d, ctx) => {
        const mem = d.split(",").map(Number);
        for (const first of [...Array(100).keys()]) {
            for (const second of [...Array(100).keys()]) {
                const machine = new IntCodeMachine(mem.slice(0));
                machine.Memory[1] = first;
                machine.Memory[2] = second;
                await machine.Run();
                console.log(`Ran for ${first}, ${second}, result: ${machine.Memory[0]}`);
                if (machine.Memory[0] === 19690720) {
                    return 100 * first + second;
                }
            }
        }
        return -1;
    }
);
(async () => {
    await rig.runPrint();
})().then(() => {console.log("Done"); });
