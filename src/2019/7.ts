import { permutation } from "js-combinatorics";
import {firstBy as by} from "thenby";
import { IntCodeMachine } from "./modules/IntCodeMachine";
import { Rig } from "./modules/rig";

const calcOutput = async (phaseSettings: number[], intCode: number[]) => {
    const machines = phaseSettings.map((ps) => {
        const machine = new IntCodeMachine(intCode);
        machine.input(ps);
        return machine;
    });
    for (let index = 0; index < machines.length - 1; index++) {
        machines[index].pipeOutput(machines[index + 1].StdIn);
    }
    machines[0].input(0);
    await Promise.all(machines.map((m) => m.Run()));
    return {
        v: machines[machines.length - 1].output[0],
        phaseSettings
    };
};

const rig = new Rig(7,
    async (d) => {
        const intCode = d.split(",").map(Number);

        const options = permutation([0, 1, 2, 3, 4]).toArray();
        const results = await Promise.all(options.map((o) => calcOutput(o, intCode)));
        const best = results.sort(by((r) => r.v, {direction: -1}))[0];
        return {ps: best.phaseSettings.join(""), output: best.v};
    }
);
(async () => {
    await rig.test("3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0",
        {ps: "43210", output: 43210 });
    await rig.runPrint();
})().then(() => {console.log("Done"); });
