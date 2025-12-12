import { Rig } from '../main_modules/rig';
import { Coord, Direction, DirectionDiag, Grid } from '../main_modules/grid';
const rig = new Rig(7, async (input, opt, testOpt) => {
    const g = new Grid<string>();
    g.parseFromString(input, {"^": "^", 'S': "S"});

    let beams: {[key: string]: number} = [...g.positions("S")].reduce((a, v) => { 
            a[v.pos.name()] = 1;
            return a;
        }, {});
    while(true){
        beams = Object.keys(beams).reduce((a, k) => {
            const b = new Coord(k);
            const beamNr = beams[k];
            const newPos = [];
            if(g.forCoord(b) === "^"){
                newPos.push(b.below.right.name());
                newPos.push(b.below.left.name());
            } else {
                newPos.push(b.below.name());
            }
            newPos.forEach(np => {
                if(!(np in a)) a[np] = 0;
                a[np] += beamNr;
            });
            return a;
        }, {});
        if(new Coord(Object.keys(beams)[0]).y > g.boundaries()[1].y) break;
    }

    return Object.values(beams).reduce((a,v) => a + v, 0);
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
...............`, 40);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

