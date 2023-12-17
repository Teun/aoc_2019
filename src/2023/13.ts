import { start } from "repl";
import { Coord, Grid, GridPos, Direction } from "./modules/grid";
import {Rig} from "./modules/rig";

const rig = new Rig(13,
    async (d) => {
        const grids = d.split("\n\n").map(s=> {
            const r = new Grid<string>()
            r.parseFromString(s, {"#":"#"});
            return r;
        });
        const mirrors = grids.map(g=>{
            return {
                hor: findHorizontalMirror(g),
                vert: findVerticalMirror(g)
            }
        });
        return mirrors.reduce((a,v) => {
            if(v.vert !== null) return a + v.vert;
            if(v.hor !== null) return a + 100 * v.hor;
            return a;
        }, 0);
    }
);

function findHorizontalMirror(g: Grid<string>): number|null {
    const [topleft, bottomright] = g.boundaries();
    console.log(g.toString());
    mirror: for (let mirrorIx = 1; mirrorIx <= bottomright.y; mirrorIx++) {
        console.log('mirror', mirrorIx);
        line: for (let lineIx = 0; lineIx < mirrorIx; lineIx++) {
            const mirrorred = mirrorIx + (mirrorIx - lineIx) - 1;
            if(mirrorred > bottomright.y) continue line;
            for (let pos = 0; pos <= bottomright.x; pos++) {
                const first = new Coord(pos, lineIx);
                const second = new Coord(pos, mirrorred);
                console.log(first.name(),g.forCoord(first), second.name(), g.forCoord(second));
                if(g.forCoord(first) !== g.forCoord(second)){
                    continue mirror;
                }
            }
        }
        return mirrorIx;
    }
    return null;
}

function findVerticalMirror(g: Grid<string>): number|null {
    const [topleft, bottomright] = g.boundaries();
    console.log(g.toString());
    mirror: for (let mirrorIx = 1; mirrorIx <= bottomright.x; mirrorIx++) {
        console.log('mirror', mirrorIx);
        col: for (let colIx = 0; colIx < mirrorIx; colIx++) {
            const mirrorred = mirrorIx + (mirrorIx - colIx) - 1;
            if(mirrorred > bottomright.x) continue col;
            for (let pos = 0; pos <= bottomright.y; pos++) {
                const first = new Coord(colIx, pos);
                const second = new Coord(mirrorred, pos);
                console.log(first.name(),g.forCoord(first), second.name(), g.forCoord(second));
                if(g.forCoord(first) !== g.forCoord(second)){
                    continue mirror;
                }
            }
        }
        return mirrorIx;
    }
    return null;
}

(async () => {
    await rig.test(`#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#`, 405);
    await rig.runPrint();
})().then(() => {console.log("Done"); });


