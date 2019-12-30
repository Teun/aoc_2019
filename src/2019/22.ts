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
        let result = ro.card;
        for (const f of transforms) {
            result = f(result, ro.deck);
        }
        return result;
    }
);
(async () => {
    await rig.testFromFile("small", 7, {deck: 10, card: 1});
    await rig.testFromFile("small", 3, {deck: 10, card: 9});
    await rig.testFromFile("small2", 3, {deck: 10, card: 4});
    await rig.runPrint({deck: 10007, card: 2019});
})().then(() => {console.log("Done"); });
