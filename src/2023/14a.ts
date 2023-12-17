import { Coord, Grid, GridPos, Direction } from "./modules/grid";
import {Rig} from "./modules/rig";

const rig = new Rig(14,
    async (d) => {
        const grid = new Grid<'O'|'#'>();
        grid.parseFromString(d, {'O':'O', '#':'#'});
        let currGrid = grid;

        let seen: {[id:string]:number} = {};
        for (let cycle = 1; cycle <= 1000000000; cycle++) {
            currGrid = runCycle(currGrid);
            const hash = currGrid.hash();
            if(cycle % 100 == 0)console.log(`After cycle ${cycle}:\n${hash}`);
            if(hash in seen){
                // do smart
                const loopsize = cycle - seen[hash];
                const loopsToGo = Math.floor((1000000000 - cycle)/loopsize);
                cycle += loopsize * loopsToGo;
                console.log(`Jumped from cycle ${cycle - loopsize * loopsToGo} to cycle ${cycle}`);
                seen = {};
            }else{
                seen[hash] = cycle;
            }
        }
        const [_, bottomright] = grid.boundaries();
        return [...currGrid.positions('O')].reduce((a,v)=> {
            return a + bottomright.y + 1 - v.pos.y;
        },0);

    }
);

function runCycle(grid: Grid<"O" | "#">): Grid<"O" | "#"> {
    let result = grid;
    result = moveAll(result, Direction.North);
    result = moveAll(result, Direction.West);
    result = moveAll(result, Direction.South);
    result = moveAll(result, Direction.East);
    return result;
}
function moveAll(grid: Grid<"O" | "#">, dir: Direction): Grid<"O" | "#"> {
    const result = new Grid<'O'|'#'>();
    for (const rock of grid.positions('#')) {
        result.add(rock.pos, rock.val);
    }
    const [topleft, bottomright] = grid.boundaries();
    rocks: for (const rock of grid.positions('O')) {
        let pos = rock.pos;
        let countOthers = 0;
        scan: while(true){
            const nextPos = pos.neighbourTo(dir);
            if(grid.forCoord(nextPos) == "#" || !nextPos.inside(topleft, bottomright)){
                result.add(pos.stepsTo(dir, -countOthers), 'O');
                continue rocks;
            }else if(grid.forCoord(nextPos) == "O"){
                countOthers++;
            }
            pos = nextPos;
        }
    }
    return result;
}





(async () => {
    await rig.test(`O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`, 64);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

