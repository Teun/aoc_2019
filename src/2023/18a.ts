import { Coord, Grid, GridPos, Direction, rotate } from "./modules/grid";
import {Rig} from "./modules/rig";
import { parseToObjects } from "./modules/lineParser";
import { firstBy } from "thenby";

const rig = new Rig(18,
    async (d) => {
        const instructions = parseToObjects(d, /([DLRU]) (\d+) \((#\w{6})\)/,
            (s) => {
                const dist = parseInt(s[3].substring(1,6), 16);
                const dir = {'3': Direction.North, '1': Direction.South, '2': Direction.West, '0': Direction.East}[s[3].substring(6,7)];
                return {dir: dir, steps: dist};
            });
        const horizontalLines = [];
        const verticalLines = [];
        let currPos = new Coord(0,0);
        instructions.forEach((instr) => {
            const nextPos = currPos.stepsTo(instr.dir, instr.steps);
            if(instr.dir == Direction.North || instr.dir == Direction.South){
                verticalLines.push({from: currPos, to: nextPos});
            } else {
                horizontalLines.push({from: currPos, to: nextPos});
            }
            currPos = nextPos;
        });
        const horiLinesY: number[] = [... new Set(horizontalLines.map(l => l.from.y))].sort(firstBy(n => n));
        const vertiLinesX: number[] = [... new Set(verticalLines.map(l => l.from.x))].sort(firstBy(n => n));
        const blocks = horiLinesY.flatMap((y1, i) => {
            if(horiLinesY.length <= i + 1)return [];
            const y2 = horiLinesY[i+1];
            return vertiLinesX.map((x1, j) => {
                if(vertiLinesX.length <= j + 1) return null;
                const x2 = vertiLinesX[j+1];
                return {tl: new Coord(x1, y1), br: new Coord(x2, y2)};
            });
        }).filter(b => b);
        const blocksInside = blocks.filter(b => {
            const pointInside = b.tl
                    .stepsTo(Direction.South, 0.1)
                    .stepsTo(Direction.East, 0.1);
            const linesToWest = verticalLines.filter(l => {
                const top = Math.min(l.from.y, l.to.y);
                const bottom = Math.max(l.from.y, l.to.y);
                return l.from.x < pointInside.x 
                    && top < pointInside.y
                    && bottom > pointInside.y;
            });
            return linesToWest.length % 2 == 1;
        });
        const circumference = (horizontalLines.reduce((a, l) => a + Math.abs(l.to.x - l.from.x), 0)
            + verticalLines.reduce((a, l) => a + Math.abs(l.to.y - l.from.y), 0)
            );
        const fullSurface = 
            blocksInside.reduce((a, b) => a + (b.br.x - b.tl.x) * (b.br.y - b.tl.y), 0)
            +  (circumference/ 2 + 1);
            ;


        return fullSurface;
    }
);

(async () => {
    await rig.test(`R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)`, 952408144115);
    await rig.runPrint();
})().then(() => {console.log("Done"); });



