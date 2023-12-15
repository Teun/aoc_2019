import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";
function* multiplier(digit: number, max: number) {
    let skipped = false;
    let sent = 0;
    while (true) {
        for (const c of [0, 1, 0, -1]) {
            for (let d = 0; d < digit; d++) {
                if (sent >= max) { return; }
                if (!skipped) {
                    skipped = true;
                } else {
                    yield c;
                    sent++;
                }
            }
        }
    }
}
const generateNext = (prev: number[], onlyAfter: number) => {
    const result = new Array<number>(prev.length);
    let curr = result.length - 1;
    while(curr >= onlyAfter) {
        result[curr] = ((result[curr + 1] || 0) + prev[curr]) % 10;
        curr -= 1;
    }
    return result;
};
const rig = new Rig(16,
    async (d, o, cycles: number) => {
        const signal = d.trim().repeat(10000);
        const offset = Number(d.substring(0, 7));
        let signalArray = signal.split("").map(Number);
        for (let phase = 1; phase <= cycles; phase++) {
            signalArray = generateNext(signalArray, offset);
            console.log(signalArray.slice(offset, offset + 8));
        }
        return signalArray.slice(offset, offset + 8).join("");
    }
);
(async () => {
    await rig.test("03036732577212944063491565474664", "84462026", 100);
    await rig.runPrint(100);
})().then(() => {console.log("Done"); });
