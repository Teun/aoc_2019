import { Coord, Direction, Grid } from "./modules/grid";
import { Pathfinder } from "./modules/pathfinding";
import { Rig } from "./modules/rig";

class State {
    private _hash: string = null;
    constructor(
        public robots: Coord[],
        public keysCollected: string[]) {}
    public getHash() {
        if (!this._hash) {
            const canonKeys = this.keysCollected.slice(0).sort().join("");
            this._hash = `${this.robots.map((c) => c.name()).join()}_${canonKeys}`;
        }
        return this._hash;
    }
}

const switchCenter = (g: Grid<string>) => {
    const center: Coord = [...g.positions("@")][0].pos;
    g.set(center, "#");
    g.set(center.neighbourTo(Direction.North), "#");
    g.set(center.neighbourTo(Direction.East), "#");
    g.set(center.neighbourTo(Direction.South), "#");
    g.set(center.neighbourTo(Direction.West), "#");
    g.set(center.neighbourTo(Direction.North).neighbourTo(Direction.West), "@");
    g.set(center.neighbourTo(Direction.North).neighbourTo(Direction.East), "@");
    g.set(center.neighbourTo(Direction.South).neighbourTo(Direction.West), "@");
    g.set(center.neighbourTo(Direction.South).neighbourTo(Direction.East), "@");
};
const findAllPathsToUnfoundKeys = (s: State, grid: Grid<string>) => {
    const pathsPerQuadrant = s.robots.map((rp, ri) => {
        const pf = new Pathfinder<State>();
        return pf.bfs_all(new State([rp], s.keysCollected),
            (from: State) => {
                const positions = from.robots[0].neighbours().filter((n) => {
                    const val = grid.forCoord(n);
                    if (val === "#") { return false; }
                    if (val >= "A" && val <= "Z") { return s.keysCollected.indexOf(val.toLowerCase()) > -1; }
                    return true;
                });
                return positions.map((p) => new State([p], s.keysCollected));
            },
            (isTarget: State) => {
                const val = grid.forCoord(isTarget.robots[0]);
                return (val >= "a" && val <= "z" && s.keysCollected.indexOf(val) === -1);
            }
            )
            .map((path: State[]) => ({robot: ri, cost: path.length - 1, end: path[path.length - 1].robots[0]}));
        });
    return pathsPerQuadrant.reduce((p, n) => p.concat(n), []);
};
const rig = new Rig(18,
    async (d) => {
        const grid = new Grid<string>();
        grid.parseFromStringFunc(d, (c) => {
            if (c === " ") { return null; }
            return c;
        });
        switchCenter(grid);

        const pf = new Pathfinder<State>();
        const start: Coord[] = [...grid.positions("@")].map((gp) => gp.pos);
        const targetCoords = [...grid.positionsFunc((c) => {
            return c >= "a" && c <= "z";
        })].map((gp) => gp.pos);

        let largestKeySeries: string[] = [];
        const pathWithCost = pf.bfs_weighted(new State(start, []),
            (s) => {
                if (s.keysCollected.length > largestKeySeries.length) {
                    largestKeySeries = s.keysCollected;
                    console.log(`Seen series of ${largestKeySeries.length}: ${largestKeySeries.join()}`);
                }
                const steps = findAllPathsToUnfoundKeys(s, grid);
                return steps.map((step) => {
                    const keys = s.keysCollected.slice(0);
                    const targetKey = grid.forCoord(step.end);
                    keys.push(targetKey);
                    const newPositions = s.robots.slice(0);
                    newPositions[step.robot] = step.end;

                    const newState = new State(newPositions, keys);
                    return { state: newState, cost: step.cost};
                });
            },
            (s) => s.keysCollected.length === targetCoords.length);
        return pathWithCost.cost;
    }
);
(async () => {
    await rig.testFromFile("small_for_b", 32);
    await rig.testFromFile("more_b", 72);
    await rig.runPrint();
})().then(() => { console.log("Done"); });
