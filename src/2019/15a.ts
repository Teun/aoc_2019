import { Coord, Direction, Grid, GridPos, rotate } from "./modules/grid";
import { IntCodeMachine } from "./modules/IntCodeMachine";
import { Rig } from "./modules/rig";

const selectUntried =
    (curr: Coord, grid: Grid<string>,
     myDir: Direction = Direction.North): Direction => {
         const toLeft = curr.neighbourTo(rotate(myDir, -1));
         if (grid.forCoord(toLeft) !== "#") {
             return rotate(myDir, -1);
         } else {
             const toFront = curr.neighbourTo(myDir);
             if (grid.forCoord(toFront) !== "#") {
                return myDir;
             }
         }
         return null;
};

function dfs<T>(g: Grid<T>, from: Coord, to: Coord, access: (v: T) => boolean) {
  const visited = new Set<string>([from.name()]);
  const toExpand = new Set<Coord>([from]);
  const allPaths: {[key: string]: Coord[]} = {};
  allPaths[from.name()] = [from];
  while (true) {
      for (const ex of toExpand.values()) {
        const accNeighbours = ex.neighbours().filter((n) => access(g.forCoord(n)));
        for (const n of accNeighbours) {
          if (n.name() === to.name()) {
              return [...allPaths[ex.name()], n];
          }
          if (!visited.has(n.name())) {
              visited.add(n.name());
              allPaths[n.name()] = [...allPaths[ex.name()], n];
              toExpand.add(n);
          }
      }
    }
  }
}
function dfsAll<T>(g: Grid<T>, from: Coord, access: (v: T) => boolean): number {
    const visited = new Set<string>([from.name()]);
    const toExpand = new Set<Coord>([from]);
    const allPaths: {[key: string]: Coord[]} = {};
    allPaths[from.name()] = [from];
    let lastCount = 0;
    let steps = 0;
    while (visited.size > lastCount) {
        lastCount = visited.size;
        steps += 1;
        const fixed = [...toExpand.values()];
        for (const ex of fixed) {
          const accNeighbours = ex.neighbours().filter((n) => access(g.forCoord(n)));
          for (const n of accNeighbours) {
            if (!visited.has(n.name())) {
                visited.add(n.name());
                allPaths[n.name()] = [...allPaths[ex.name()], n];
                toExpand.add(n);
            }
        }
      }
    }
    return steps - 1;
  }

const rig = new Rig(15,
    async (d) => {
        const machine = new IntCodeMachine(d.split(",").map(Number));
        machine.Run();
        const grid = new Grid<string>();
        let droidCoord = new Coord(0, 0);
        let droidDirection = Direction.North;
        while (true) {
            const stepDirection = selectUntried(droidCoord, grid, droidDirection);
            const targetPos = droidCoord.neighbourTo(stepDirection);
            if (stepDirection === null) {
                droidDirection = rotate(droidDirection, 1);
                continue;
            }
            machine.input([1, 4, 2, 3][stepDirection]);
            const opResult = await machine.readOut();
            if (opResult === 0) {
                grid.set(targetPos, "#");
            } else {
                grid.set(targetPos, opResult === 1 ? "." : "X");
                droidCoord = targetPos;
                droidDirection = stepDirection;
            }
            console.log([...grid.positions()].length);
            // console.log(`Grid boundaries: ${grid.boundaries()[0].name()} to ${grid.boundaries()[1].name()}`);
            if ([...grid.positions()].length === 1659) {
                break;
            }
        }
        const path = dfs(grid, new Coord(0, 0), [...grid.positions("X")][0].pos,
            (v) => v !== "#");
        const oxygen = path[path.length - 1];
        const steps = dfsAll(grid, oxygen, (v) => v !== "#");
        return steps;

    }
);
(async () => {
    await rig.runPrint();
})().then(() => {console.log("Done"); });
