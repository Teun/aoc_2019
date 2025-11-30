import { Coord, Grid, GridPos, Direction, rotate } from "./modules/grid";
import {Rig} from "./modules/rig";
import { IHashcode, IVector, Pathfinder } from "./modules/pathfinding";

const rig = new Rig(17,
    async (d) => {
        const grid = new Grid<number>();
        grid.parseFromStringFunc(d, (s)=>Number(s));
        const [topleft, bottomright] = grid.boundaries();
        const start = new Coord(0,0);
        const end = bottomright;
        const pf = new Pathfinder();

        const result = pf.bfs_weighted(new State(start,Direction.East, 0), (prev: State) => {
            var res: IVector<State>[] = [];
            if(prev.straightTurns < 3){
                const forwardPos = prev.pos.neighbourTo(prev.dir);
                res.push({ cost: grid.forCoord(forwardPos), state: new State(forwardPos, prev.dir, prev.straightTurns + 1)});
            }
            const toRight = rotate(prev.dir, -1);
            const rightPos = prev.pos.neighbourTo(toRight);
            res.push({ cost: grid.forCoord(rightPos), state: new State(rightPos, toRight, 1)});
            const toLeft = rotate(prev.dir, 1);
            const leftPos = prev.pos.neighbourTo(toLeft);
            res.push({cost:grid.forCoord(leftPos), state:new State(leftPos, toLeft, 1)});
            return res.filter(s => s.state.pos.inside(start, end));
        }, (p: State)=> p.pos.equals(end))
        return result.cost;
    }
);
class State implements IHashcode {
    constructor(public pos: Coord, public dir: Direction, public straightTurns: number) {}
    getHash() {
        return `${this.pos.name()}|${this.dir}|${this.straightTurns}`;
    }
}
(async () => {
    await rig.test(`2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533`, 102);
    await rig.runPrint();
})().then(() => {console.log("Done"); });



