import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const reverse = (n: number, stack: number) => {
    return stack - n - 1;
};
const increment = (inc: number) => {
    return (n: number, stack: number) => {
        return (n * inc) % stack;
    };
};
const cut = (inc: number) => {
    return (n: number, stack: number) => {
        return (n - inc + stack) % stack;
    };
};
const fullTransform = (from: number, transforms: Array<((n: number, stack: number) => number)>, stack: number) => {
    let result = from;
    for (const f of transforms) {
        result = f(result, stack);
    }
    return result;
};

const rig = new Rig(22,
    async (d, o, ro: {deck: number, card: number}) => {
        const transforms = parseToObjects(d, /(deal into new stack|deal with increment|cut)\s*([0-9\-]+)?/, (s, n) => {
            if (s[1] === "deal into new stack") {
                return reverse;
            }
            if (s[1] === "deal with increment") {
                return increment(Number(s[2]));
            }
            if (s[1] === "cut") {
                return cut(Number(s[2]));
            }
            return (n: number, stack: number) => 0;
        });

        let pos = ro.card;
        let steps = 0;
        while (true) {
            pos = fullTransform(pos, transforms, ro.deck);
            steps++;
            if (steps % 1000000 === 0) {
                console.log(`Finished ${steps} transforms`);
            }
            if (pos === ro.card) {
                console.log(steps);
            }
        }
    }
);
(async () => {
    await rig.runPrint({deck: 119315717514047, card: 2020});
})().then(() => {console.log("Done"); });
