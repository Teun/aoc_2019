import { IntCodeMachine } from "./modules/IntCodeMachine";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const rig = new Rig(2,
    async (d, ctx) => {
        const mem = d.split(",")
            .map(Number);
        const machine = new IntCodeMachine(mem);
        if (ctx.type === "run") {
            machine.Memory[1] = 12;
            machine.Memory[2] = 2;
        }
        machine.Run();

        return machine.Memory.join(",");
    }
);
(async () => {
    await rig.test("1,0,0,0,99", "2,0,0,0,99");
    await rig.test("2,3,0,3,99", "2,3,0,6,99");
    await rig.test("2,4,4,5,99,0", "2,4,4,5,99,9801");
    await rig.test("1,1,1,4,99,5,6,0,99", "30,1,1,4,2,5,6,0,99");
    await rig.runPrint();
})()
.then(() => {console.log("Done"); });
