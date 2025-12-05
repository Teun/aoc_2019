import { Rig } from '../main_modules/rig';
import { parseToObjects } from '../main_modules/lineParser';

const rig = new Rig(1, async (input, opt, testOpt) => {
    const vals = parseToObjects(input, /([LR])(\d+)/, (matches, lineNum) => {
        return {nr: Number(matches[2]), sign: matches[1] === 'L' ? -1 : 1};
    });
    var zeroes = 0;
    var pos = 50;
    for(let move of vals) {
        var moves = move.nr * move.sign;
        while (moves !== 0) {
            if(moves > 99) {
                zeroes++;
                moves -= 100;
                continue;
            }
            if(moves < -99) {
                zeroes++;
                moves += 100;
                continue;
            }
            let fromZero = pos === 0;
            pos += moves;
            moves = 0;

            if(pos < 0) {
                if(!fromZero) zeroes++;
                pos += 100;
                continue;
            }
            if(pos > 99) {
                zeroes++;
                pos -= 100;
                continue;
            }
            if(pos === 0) {
                zeroes++;
            }
        }
    }
    return zeroes;
});

(async () => {
    await rig.test(`L68
L30
R48
L5
R60
L55
L1
L99
R14
L82`, 6);
    await rig.runPrint();
})().then(() => {console.log("Done"); });