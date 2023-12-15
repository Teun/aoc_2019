import { Coord, Grid, GridPos, Direction } from "./modules/grid";
import {Rig} from "./modules/rig";

const rig = new Rig(10,
    async (d) => {
        const grid = new Grid<string>();
        grid.parseFromString(d, {S: "S", L:"L", F:"F", J:"J", "7": "7", "-":"-", "|":"|"});
        const [start] = [...grid.positions('S')];

        const loop = findLoop(start.pos, grid);
        const inLoop = loop.reduce((a,v) => { a[v.pos.name()]= true; return a; }, {});
        const [topleft, bottomright] = grid.boundaries();
        let enclosed = 0;
        for (let y = topleft.y; y <= bottomright.y; y++) {
            let passed = 0;
            for (let x = topleft.x; x <= bottomright.x; x++) {
                const pos = new Coord(x,y);
                const token = grid.forCoord(pos);
                if(! (pos.name() in inLoop)){
                    if(passed % 2 === 1) enclosed++;
                }else{
                    // this is part of the loop
                    if("|LJ".indexOf(token) > -1) {
                        passed++;
                    }
                }

            }
        }
        return enclosed;

    }
);
function findLoop(from: Coord, grid: Grid<string>) {
    const startDirection = [Direction.North, Direction.East, Direction.South, Direction.West].filter(d => {
        const nextPos = from.neighbourTo(d);
        const bend = grid.forCoord(nextPos);
        return directionChange(d, bend) !== null;
    })[0];
    let currPos = from.neighbourTo(startDirection);
    let currDir = startDirection;
    const result: {pos: Coord, step: Direction}[] = 
        [{pos:currPos, step:currDir}];
    do{
        currDir = directionChange(currDir, grid.forCoord(currPos));
        currPos = currPos.neighbourTo(currDir);
        result.push({pos: currPos, step:currDir});
    }while(!currPos.equals(from))
    return result;
}
function directionChange(oldDir: Direction, bend: string): Direction | null {
    let newDir: Direction | null = null;
    switch (oldDir) {
        case Direction.East:
            newDir = { '-': Direction.East, 'J': Direction.North, '7': Direction.South}[bend];
            break;
        case Direction.West:
            newDir = { '-': Direction.West, 'L': Direction.North, 'F': Direction.South}[bend];
            break;
        case Direction.South:
            newDir = { '|': Direction.South, 'L': Direction.East, 'J': Direction.West}[bend];
            break;
        case Direction.North:
            newDir = { '|': Direction.North, 'F': Direction.East, '7': Direction.West}[bend];
            break;
    }
    if(newDir === undefined) return null;
    return newDir;
}


(async () => {
    await rig.test(`.F----7F7F7F7F-7....
.|F--7||||||||FJ....
.||.FJ||||||||L7....
FJL7L7LJLJ||LJ.L-7..
L--J.L7...LJS7F-7L7.
....F-J..F7FJ|L7L7L7
....L7.F7||L7|.L7L7|
.....|FJLJ|FJ|F7|.LJ
....FJL-7.||.||||...
....L---J.LJ.LJLJ...`, 8);
    await rig.runPrint();
})().then(() => {console.log("Done"); });


