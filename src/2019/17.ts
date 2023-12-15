import { Grid } from "./modules/grid";
import { IntCodeMachine } from "./modules/IntCodeMachine";
import { Rig } from "./modules/rig";

const rig = new Rig(17,
    async (d) => {
        const grid = new Grid<string>();
        const machine = new IntCodeMachine(d.split(",").map(Number));
        machine.Run();
        await machine.waitForOutput();
        await new Promise((res, rej) => {
            machine.readOutTillEmpty((val) => {
                const gridStr = val.map((i) => String.fromCharCode(i)).join("");
                grid.parseFromString(gridStr, {"#": "#", "^": "^"});
                res(true);
            });
        });
        console.log(grid.toString());
        const crossings = [...grid.positions("#")].filter(gp => {
            return gp.pos.neighbours().every((n) => grid.forCoord(n) === "#");
        });
        return crossings.map((cr) => cr.pos)
            .reduce((a, v) => a + v.x * v.y, 0);
    }
);
(async () => {
    await rig.runPrint();
})().then(() => {console.log("Done"); });
