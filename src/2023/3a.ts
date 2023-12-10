import { Coord, Grid, GridPos } from "./modules/grid";
import {Rig} from "./modules/rig";

const rig = new Rig(3,
    async (d) => {
        const grid = new Grid<number>();
        grid.parseFromStringFunc(d, (l) => {
            if(l == '.') return null;
            if(l == '*') return -2;
            if(Number.isNaN(Number(l))) {
                return -1;
            }
            return Number(l);
        });
        var digitPoss = grid.positionsFunc((n)=> !notNum(n));
        var numberStarts = [...digitPoss ].filter(p => {
            var numLeft = grid.forCoord(p.pos.left);
            return notNum(numLeft);
        });
        var numbers = numberStarts.map(ns => getNumberFor(ns, grid));
        var gears = numbers.reduce<{ [id: string] : number[] }>((a,v) => {
            v.gear.forEach(g => {
                if(! (g in a)){
                    a[g] = [];
                }
                a[g].push(Number(v.num));
            });
            return a;
        },  {});
        return Object.keys(gears).filter(k => gears[k].length === 2)
            .reduce((a,v) => a + gears[v][0] * gears[v][1], 0);
    
    }
);
function getNumberFor(ns: GridPos<number>, grid: Grid<number>): {num: string, part:boolean, gear: Set<string>} {
    var start = !notNum(grid.forCoord(ns.pos.right)) ? getNumberFor(grid.at(ns.pos.right), grid) 
        : {num: "", part: false, gear: new Set<string>()};
    if(ns.pos.neigboursDiag().filter(p => grid.forCoord(p) === -1 || grid.forCoord(p) === -2).length > 0){
        start.part = true;
    }
    ns.pos.neigboursDiag().filter(p => grid.forCoord(p) === -2).forEach(gearPos => {
        start.gear.add(gearPos.name());
    })
    start.num = ns.val.toString() + start.num;
    return start;
}
function notNum(n: number) {
    return n == null || n === -1 || n === -2;
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
.664.598..`, 467835);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

