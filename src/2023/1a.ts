import { parseToObjects } from "./modules/lineParser";
import {Rig} from "./modules/rig";
const num = (s) => {
    return {'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8',  'nine': '9'}[s] || s; 
}
const getDigits = (s) => {
    var result = []; var match;
    var pat = /(?=(\d|one|two|three|four|five|six|seven|eight|nine))\w/g;
    while ( (match = pat.exec( s ) ) != null ) {
        result.push( match[1] );
    }
    return result.map(num);
}
const rig = new Rig(1,
    async (d) => {
        const values = parseToObjects(d, /\w+/, (s, n) => {
            var allDigits = getDigits(s[0]);
            return Number(allDigits[0] + allDigits[allDigits.length-1]);
        });
        return values.reduce((a, v) => a + v, 0);
    }
);

(async () => {
    await rig.test(`1abc2
    pqr3stu8vwx
    a1b2c3d4e5f
    treb7uchet`, 142);
    await rig.test(`twoeightwo`, 22);
    await rig.test(`onine`, 99);
    await rig.test(`two1nine
    eightwothree
    abcone2threexyz
    xtwone3four
    4nineeightseven2
    zoneight234
    7pqrstsixteen`, 281);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
