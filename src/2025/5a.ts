import { Rig } from '../main_modules/rig';
import { parseToObjects } from '../main_modules/lineParser';

interface Range {
    start: number;
    end: number;
}
class RangeSet {
    ranges: Range[] = [];
    getSize(): number {
        return this.ranges.reduce((acc, curr) => {
            return acc + (curr.end - curr.start + 1);
        }, 0);
    }
    addRange(range: Range) {
        const overlaps = 
            (r1: Range, r2: Range): boolean => 
                r1.start <= r2.end && r2.start <= r1.end;

        let newRanges = [];
        for(let r of this.ranges) {
            if(overlaps(r, range)) {
                range.start = Math.min(r.start, range.start);
                range.end = Math.max(r.end, range.end);
            } else {
                newRanges.push(r);
            }
        }
        newRanges.push(range);
        this.ranges = newRanges;
    }
}


const rig = new Rig(5, async (input, opt, testOpt) => {
    let parts = input.split('\n\n');
    let ranges: Range[] = parseToObjects<Range>(parts[0], /(\d+)-(\d+)/, (m) => ({ start: Number(m[1]), end: Number(m[2])}));
    const set = new RangeSet();
    for (const r of ranges) {
        set.addRange(r);
    }
    return set.getSize();
});

(async () => {
    await rig.test(`3-5
10-14
16-20
12-18

1
5
8
11
17
32`, 14);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

