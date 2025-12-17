import { Grid } from '../main_modules/grid';
import { parseToObjects } from '../main_modules/lineParser';
import { Rig } from '../main_modules/rig';

const rig = new Rig(12, async (input, opt, testOpt) => {
    const {blockDefs, boxes} = parse(input);
    const fittingBoxes = boxes.map(box => fits(box, blockDefs));
    return fittingBoxes.filter(f => f === true).length;
});

(async () => {
    await rig.runPrint();
    await rig.test(`0:
###
##.
##.

1:
###
##.
.##

2:
.##
###
##.

3:
##.
###
##.

4:
###
#..
###

5:
###
.#.
###

4x4: 0 0 0 0 2 0
12x5: 1 0 1 0 2 2
12x5: 1 0 1 0 3 2`, 5);
})().then(() => {console.log("Done"); });

function parse(input: string) {
    const parts = input.split("\n\n");
    const blockDefs = parts.slice(0, 6)
        .map(p => {
            const afterFirstLineBreak = p.indexOf("\n") + 1;
            const bd = new Grid<number>();
            bd.parseFromString(p.substring(afterFirstLineBreak), {"#": 1});
            return bd;
        });
    const boxes = parseToObjects(parts[6], /((\d+)x(\d+): ([\d ]+))/, (arr) => {
        return {
            width: parseInt(arr[2]),
            height: parseInt(arr[3]),
            blocks: arr[4].split(" ").map(v => parseInt(v))
        };
    });
    const uniqueBlocks = makeUniqueRotations(blockDefs);


    return { blockDefs: uniqueBlocks, boxes };
}

function makeUniqueRotations(blockDefs: Grid<number>[]) {
    const allBlocks = blockDefs.map(bd => {
        const rotations = [0,1,2,3].map(rot => {
            return bd.rotate(rot).alignToOrigin();
        }).concat([0,1,2,3].map(rot => {
            return bd.flip().rotate(rot).alignToOrigin();
        }));
        const lookup = rotations.reduce< {[key: string]: Grid<number>}>((a, v) => {
            const key = v.hash();
            a[key] = v;
            return a;
        }, {});
        return Object.values(lookup);
    });
    return allBlocks;
}
interface Box {
    width: number;
    height: number;
    blocks: number[];
}
function fits(box: Box, defs: Grid<number>[][]){
    const fits3x3Blocks = Math.floor(box.height / 3) * Math.floor(box.width / 3);
    const totalBlocks = box.blocks.reduce((a,v) => a+v, 0);
    const totalBlockSurface = box.blocks.reduce((a, v, i) => 
        a + v * [...defs[i][0].positions(1)].length, 0);
    if(totalBlocks <= fits3x3Blocks) return true;
    if(totalBlockSurface > box.height*box.width) return false;
    return null;
}

