import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";
import { Grid, Coord } from "./modules/grid";

const diversity = (grid: Grid<string>) => {
    let result = 0;
    for (const cell of grid.positions("#")) {
        result += Math.pow(2, cell.pos.x + 5 * cell.pos.y);
    }
    return result;
};
const calculateNext = (prev: Grid<string>, tl: Coord, br: Coord): Grid<string> => {
    const counter = new Grid<number>();
    for (const bug of [...prev.positions("#")]) {
        for (const n of bug.pos.neighbours()) {
            counter.set(n, (counter.forCoord(n) || 0) + 1);
        }
    }
    const next = new Grid<string>();
    for (const pos of Coord.forRectangle(tl.x, br.x, tl.y, br.y)) {
        const curr = prev.forCoord(pos);
        const count = counter.forCoord(pos);
        if (curr === "#" && (count !== 1)) {
            next.set(pos, ".");
        } else if (curr !== "#" && (count === 1 || count === 2)) {
            next.set(pos, "#");
        } else {
            next.set(pos, curr);
        }
    }
    return next;
};

const rig = new Rig(24,
    async (d) => {
        const startGrid = new Grid<string>();
        startGrid.parseFromString(d, {"#": "#", ".": "."});
        const values = parseToObjects(d, /.*/, (s, n) => {
            return s;
        });
        const [tl, br] = startGrid.boundaries();
        let curr = startGrid;
        let generation = 0;
        const seen: {[key: string]: boolean} = {};
        while (true) {
            generation++;
            curr = calculateNext(curr, tl, br);
            const hash = curr.hash();
            if (hash in seen) {
                return diversity(curr);
            } else {
                seen[hash] = true;
            }
        }
    }
);
(async () => {
    await rig.testFromFile("sample", 2129920);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
