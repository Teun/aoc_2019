import {Rig} from "./modules/rig";

const rig = new Rig(5,
    async (d) => {
        const chunks = d.split('\n\n').map(s => s.trim()).filter(s=>s);
        const seeds = chunks[0].split(':')[1].split(' ').filter(s=>s).map(Number);
        const engine = build(chunks.slice(1));
        const distances = seeds.map(s => engine(s)).sort((a,b)=> a-b);
        return distances[0];
    }
);


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
56 93 4`, 35);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

function buildMapLine(line: string) {
    const [dest, src, size] = line.split(' ').map(Number)
    const func = (n: number) => {
        if(n >= src && n < src + size) return dest + (n - src);
        return null;
    }
    return func;
}
function build(chunks: string[]) {
    const mappers = [];
    for (const chunk of chunks) {
        const lines = chunk.split('\n');
        const name = lines[0].substring(0, lines[0].indexOf(' map:'));
        const functions = lines.slice(1).map(buildMapLine);
        const func = (n: number) => {
            for (const f of functions) {
                const to = f(n);
                if(to !== null) return to;
            }
            return n;
        }
        //func.name = name;
        mappers.push(func);
    }
    const uberFunc = (n: number) => {
        for (const map of mappers) {
            n = map(n);
        }
        return n;
    }
    return uberFunc;

}


