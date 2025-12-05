import { Rig } from '../main_modules/rig';

const re = /^(\d+)\1+$/;
const invalid = (n: number) => {
    let s = n.toString();
    // regex that matches a repeating pattern
    let match = s.match(re);
    if(match) return true;
    return false;
}

const rig = new Rig(2, async (input, opt, testOpt) => {
    const ranges = input.split(',').map(r => r.split('-').map(Number));
    let sum = 0;
    for(let range of ranges) {
        for(let i = range[0]; i <= range[1]; i++) {
            if(invalid(i)) sum += i;
        }
    }
    return sum;
});

(async () => {
    await rig.test(`11-22,95-115,998-1012,1188511880-1188511890,222220-222224,
1698522-1698528,446443-446449,38593856-38593862,565653-565659,
824824821-824824827,2121212118-2121212124`, 4174379265);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
