import { Coord, Grid, GridPos } from "./modules/grid";
import {Rig} from "./modules/rig";

const rig = new Rig(21,
    async (d, rc, tst: {steps: number}) => {
        const grid = new Grid<string>();
        grid.parseFromString(d, {'S':'S', '#':'#', '.':'.'});
        const start = [...grid.positions('S')][0];
        grid.set(start.pos, '.');
        const infiniteGrid = new InfiniteGrid(grid, grid.boundaries());
        let locations = new Set<string>();
        locations.add(start.pos.name());
        for (let steps = 0; steps < tst.steps; steps++) {
            const newSet = new Set<string>();
            for (const oldPos of locations) {
                (new Coord(oldPos)).neighbours().filter(p => infiniteGrid.forCoord(p) == '.' || grid.forCoord(p) == 'S')
                    .forEach(c => newSet.add(c.name()));
            }
            locations = newSet;
            console.log(`After step ${steps}: ${locations.size} positions`);
            if(true){
                const newGrid = grid.clone();
                locations.forEach(c => newGrid.set(new Coord(c), 'O'));
                console.log(newGrid.toString());    
            }
        }
        return locations.size;
    }
);
class InfiniteGrid
{
    constructor(private source: Grid<string>, private boundary: Coord[]){
    }
    forCoord(p: Coord) {
        if(p.inside(this.boundary[0], this.boundary[1])){
            return this.source.forCoord(p);
        }
        const blockSizeX = this.boundary[1].x - this.boundary[0].x + 1;
        const shiftX = Math.floor((p.x - this.boundary[0].x)/blockSizeX);
        const x = p.x - shiftX * blockSizeX;
        const blockSizeY = this.boundary[1].y - this.boundary[0].y + 1;
        const shiftY = Math.floor((p.y - this.boundary[0].y)/blockSizeY);
        const y = p.y - shiftY * blockSizeY;
        return this.source.forCoord(new Coord(x,y));
    }
}
(async () => {
    await rig.test(`...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`, 1594, {steps: 50});
await rig.test(`...........
......##.#.
.###..#..#.
..#.#...#..
....#.#....
.....S.....
.##......#.
.......##..
.##.#.####.
.##...#.##.
...........`, 1940, {steps: 50});
    await rig.runPrint({steps:1000});
})().then(() => {console.log("Done"); });

