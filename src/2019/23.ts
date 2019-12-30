import { IntCodeMachine } from "./modules/IntCodeMachine";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const NAT = {
    receive: (x, y) => {
        NAT.x = x;
        NAT.y = y;
    },
    x: null,
    y: null,
    delivered: {},
    check: (all: IntCodeMachine[]) => {
        const allEmpty = all.every((m) => m.StdIn.length === 0);
        if (allEmpty) {
            all[0].input(NAT.x);
            all[0].input(NAT.y);
            if (NAT.delivered[NAT.y]) {
                console.log(NAT.y);
                process.exit(0);
            }
            NAT.delivered[NAT.y] = true;
        }
    }
};

const createMachine = (address: number, code: number[]) => {
    const machine = new IntCodeMachine(code, address.toString(), { inputAfterTimeout: -1});
    machine.input(address);
    return machine;
};
const wireAndStart = (machines: IntCodeMachine[]) => {
    machines.forEach(async (m, i) => {
        m.on("output", () => {
            m.readOutTillEmpty((val: number[]) => {
                console.log(`Read from machine ${i}: ${val}`);
                const [addressee, x, y] = val;
                if (val[0] === 255) {
                    console.log(`Sending to NAT: ${x}, ${y}`);
                    NAT.receive(x, y);
                    return;
                }
                machines[addressee].input(x);
                machines[addressee].input(y);
            }, 3);
        });
        await m.Run();
    });
};
const rig = new Rig(23,
    async (d) => {
        const code = d.split(",").map(Number);
        const machinesByAddress: IntCodeMachine[] = [];
        for (let index = 0; index < 50; index++) {
            machinesByAddress[index] = createMachine(index, code.slice(0));
        }
        wireAndStart(machinesByAddress);
        setInterval(() => {
            NAT.check(machinesByAddress);
        }, 100);
        return 1;
    }
);
(async () => {
    await rig.runPrint();
})().then(() => {console.log("Done"); });
