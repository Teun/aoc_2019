import { IntCodeMachine } from "./modules/IntCodeMachine";
import { Rig } from "./modules/rig";

const rig = new Rig(9,
    async (d) => {
        const machine = new IntCodeMachine(d.split(",")
            .map(Number));
        machine.input(1);
        await machine.Run();
        return machine.output;
    }
);
(async () => {
    await rig.test("109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99",
    [109, 1, 204, -1, 1001, 100, 1, 100, 1008, 100, 16, 101, 1006, 101, 0, 99]);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
