import { Rig } from '../main_modules/rig';
import { parseToObjects } from '../main_modules/lineParser';

const rig = new Rig(3, async (input, opt, testOpt) => {
    const banks = parseToObjects(input, /(\d+)/, (matches, lineNum) => {
        return matches[1];
    });
    const sum = banks.reduce((a, v) => a + maxJoltage(v), 0);

    return sum;
});

const maxJoltage = (bank: string) => {
    const chars: string[] = getBestSequence(bank, 2);
    return Number(chars.join(''));
}

(async () => {
    await rig.test(`987654321111111
811111111111119
234234234234278
818181911112111`, 357);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

function getBestSequence(bank: string, nr: number): string[] {
    let partialBank = bank;
    let result = [];
    for (let index = 0; index < nr; index++) {
        let found = getBestDigitFrom(partialBank, nr - index - 1);
        result.push(found.digit);
        partialBank = partialBank.substring(found.pos + 1);
    }
    return result;
}
function getBestDigitFrom(bank : string, leaveAtEnd: number) {
    for (let digit = 9; digit >= 0; digit--) {
        let ix = bank.indexOf(digit.toString());
        if(ix > -1 && ix < bank.length - leaveAtEnd) return {digit: bank[ix], pos: ix};
    }

}