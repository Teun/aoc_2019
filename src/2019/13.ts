import { Coord, Grid } from "./modules/grid";
import { IntCodeMachine } from "./modules/IntCodeMachine";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const findBestMove = (grid: Grid<string>, prevBallCoord: Coord) => {
    const currBall = [...grid.positions("o")][0].pos;
    const paddle = [...grid.positions("-")][0].pos;
    if (paddle.x < currBall.x) { return 1; }
    if (paddle.x > currBall.x) { return -1; }
    return 0;
};

const rig = new Rig(13,
    async (d) => {
        const gameMachine = new IntCodeMachine(d.split(",").map(Number));
        const grid = new Grid<string>();
        let score = null;
        let prevBallCoord: Coord = null;
        gameMachine.Memory[0] = 2; // insert coin
        gameMachine.Run();
        while (true) {
            const running = await gameMachine.waitForOutput();
            gameMachine.readOutTillEmpty(
                (values) => {
                    const [x, y, type] = values;
                    if (x === -1 && y === 0) {
                        score = type;
                    } else {
                        grid.set(new Coord(x, y), [".", "#", "*", "-", "o"][type]);
                    }
                    console.log(grid.toString());
                    console.log(`Score: ${score}`);
            }, 3
            );
            if (!running) {break; }
            if (score !== null) {
                const bestMove = findBestMove(grid, prevBallCoord);
                gameMachine.input(bestMove);
                prevBallCoord = [...grid.positions("o")][0].pos;
            }
        }
        return score;
    }
);
(async () => {
    await rig.runPrint();
})().then(() => {console.log("Done"); });
