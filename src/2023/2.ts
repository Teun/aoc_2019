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
        return values.filter(g => possible(g, {red:12, green: 13, blue: 14}))
            .reduce((a, v)=> a + v.game, 0);
    }
);

(async () => {
    await rig.test(`Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`, 8);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

function possible(g: { game: number; moves: any[]; }, max: { red: number; green: number; blue: number; }): boolean {
    return g.moves.every(m => (m.red||0) <= max.red && (m.green||0) <= max.green && (m.blue||0) <= max.blue)
}

