import { firstBy } from "thenby";
import { Coord, Grid } from "./modules/grid";
import { Rig } from "./modules/rig";
import { intersection } from "./modules/sets";

interface Step {
    d: string;
    l: number;
}
const nextPos = (from: Coord, d: string) => {
    switch (d) {
        case "U":
            return from.above;
        case "L":
            return from.left;
        case "R":
            return from.right;
        case "D":
            return from.below;
    }
    throw new Error(`Unknown direction ${d}`);
};

const drawLine = (grid: Grid<string>, from: Coord, step: Step) => {
    grid.set(from, "+");
    let curr = from;
    for (let i = 0; i < step.l; i++) {
        curr = nextPos(curr, step.d);
        grid.set(curr, ".");
    }
    grid.set(from, "+");
    return curr;
};

const makeGridForWire = (inp: string) => {
    const steps: Step[] = inp.split(",").map((s) => ({d: s[0], l: Number(s.substring(1))}));
    const grid = new Grid<string>();
    let currentPoint = new Coord(0, 0);
    for (const step of steps) {
        currentPoint = drawLine(grid, currentPoint, step);
    }
    return grid;
};

const rig = new Rig(3,
    async (d) => {
        const wire1 = d.split("\n")[0];
        const wire2 = d.split("\n")[1];
        const grid1 = makeGridForWire(wire1);
        const grid2 = makeGridForWire(wire2);

        const origin = new Coord(0, 0);
        const crossings = intersection(
            new Set([...grid1.positions()].map((p) => p.pos.name())),
            new Set([...grid2.positions()].map((p) => p.pos.name())));
        const closest = [...crossings]
            .filter((s) => s !== "0x0")
            .sort(firstBy((c) => new Coord(c).distanceMnhtn(origin)))[0];
        return new Coord(closest).distanceMnhtn(origin);
    }
);
(async () => {
    await rig.test("R8,U5,L5,D3\nU7,R6,D4,L4", 6);
    await rig.test("R75,D30,R83,U83,L12,D49,R71,U7,L72\nU62,R66,U55,R34,D71,R55,D58,R83", 159);
    await rig.test("R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51\nU98,R91,D20,R16,D67,R40,U7,R15,U6,R7", 135);   
    await rig.runPrint();
})().then(() => {console.log("Done"); });
