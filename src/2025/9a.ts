import { Rig } from '../main_modules/rig';
import { Coord, Grid } from '../main_modules/grid';
import { parseToObjects } from '../main_modules/lineParser';
import { bigCombination, combination } from "js-combinatorics";
import{ plotGrid } from '../main_modules/gridplot';

const rig = new Rig(9, async (input, opt, testOpt) => {
    const corners = parseToObjects(input, /(\d+),(\d+)/,
            (l) => new Coord(parseInt(l[1]), parseInt(l[2])));
    const seqCorners = corners
        .map((c, i) => {
            const next = i == corners.length - 1 ? corners[0] : corners[i + 1];
            return {first: c, next};
        });
    const horizontalLines = seqCorners
        .map((p) => {
            if(p.first.y === p.next.y) return {y: p.first.y, lowestX: Math.min(p.first.x, p.next.x), highestX: Math.max(p.first.x, p.next.x)};
            return null;
        }).filter(c => c !== null);
    const verticalLines = seqCorners
        .map((p) => {
            if(p.first.x === p.next.x) return {x: p.first.x, lowestY: Math.min(p.first.y, p.next.y), highestY: Math.max(p.first.y, p.next.y)};
            return null;
        }).filter(c => c !== null);
    const pairs = bigCombination(corners, 2).toArray()
        .filter(p => valid(p, horizontalLines, verticalLines));

    pairs.sort((a, b) => {
        const srfA = surface(a[0], a[1]);
        const srfB = surface(b[0], b[1]);
        return srfB - srfA;
    });
    return surface(pairs[0][0], pairs[0][1]);
});

(async () => {
    await rig.test(`7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3`, 24);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

function surface(corner1: Coord, corner2: Coord) {
    return (Math.abs(corner1.x-corner2.x) + 1) * (Math.abs(corner1.y-corner2.y) + 1);
}

function valid(p: Coord[], horizontalLines: { y: number; lowestX: number; highestX: number; }[], verticalLines: { x: number; lowestY: number; highestY: number; }[]): boolean {
    const lowX = Math.min(p[0].x, p[1].x);
    const highX = Math.max(p[0].x, p[1].x);
    const lowY = Math.min(p[0].y, p[1].y);
    const highY = Math.max(p[0].y, p[1].y);

    const crossingH1 = horizontalLines
        .filter(h => h.y >= lowY && h.y <= highY 
            && h.lowestX <= lowX && h.highestX >= lowX);
    const crossingH2 = horizontalLines
        .filter(h => h.y >= lowY && h.y <= highY
            && h.lowestX <= highX && h.highestX >= highX);

    return true;
}

