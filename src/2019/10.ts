import { bigCombination } from "js-combinatorics";
import { firstBy as by } from "thenby";
import {Coord, Grid} from "./modules/grid";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const canSee = (first: Coord, second: Coord, all: Set<string>) => {
    if (first.name() === second.name()) { return false; }
    const lowestXCoord = first.x < second.x ? first : second;
    const highestXCoord = first.x < second.x ? second : first;
    const lowestYCoord = first.y < second.y ? first : second;
    const highestYCoord = first.y < second.y ? second : first;
    for (let step =  1; step < highestXCoord.x - lowestXCoord.x; step++) {
        const vx = lowestXCoord.x + step;
        const vy = lowestXCoord.y +
            (highestXCoord.y - lowestXCoord.y) *
            (step / (highestXCoord.x - lowestXCoord.x));
        if (all.has(`${vx}x${vy}`)) {
            return false;
        }
    }
    for (let step =  1; step < highestYCoord.y - lowestYCoord.y; step++) {
        const vy = lowestYCoord.y + step;
        const vx = lowestYCoord.x +
            (highestYCoord.x - lowestYCoord.x) *
            (step / (highestYCoord.y - lowestYCoord.y));
        if (all.has(`${vx}x${vy}`)) {
            return false;
        }
        }
    return true;
};

const findAllScores = (all: Coord[]) => {
    const allCombinations = bigCombination(all, 2).toArray();
    const allVisible = allCombinations.filter((cb) => canSee(cb[0], cb[1], new Set(all.map((c) => c.name()))));
    return all.map((p) => {
        return {
            pos: p.name(),
            score: allVisible.filter((combi) => combi[0].name() === p.name() || combi[1].name() === p.name()).length
        };
    });
};

const rig = new Rig(10,
    async (d) => {
        const grid = new Grid<string>();
        grid.parseFromString(d, {"#": "#"});
        const allPositions = [...grid.positions()].map((gp) => gp.pos);
        const positionsWithScore = findAllScores(allPositions)
            .sort(by((cb) => cb.score, -1));
        return positionsWithScore[0];
    }
);
(async () => {
    await rig.testFromFile("tiny", {pos: "3x4", score: 8});
    await rig.testFromFile("larger0", { pos: "3x2", score: 21 });
    await rig.testFromFile("larger1", { pos: "5x8", score: 33});
    await rig.testFromFile("large", { pos: "11x13", score: 210 });
    await rig.runPrint();
})().then(() => {console.log("Done"); });
