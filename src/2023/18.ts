import { Coord, Grid, GridPos, Direction, rotate } from "./modules/grid";
import {Rig} from "./modules/rig";
import { parseToObjects } from "./modules/lineParser";

const rig = new Rig(18,
    async (d) => {
        const instructions = parseToObjects(d, /([DLRU]) (\d+) \((#\w{6})\)/,
            (s) => {
                const dir = {'U': Direction.North, 'D': Direction.South, 'L': Direction.West, 'R': Direction.East}[s[1]];
                return {dir: dir, steps: Number(s[2]), color: s[3]};
            });
        const grid = new Grid<string>();
        let curr = new Coord(0,0);
        grid.set(curr, "#");
        instructions.forEach(i => {
            for (let index = 0; index < i.steps; index++) {
                curr = curr.neighbourTo(i.dir);
                grid.set(curr, "#");
            }
        });
        let [topleft, bottomright] = grid.boundaries();
        topleft = topleft.above.left;
        bottomright = bottomright.below.right;
        const toExpand = [topleft];
        const visited: {[id:string]: boolean} = {};
        visited[toExpand[0].name()] = true;
        grid.set(topleft, '.');
        while(true){
            if(toExpand.length === 0) break;
            const neighbours = toExpand.pop().neighbours().filter(n => {
                return n.inside(topleft, bottomright) 
                    && !(n.name() in visited)
                    && grid.forCoord(n) !== "#";
            });
            for (const neighbour of neighbours) {
                visited[neighbour.name()] = true;
                grid.set(neighbour, '.');
                toExpand.unshift(neighbour);
            }
        }
        
        // for (let y = topleft.y; y <= bottomright.y ; y++) {
        //     let inside = false;
        //     for (let x = topleft.x; x <= bottomright.x ; x++) {
        //         const thisPos = new Coord(x,y);
        //         const prevPos = new Coord(x-1,y);
        //         if(grid.forCoord(thisPos) !== grid.forCoord(prevPos)){
        //             const newState = grid.forCoord(thisPos);
        //             if(newState === null){
        //                 inside = !inside;
        //             }
        //         }
        //         if(inside && grid.forCoord(thisPos) === null){
        //             grid.set(thisPos, "x");
        //         }
        //     }
        // }
        console.log(grid.toString());

        return (bottomright.y + 1 - topleft.y) * (bottomright.x + 1 - topleft.x)
            - [...grid.positions('.')].length
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
U 2 (#7a21e3)`, 62);
    await rig.runPrint();
})().then(() => {console.log("Done"); });



