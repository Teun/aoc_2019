import { Rig } from '../main_modules/rig';
import { Coord, Direction, DirectionDiag, Grid } from '../main_modules/grid';
const rig = new Rig(7, async (input, opt, testOpt) => {
    const g = new Grid<string>();
    g.parseFromString(input, {"^": "^", 'S': "S"});
    let splits = 0;

    let beams = new Set([...g.positions("S")].map(p => p.pos.name()));
    while(true){
        beams = new Set([...beams].flatMap(bs => {
            const b = new Coord(bs);
            if(g.forCoord(b) === "^"){
                splits++;
                return [b.below.right, b.below.left];
            } else {
                return [b.below];
            }
        }).map(c => c.name()));
        if(new Coord([...beams][0]).y > g.boundaries()[1].y) break;
    }

    return splits;
});

(async () => {
    await rig.test(`.......S.......
...............
.......^.......
...............
......^.^......
...............
.....^.^.^.....
...............
....^.^...^....
...............
...^.^...^.^...
...............
..^...^.....^..
...............
.^.^.^.^.^...^.
...............`, 21);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

