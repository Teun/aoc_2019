import {Rig} from "./modules/rig";
import {firstBy as by} from 'thenby';

const rig = new Rig(5,
    async (d) => {
        const chunks = d.split('\n\n').map(s => s.trim()).filter(s=>s);
        const seeds: Range[] = makeRanges(chunks[0].split(':')[1]);
        const engine = build(chunks.slice(1));
        const distances = engine(seeds);
        return distances.sort(by(r => r.start))[0].start;
    }
);

class Range{
    constructor(public start: number, public end: number){
    }
    public splitAt(n1: number, n2: number): Range[] {
        const result: Range[] = [];
        if(this.start < n1) result.push(new Range(this.start, Math.min(n1-1, this.end)));
        if(this.start <= n2 && this.end >= n1) result.push(new Range(Math.max(n1, this.start), Math.min(n2, this.end)));
        if(this.end > n2) result.push(new Range(Math.max(n2+1, this.start), this.end));
        return result;
    }
    public shift(delta: number): Range {
        return new Range(this.start + delta, this.end + delta);
    }
}
(async () => {
    await rig.test(`seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`, 46);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
function makeRanges(line: string) : Range[]{
    var nums = line.split(' ').map(s=>s.trim()).filter(s=>s).map(Number);
    const result: Range[] = [];
    for (let i = 0; i < nums.length; i+=2){
        result.push(new Range(nums[i], nums[i] + nums[i+1] - 1));
    }
    return result;
}
function buildMapLine(line: string) {
    const [dest, src, size] = line.split(' ').map(Number)
    const func = (n: Range): {mapped: Range[], unmapped: Range[]} => {
        const result = { mapped:[], unmapped: []}
        const parts = n.splitAt(src, src + size -1);
        for (const r of parts) {
            if(r.start >= src && r.end < src + size){
                result.mapped.push(r.shift(dest-src));
            }else{
                result.unmapped.push(r);
            }
        }
        return result;
    }
    return func;
}
function build(chunks: string[]) {
    const mappers = [];
    for (const chunk of chunks) {
        const lines = chunk.split('\n');
        const name = lines[0].substring(0, lines[0].indexOf(' map:'));
        const functions = lines.slice(1).map(buildMapLine);
        const func = (n: Range[]): Range[] => {
            const mapped = [];
            let forNext = [...n];
            for (const f of functions) {
                const toMap = [...forNext];
                forNext = [];
                for (const r of toMap) {
                    const to = f(r);
                    mapped.push(...to.mapped);
                    forNext.push(...to.unmapped);
                }
            }
            mapped.push(...forNext);
            return mapped;
        }
        //func.name = name;
        mappers.push(func);
    }
    const uberFunc = (ranges: Range[]) => {
        for (const map of mappers) {
            ranges = map(ranges);
        }
        return ranges;
    }
    return uberFunc;

}


