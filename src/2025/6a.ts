import { Rig } from '../main_modules/rig';

const reducers = {
    '+': (col: number[]) => col.reduce((a, b) => a + b, 0),
    '*': (col: number[]) => col.reduce((a, b) => a * b, 1),
}

const rig = new Rig(6, async (input, opt, testOpt) => {
    let lines = input.split('\n').filter(x => x !== '');
    var linesWithNumbers = lines.filter(x => x.match(/\d/));
    var lastLine = lines[lines.length - 1];
    const cols: number[][] = ExtractNumbersFromLines(linesWithNumbers);
    const operators = lastLine.split(' ').map(s => s.trim()).filter(x => x !== '');

    let sum = 0;

    for (let index = 0; index < operators.length; index++) {
        const op = operators[index];
        const col: number[] = cols[index];
        sum += reducers[op](col);
    }
    return sum;
});

(async () => {
    await rig.test(`123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   + `, 3263827);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

function ExtractNumbersFromLines(lines: string[]): number[][] {
    const result: number[][] = [];
    for (let pos = 0; pos < lines[0].length; pos++) {
        if(lines.every(line => line[pos] === ' ')) {
            const col = getNumbersBefore(pos, lines);
            result.push(col);
        }
    }
    // last column
    result.push(getNumbersBefore(lines[0].length, lines));
    return result;
}

function getNumbersBefore(pos: number, lines: string[]) {
    const col: number[] = [];
    while(true) {
        pos--;
        if (pos < 0) break;
        var number = lines.map(l => l[pos]).join('');
        if (number.match(/\d/)) {
            col.push(Number(number));
        }else{
            break;
        }
    }
    return col;
}

