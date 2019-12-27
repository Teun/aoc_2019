import { Coord, Grid } from "./modules/grid";
import { IntCodeMachine } from "./modules/IntCodeMachine";
import { Rig } from "./modules/rig";

const probe = async (x, y, code) => {
    const machine = new IntCodeMachine(code.slice(0));
    machine.Run();
    machine.input(x);
    machine.input(y);
    const val = await machine.readOut();
    return val;
};
const rig = new Rig(19,
    async (d) => {
        const code = d.split(",").map(Number);
        const grid = new Grid<string>();
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                const val = await probe(x, y, code);
                grid.set(new Coord(x, y), val === 1 ? "#" : ".");
            }
        }
        console.log(grid.toString());
        return [...grid.positions("#")].length;
    }
);
(async () => {
    await rig.runPrint();
})().then(() => {console.log("Done"); });
