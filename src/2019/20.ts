import { Coord, Direction, Grid, rotate } from "./modules/grid";
import { IHashcode, Pathfinder } from "./modules/pathfinding";
import { Rig } from "./modules/rig";

class State implements IHashcode {
    constructor(public pos: Coord) {}

    public getHash() {
        return this.pos.name();
    }
}

const rig = new Rig(20,
    async (d) => {
        const grid = new Grid<string>();
        grid.parseFromStringFunc(d,
            (c) => {
                return c;
            });
        const allLabels: {[key: string]: Coord[]} = {};
        [...grid.positions()].forEach((gp) => {
            const char = gp.val[0];
            if (char >= "A" && char <= "Z") {
                // this is part of a label
                [Direction.North, Direction.East, Direction.South, Direction.West].forEach((dir) => {
                    if (grid.forCoord(gp.pos.neighbourTo(dir)) === ".") {
                        let label = grid.forCoord(gp.pos.neighbourTo(rotate(dir, 2))) + char;
                        if (dir === Direction.North || dir === Direction.West) {
                            label = label.split("").reverse().join("");
                        }
                        allLabels[label] = allLabels[label] || [];
                        allLabels[label].push(gp.pos.neighbourTo(dir));
                    }
                });
            }
        });
        const wormholes: {[key: string]: Coord} = {};
        Object.keys(allLabels).map((k) => allLabels[k])
            .filter((v) => v.length === 2)
            .forEach((v) => {
                wormholes[v[0].name()] = v[1];
                wormholes[v[1].name()] = v[0];
            });

        const pf = new Pathfinder<State>();
        const target = allLabels.ZZ[0].name();
        const shortest = pf.bfs(new State(allLabels.AA[0]),
            (p) => {
                const neighbours = p.pos.neighbours()
                    .filter((n) => grid.forCoord(n) === ".");
                if (p.pos.name() in wormholes) {
                    neighbours.push(wormholes[p.pos.name()]);
                }
                return neighbours.map((n) => new State(n));
            },
            (isTarget) => isTarget.pos.name() === target);
        return shortest.length - 1;
    }
);
(async () => {
    await rig.testFromFile("small", 23);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
