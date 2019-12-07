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
    machines[4].pipeOutput(machines[0].StdIn);
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

        const options = permutation([5, 6, 7, 8, 9]).toArray();
        const results = await Promise.all(options.map((o) => calcOutput(o, intCode)));
        const best = results.sort(by((r) => r.v, {direction: -1}))[0];
        return {ps: best.phaseSettings.join(""), output: best.v};
    }
);
(async () => {
    await rig.test("3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5",
        {ps: "98765", output: 139629729 });
    await rig.test("3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10",
    {ps: "97856", output: 18216 });
    await rig.runPrint();
})().then(() => {console.log("Done"); });
