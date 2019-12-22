import { Coord, Grid } from "./modules/grid";
import { Pathfinder } from "./modules/pathfinding";
import { Rig } from "./modules/rig";

class State {
    constructor(
        public pos: Coord,
        public keysCollected: string []) { }
    public getHash() {
        return `${this.pos.name()}_${this.keysCollected.join("")}`;
    }
}
let longestSet = 0;
const rig = new Rig(18,
    async (d) => {
        const grid = new Grid<string>();
        grid.parseFromStringFunc(d, (c) => {
            if (c === " ") { return null; }
            return c;
        });
        const pf = new Pathfinder<State>();
        const start: Coord = [...grid.positions("@")][0].pos;
        const targetCoords = [...grid.positionsFunc((c) => {
            return c >= "a" && c <= "z";
        })].map((gp) => gp.pos);

        const path = pf.bfs(new State(start, []),
            (s) => {
                if(s.keysCollected.length > longestSet) {
                    longestSet = s.keysCollected.length;
                    console.log(`Evaluating ${s.keysCollected.length}`);
                }
                const positions = s.pos.neighbours().filter((n) => {
                    const val = grid.forCoord(n);
                    if (val === "#") {return false; }
                    if (val >= "A" && val <= "Z") {return s.keysCollected.indexOf(val.toLowerCase()) > -1; }
                    return true;
                });
                return positions.map((p) => {
                    const val = grid.forCoord(p);
                    const keys = new Set(s.keysCollected);
                    if (val >= "a" && val <= "z") {keys.add(val); }
                    return new State(p, [...keys.values()].sort());
                });
            },
            (s) => s.keysCollected.length === targetCoords.length);

        return path.length - 1;
    }
);
(async () => {
    await rig.testFromFile("small", 86);
    await rig.testFromFile("small2", 132);
    await rig.runPrint();
})().then(() => { console.log("Done"); });
