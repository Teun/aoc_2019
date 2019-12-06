import { IntCodeMachine } from "./modules/IntCodeMachine";
import { Rig } from "./modules/rig";

const rig = new Rig(5
    ,
    async (d, o) => {
        const machine = new IntCodeMachine(d.split(",")
            .map(Number));
        if (o.type === "run") {
            machine.input(1);
        }
        machine.Run();
        return { m: machine.Memory, out: machine.output };
    }
);
(async () => {
    await rig.test("1002,4,3,4,33", {m: [1002, 4, 3, 4, 99], out: []});
    await rig.runPrint();

})()
.then(() => {console.log("Done"); });
