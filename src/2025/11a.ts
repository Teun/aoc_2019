import { Rig } from '../main_modules/rig';
import { parseToObjects } from '../main_modules/lineParser';

const cache = new Map<string, [number, number, number, number]>();

const rig = new Rig(11, async (input, opt, testOpt) => {
    var boxes = parseToObjects(input, /(\w+): ([\w ]+)/, (m) => {
        return {
            name: m[1],
            targets: m[2].split(" ")
        };
    }).reduce((a, b) => {
        a[b.name] = b;
        return a;
    }, {});
    cache.clear();
    const totalCount = getPathCountFrom(boxes, "svr");
    return totalCount[3];
});

(async () => {
    await rig.test(`svr: aaa bbb
aaa: fft
fft: ccc
bbb: tty
tty: ccc
ccc: ddd eee
ddd: hub
hub: fff
eee: dac
dac: fff
fff: ggg hhh
ggg: out
hhh: out`, 2);
    await rig.runPrint();

})().then(() => {console.log("Done"); });


function getPathCountFrom(boxes: {[key: string]: {name:string, targets:string[]}}, from: string): [number, number, number, number] {
    if(cache.has(from)) return cache.get(from);

    if(from == "out") return [1, 0, 0, 0];
    const next = boxes[from].targets;
    const targetResults = next.map(n => getPathCountFrom(boxes, n));
    const result = targetResults.reduce((a, b) => {
        a[0] += b[0];
        a[1] += b[1];
        a[2] += b[2];
        a[3] += b[3];
        return a;
    }, [0, 0, 0, 0]);
    if(from == "dac" && result[1] === 0) result[1] = result[0];
    if(from == "fft" && result[2] === 0) result[2] = result[0];
    if(result[3] === 0 && result[1] > 0 && result[2] > 0) result[3] = Math.min(result[1], result[2]);
    cache.set(from, result);
    return result;
}

