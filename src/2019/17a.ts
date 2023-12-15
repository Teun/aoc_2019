import { Coord, Direction, Grid, rotate } from "./modules/grid";
import { IntCodeMachine } from "./modules/IntCodeMachine";
import { Rig } from "./modules/rig";

const sendLine = (machine: IntCodeMachine, line: string) => {
    (line + "\n").split("").map((c) => c.charCodeAt(0))
        .forEach((i) => {
            machine.input(i);
        });
};
const findFullPath = (grid: Grid<string>) => {
    let path = "";
    let bot: Coord = grid.positions("^").next().value.pos;
    let dir = Direction.North;
    while (true) {
        if (grid.forCoord(bot.neighbourTo(rotate(dir, -1))) === "#") {
            dir = rotate(dir, -1);
            path += ",L";
        } else if (grid.forCoord(bot.neighbourTo(rotate(dir, +1))) === "#") {
            dir = rotate(dir, 1);
            path += ",R";
        } else {
            break;
        }
        let steps = 0;
        while (true) {
            if (grid.forCoord(bot.neighbourTo(dir)) === "#") {
                steps += 1;
                bot = bot.neighbourTo(dir);
            } else {
                path += `,${steps}`;
                break;
            }
        }

    }
    return path;

};

const rig = new Rig(17,
    async (d) => {
        const grid = new Grid<string>();
        const machine = new IntCodeMachine(d.split(",").map(Number));
        machine.Memory[0] = 2;
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
        const path = findFullPath(grid);
        console.log(path);

        sendLine(machine, "A,B,A,C,A,A,C,B,C,B");
        sendLine(machine, "L,12,L,8,R,12");
        sendLine(machine, "L,10,L,8,L,12,R,12");
        sendLine(machine, "R,12,L,8,L,10");
        sendLine(machine, "n");

        await machine.waitForOutput();
        const last = await new Promise((res, rej) => {
            machine.readOutTillEmpty((val) => {
                const gridStr = val.map((i) => String.fromCharCode(i)).join("");
                console.log(grid.toString());
                res(val[val.length - 1]);
            });
        });
        return last;
    }
);
(async () => {
    await rig.runPrint();
})().then(() => {console.log("Done"); });
