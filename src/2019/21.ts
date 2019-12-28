import { IntCodeMachine } from "./modules/IntCodeMachine";
import { Rig } from "./modules/rig";

const sendLine = (machine: IntCodeMachine, line: string) => {
    (line + "\n").split("").map((c) => c.charCodeAt(0))
        .forEach((i) => {
            machine.input(i);
        });
};

const i2a = (val: number[]) => {
    return val.map((i) => String.fromCharCode(i)).join("");
};
let endValue: number;
const readText = async (machine: IntCodeMachine) => {
    return new Promise<string>(async (res, rej) => {
        await machine.waitForOutput();
        machine.readOutTillEmpty((val: number[]) => {
            endValue = val[val.length - 1];
            res(i2a(val));
        });
    });

};

const rig = new Rig(21,
    async (d) => {
        const machine = new IntCodeMachine(d.split(",").map(Number));
        machine.Run();
        console.log(await readText(machine));

        sendLine(machine, "OR D J");
        sendLine(machine, "OR A T");
        sendLine(machine, "AND B T");
        sendLine(machine, "AND C T");
        sendLine(machine, "NOT T T");
        sendLine(machine, "AND T J");
        sendLine(machine, "WALK");
        console.log(await readText(machine));
        return endValue;
    }
);
(async () => {
    await rig.runPrint();
})().then(() => {console.log("Done"); });
