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

        sendLine(machine, "OR D J");  // D safe -> jump
        sendLine(machine, "OR E T");
        sendLine(machine, "OR H T");
        sendLine(machine, "AND T J");
        sendLine(machine, "NOT A T");  // A safe -> T
        sendLine(machine, "NOT T T");  // A safe -> T
        sendLine(machine, "AND B T"); // AND B safe
        sendLine(machine, "AND C T"); // AND C safe
        sendLine(machine, "NOT T T"); // AND NOT
        sendLine(machine, "AND T J");

        sendLine(machine, "RUN");
        console.log(await readText(machine));
        return endValue;
    }
);
(async () => {
    await rig.runPrint();
})().then(() => {console.log("Done"); });
