import { firstBy } from "thenby";
import { Coord, Direction, Grid, rotate } from "./modules/grid";
import { IHashcode, Pathfinder } from "./modules/pathfinding";
import { Rig } from "./modules/rig";

class State implements IHashcode {
    constructor(public pos: Coord, public level: number) {}

    public getHash() {
        return this.pos.name() + "_" + this.level;
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
        const wormholesIn: {[key: string]: Coord} = {};
        const wormholesOut: {[key: string]: Coord} = {};
        const boundaries = grid.boundaries();
        Object.keys(allLabels).map((k) => allLabels[k])
            .filter((v) => v.length === 2)
            .forEach((v) => {
                v.sort(firstBy((c) => {
                    return c.x < boundaries[0].x + 3 ||
                        c.x > boundaries[1].x - 3 ||
                        c.y < boundaries[0].y + 3 ||
                        c.y > boundaries[1].y - 3;
                }));
                wormholesIn[v[0].name()] = v[1];
                wormholesOut[v[1].name()] = v[0];
            });

        const pf = new Pathfinder<State>();
        const target = allLabels.ZZ[0].name();
        const shortest = pf.bfs(new State(allLabels.AA[0], 0),
            (p) => {
                const neighbours = p.pos.neighbours()
                    .filter((n) => grid.forCoord(n) === ".")
                    .map((n) => new State(n, p.level));
                if (p.pos.name() in wormholesIn) {
                    neighbours.push(new State(wormholesIn[p.pos.name()], p.level + 1));
                }
                if (p.pos.name() in wormholesOut && p.level > 0) {
                    neighbours.push(new State(wormholesOut[p.pos.name()], p.level - 1));
                }
                return neighbours;
            },
            (isTarget) => isTarget.pos.name() === target && isTarget.level === 0);
        return shortest.length - 1;
    }
);
(async () => {
    await rig.testFromFile("small", 26);
    await rig.testFromFile("large", 396);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
