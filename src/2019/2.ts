import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const rig = new Rig(2,
    async (d) => {
        const values = parseToObjects(d, /.*/, (s, n) => {
            return s;
        });
        const result = values.length;
        return result;
    }
);
(async () => {
    await rig.test("19\n69", 2);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
