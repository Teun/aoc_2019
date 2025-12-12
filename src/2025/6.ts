import { Rig } from '../main_modules/rig';

const reducers = {
    '+': (col: number[]) => col.reduce((a, b) => a + b, 0),
    '*': (col: number[]) => col.reduce((a, b) => a * b, 1),
}
const getNumbers = (s: string) => 
    s.split(/\s/).filter(x => x !== '').map(Number);
const rig = new Rig(6, async (input, opt, testOpt) => {
    let lines = input.split('\n').filter(x => x !== '');
    var linesWithNumbers = lines.filter(x => x.match(/\d/));
    var lastLine = lines[lines.length - 1];
    const numbers = linesWithNumbers.map(getNumbers);
    const operators = lastLine.split(' ').map(s => s.trim()).filter(x => x !== '');
    let sum = 0;
    for (let index = 0; index < operators.length; index++) {
        const op = operators[index];
        const col: number[] = numbers.map((op, j) => 
                numbers[j][index]);
        sum += reducers[op](col);
    }
    return sum;
});

(async () => {
    await rig.test(`123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   + `, 4277556);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

