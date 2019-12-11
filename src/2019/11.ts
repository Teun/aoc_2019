import { Coord, Direction, Grid, rotate } from "./modules/grid";
import { IntCodeMachine } from "./modules/IntCodeMachine";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const rig = new Rig(11,
    async (d) => {
        const machine = new IntCodeMachine(d.split(",")
            .map(Number));
        const grid = new Grid<string>();
        let pos = new Coord(0, 0);
        let dir = Direction.North;
        grid.set(pos, "#");
        machine.Run();
        let stepsRun = 0;
        while (machine.isRunning) {
            const currentPaint = grid.forCoord(pos) || "."; // empty = black
            machine.input(currentPaint === "#" ? 1 : 0);
            const toPaint = await machine.readOut();
            if (toPaint === null) { break; }
            if (toPaint) {
                grid.set(pos, "#");
            } else {
                grid.set(pos, ".");
            }
            const move = await machine.readOut();
            dir = rotate(dir, move || -1);
            pos = pos.neighbourTo(dir);
            stepsRun++;
            console.log(`steps run: ${stepsRun}, current pos: ${pos.name()}`);
        }
        console.log([...grid.positions()].length);
        return grid.toString();
    }
);
(async () => {
    await rig.runPrint();
})().then(() => {console.log("Done"); });
