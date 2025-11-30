import { Rig } from '../main_modules/rig';
import { parseToObjects } from '../main_modules/lineParser';

const rig = new Rig(1, async (input, opt, testOpt) => {
    var vals = parseToObjects(input, /(\d+)\s+(\d+)/, (matches, lineNum) => matches[1]);
    return new Set(vals).size;
});

(async () => {
    await rig.test(`124432 12344
223432 2344
324432 3444
423432 4344
523432 5344`, 5);
    await rig.runPrint();
})().then(() => {console.log("Done"); });