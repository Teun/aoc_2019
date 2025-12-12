import { Rig } from '../main_modules/rig';
import { Coord } from '../main_modules/grid3d';
import { parseToObjects } from '../main_modules/lineParser';
import { bigCombination, combination } from "js-combinatorics";

const rig = new Rig(8, async (input, opt, testOpt) => {
    const unconnected = parseToObjects(input, /(\d+),(\d+),(\d+)/,
            (l) => new Coord(parseInt(l[1]), parseInt(l[2]), parseInt(l[3])));
    const pairs = bigCombination(unconnected, 2).toArray();
    pairs.sort((a, b) => {
        const distA = a[0].distance(a[1]);
        const distB = b[0].distance(b[1]);
        return distA - distB;
    });
    const circuits = unconnected.map((u) => [u]);
    for (const pair of pairs) {
        var circuitsToConnect = circuits.filter(c => c.includes(pair[0]) || c.includes(pair[1]));
        if(circuitsToConnect.length == 1)continue;
        if(circuits.length == 2){
            return pair[0].x * pair[1].x;
        }
        const newCircuit = circuitsToConnect[0].concat(circuitsToConnect[1]);
        circuits.splice(circuits.indexOf(circuitsToConnect[0]), 1);
        circuits.splice(circuits.indexOf(circuitsToConnect[1]), 1);
        circuits.push(newCircuit);
    }
    circuits.sort((a, b) => b.length - a.length);
    return circuits[0].length * circuits[1].length * circuits[2].length;
});

(async () => {
    await rig.test(`162,817,812
57,618,57
906,360,560
592,479,940
352,342,300
466,668,158
542,29,236
431,825,988
739,650,466
52,470,668
216,146,977
819,987,18
117,168,530
805,96,715
346,949,466
970,615,88
941,993,340
862,61,35
984,92,344
425,690,689`, 25272);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

