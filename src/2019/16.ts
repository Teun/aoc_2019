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
const generateNext = (prev: string, phase: number) => {
    const inDigits = prev.split("").map(Number);
    const output = inDigits.map((_, i, all) => {
        const multipliers = [...multiplier(i + 1, inDigits.length)];
        const outDigit = all.map((d, ix) => d * multipliers[ix])
            .reduce((a, v) => a + v, 0) % 10;
        return Math.abs(outDigit).toString();
    });
    return output.join("");
};
const rig = new Rig(16,
    async (d, o, cycles) => {
        let signal = d.trim();
        for (let phase = 1; phase <= cycles; phase++) {
            signal = generateNext(signal, phase);
            console.log(signal);
        }
        return signal.substring(0, 8);
    }
);
(async () => {
    await rig.test("12345678", "48226158", 1);
    await rig.test("12345678", "01029498", 4);
    await rig.test("80871224585914546619083218645595", "24176176", 100);
    await rig.test("19617804207202209144916044189917", "73745418", 100);
    await rig.test("69317163492948606335995924319873\n", "52432133", 100);
    await rig.runPrint(100);
})().then(() => {console.log("Done"); });
