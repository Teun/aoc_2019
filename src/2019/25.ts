import { bigCombination } from "js-combinatorics";
import * as readline from "readline";
import { IntCodeMachine } from "./modules/IntCodeMachine";
import { Rig } from "./modules/rig";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const sendLine = (machine: IntCodeMachine, line: string) => {
    (line + "\n").split("").map((c) => c.charCodeAt(0))
        .forEach((i) => {
            machine.input(i);
        });
};
const execCustom = (line: string, machine: IntCodeMachine) => {
    console.log(`Interpreting custom cmd: ${line}`);
    const firstSpace = line.indexOf(" ");
    const cmd = line.substring(0, firstSpace);
    console.log(`cmd: ${cmd}`);
    if (cmd.startsWith("Ext:combi-inv")) {
        const [_ , nr, dir] = cmd.split("_");
        const items = line.substring(firstSpace + 1).split(",");
        const itemCombinations = bigCombination(items, Number(nr)).toArray();
        for (const combination of itemCombinations) {
            items.forEach((it) => scheduledCommands.push(`drop ${it}`));
            combination.forEach((it) => scheduledCommands.push(`take ${it}`));
            scheduledCommands.push("inv");
            scheduledCommands.push(dir);
            scheduledCommands.push("check");
        }
    } else if (cmd === "Ext:collect-all") {
        scheduledCommands.push("east");
        scheduledCommands.push("take loom");
        scheduledCommands.push("south");
        scheduledCommands.push("take ornament");
        scheduledCommands.push("west");
        scheduledCommands.push("north");
        scheduledCommands.push("take candy cane");
        scheduledCommands.push("south");
        scheduledCommands.push("east");
        scheduledCommands.push("north");
        scheduledCommands.push("east");
        scheduledCommands.push("take fixed point");
        scheduledCommands.push("north");
        scheduledCommands.push("take spool of cat6");
        scheduledCommands.push("west");
        scheduledCommands.push("take shell");
        scheduledCommands.push("east");
        scheduledCommands.push("north");
        scheduledCommands.push("take weather machine");
        scheduledCommands.push("south");
        scheduledCommands.push("south");
        scheduledCommands.push("west");
        scheduledCommands.push("west");
        scheduledCommands.push("north");
        scheduledCommands.push("take wreath");
        scheduledCommands.push("north");
        scheduledCommands.push("east");
        // Ext:combi-inv_4_south ornament,loom,spool of cat6,wreath,fixed point,shell,candy cane,weather machine
    }
    execNextScheduled(machine);
};
const execNextScheduled = (machine: IntCodeMachine) => {
    let nextCmd = scheduledCommands.shift();
    if (!nextCmd) { return; }
    if (nextCmd === "check") {
        if (lastResult.indexOf("heavier") === -1 && lastResult.indexOf("lighter") === -1) {
            scheduledCommands.length = 0;
            nextCmd = "stopped";
        }
    }

    console.log(`Sending sceduled command: ${nextCmd}`);
    sendLine(machine, nextCmd);

};
const scheduledCommands: string[] = [];
let lastResult = "";

const rig = new Rig(25,
    async (d) => {
        const code = d.split(",").map(Number);
        const machine = new IntCodeMachine(code.slice(0));
        machine.on("output", () => {
            let triggered = false;
            if (!triggered) {
                triggered = true;
                setImmediate(() => {
                    machine.readOutTillEmpty((values: number[]) => {
                        if (values.length === 0) { return; }
                        const str = values.map((i) => String.fromCharCode(i)).join("");
                        lastResult = str;
                        console.log(`Machine: ${str}\n`);
                        triggered = false;
                        if (str.indexOf("Command?") > -1) {
                            if (scheduledCommands.length === 0) {
                                rl.question("Enter: ", ((input) => {
                                    if (input.startsWith("Ext:")) {
                                        execCustom(input, machine);
                                    } else {
                                        sendLine(machine, input);
                                    }
                                }));
                                rl.prompt(true);
                            } else {
                                execNextScheduled(machine);
                            }
                        }
                    });
                });
            }
        });
        await machine.Run();
        return 1;
    }
);
(async () => {
    await rig.runPrint();
})().then(() => {console.log("Done"); });
