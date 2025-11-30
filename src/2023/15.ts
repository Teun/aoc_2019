import { start } from "repl";
import { Coord, Grid, GridPos, Direction } from "./modules/grid";
import {Rig} from "./modules/rig";
import { C } from "js-combinatorics";

const rig = new Rig(15,
    async (d) => {
        const strings = d.split(',');
        const hashes = strings.map(hash);
        return hashes.reduce((a,v)=> a+v, 0);
    }
);
function hash(value: string): number {
    const chars = value.split('');
    const h = chars.reduce((a,v) => {
        return ((a + v.charCodeAt(0)) * 17) % 256;
    }, 0);
    return h;
}



(async () => {
    await rig.test(`rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`, 1320);
    await rig.runPrint();
})().then(() => {console.log("Done"); });



