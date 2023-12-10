import { parseToObjects } from "./modules/lineParser";
import {Rig} from "./modules/rig";

const rig = new Rig(2,
    async (d) => {
        const values = parseToObjects(d, /Game (\d+): (.*)/, (s, n) => {
            var r = {game: Number(s[1]), moves:[]};
            var moves = s[2].split(';').map(m => m.match(/(\d+) (green|blue|red)/g));
            for (const m of moves) {
                var move = {};
                for (const p of m) {
                    var [nr, col] = p.split(' ');
                    move[col] = Number(nr);
                }
                r.moves.push(move);
            }
            return r;
        });
        return values.map(power)
            .reduce((a, v)=> a + v, 0);
    }
);

(async () => {
    await rig.test(`Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`, 2286);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

function power(value: { game: number; moves: any[]; }): number {
    var minSet = value.moves.reduce<{red:number, green:number, blue:number}>((a, m) => {
        if(m.blue > a.blue) a.blue=m.blue;
        if(m.red > a.red) a.red=m.red;
        if(m.green > a.green) a.green=m.green;
        return a;
    }, {red:0, green:0, blue:0});
    return minSet.red * minSet.green * minSet.blue;
}

