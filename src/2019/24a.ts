import { firstBy } from "thenby";
import { Coord, Grid } from "./modules/grid_24a";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const toString = (g: Grid<string>) => {
    let result = "";
    const all = [...g.positions()].sort(firstBy(gp => gp.pos.level));
    for (let level = all[0].pos.level; level <= all[all.length - 1].pos.level; level++) {
        result += `Level: ${level}\n\n`;
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
                result += (g.forCoord(new Coord(x, y, level)) || ".")[0];
            }
            result += "\n";
        }
        result += "\n";
    }
    return result;
};
const calculateNext = (prev: Grid<string>): Grid<string> => {
    const counter = new Grid<number>();
    for (const bug of [...prev.positions("#")]) {
        for (const n of bug.pos.neighbours()) {
            counter.set(n, (counter.forCoord(n) || 0) + 1);
        }
    }
    const next = new Grid<string>();
    for (const gp of counter.positions()) {
        const curr = prev.forCoord(gp.pos) || ".";
        const count = gp.val;
        if (curr === "#" && (count !== 1)) {
            next.set(gp.pos, ".");
        } else if (curr !== "#" && (count === 1 || count === 2)) {
            next.set(gp.pos, "#");
        } else {
            next.set(gp.pos, curr);
        }
    }
    for (const gp of prev.positions("#")) {
        if(next.forCoord(gp.pos) === null) {
            // not counted => dies
            next.set(gp.pos, ".");
        }
    }
    return next;
};

const rig = new Rig(24,
    async (d, o, ro) => {
        const startGrid = new Grid<string>();
        startGrid.parseFromString(d, {"#": "#", ".": "."});
        const values = parseToObjects(d, /.*/, (s, n) => {
            return s;
        });
        let curr = startGrid;
        let generation = 0;
        while (true) {
            generation++;
            curr = calculateNext(curr);
            console.log(toString(curr));
            if (generation >= ro) {
                return [...curr.positions("#")].length;
            }
        }
    }
);
(async () => {
    await rig.testFromFile("sample", 99, 10);
    await rig.runPrint(200);
})().then(() => {console.log("Done"); });
