import { Rig } from '../main_modules/rig';
import { parseToObjects } from '../main_modules/lineParser';

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
    const allLines = getAllLinesFrom(boxes, ["you"]);
    return allLines.length;
});

(async () => {
    await rig.test(`aaa: you hhh
you: bbb ccc
bbb: ddd eee
ccc: ddd eee fff
ddd: ggg
eee: out
fff: out
ggg: out
hhh: ccc fff iii
iii: out`, 5);
    await rig.runPrint();
})().then(() => {console.log("Done"); });


function getAllLinesFrom(boxes: {[key: string]: {name:string, targets:string[]}}, prefix: string[]) {
    if(prefix[prefix.length-1] == "out") return [prefix];
    const last = prefix[prefix.length-1];
    const next = boxes[last].targets;
    return next.flatMap(n => getAllLinesFrom(boxes, prefix.concat(n)));
}

