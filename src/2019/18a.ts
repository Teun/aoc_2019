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
            this._hash = `${this.robots.map((c) => c.name()).join()}_${this.keysCollected.join("")}`;
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

        let keyFound = 0;

        const path = pf.bfs_weighted(new State(start, []),
            (s) => {
                if (s.keysCollected.length > keyFound) {
                    keyFound = s.keysCollected.length;
                    console.log(`Found keys: ${keyFound}`);
                }
                let moves: Array<[number, Coord]> = [];
                s.robots
                    .forEach((r, i) => {
                        const positions = r.neighbours().filter((n) => {
                            const val = grid.forCoord(n);
                            if (val === "#") { return false; }
                            if (val >= "A" && val <= "Z") { return s.keysCollected.indexOf(val.toLowerCase()) > -1; }
                            return true;
                        });
                        moves = moves.concat(positions.map((p) => [i, p]));
                    });
                return moves.map((m) => {
                    const val = grid.forCoord(m[1]);
                    const keys = new Set(s.keysCollected);
                    if (val >= "a" && val <= "z" && !keys.has(val)) {
                        keys.add(val);
                    }
                    const positions = s.robots.slice(0);
                    positions[m[0]] = m[1];
                    return { state: new State(positions, [...keys.values()].sort()), cost: 1};
                });
            },
            (s) => s.keysCollected.length === targetCoords.length);

        return path.length - 1;
    }
);
(async () => {
    await rig.testFromFile("small_for_b", 32);
    await rig.testFromFile("more_b", 72);
    await rig.runPrint();
})().then(() => { console.log("Done"); });
