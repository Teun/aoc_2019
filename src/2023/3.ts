import { Grid, GridPos } from "./modules/grid";
import {Rig} from "./modules/rig";

const rig = new Rig(3,
    async (d) => {
        const grid = new Grid<number>();
        grid.parseFromStringFunc(d, (l) => {
            if(l == '.') return null;
            if(Number.isNaN(Number(l))) {
                return -1;
            }
            return Number(l);
        });
        var digitPoss = grid.positionsFunc((n)=> n!=-1);
        var numberStarts = [...digitPoss ].filter(p => {
            var numLeft = grid.forCoord(p.pos.left);
            return notNum(numLeft);
        });
        var numbers = numberStarts.map(ns => getNumberFor(ns, grid));
        return numbers.filter(v => v.part).reduce((a,v)=> a + Number(v.num), 0);
    
    }
);
function getNumberFor(ns: GridPos<number>, grid: Grid<number>): {num: string, part:boolean} {
    var start = !notNum(grid.forCoord(ns.pos.right)) ? getNumberFor(grid.at(ns.pos.right), grid) 
        : {num: "", part: false};
    if(ns.pos.neigboursDiag().filter(p => grid.forCoord(p) === -1).length > 0){
        start.part = true;
    }
    start.num = ns.val.toString() + start.num;
    return start;
}
function notNum(n: number) {
    return n == null || n === -1;
}


(async () => {
    await rig.test(`467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`, 4361);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

