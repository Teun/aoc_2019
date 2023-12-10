import { Grid, GridPos } from "./modules/grid";
import { parseToObjects } from "./modules/lineParser";
import {Rig} from "./modules/rig";

const rig = new Rig(4,
    async (d) => {
        const cards = parseToObjects(d, /Card\s+(\d+): ([^|]*) \| (.*)/, (s, n) => {
            var r = {
                card: Number(s[1]), 
                winning:new Set(s[2].split(/\s/).filter(s=>s).map(Number)), 
                dealt:new Set(s[3].split(/\s/).filter(s=>s).map(Number))
            };
            return r;
        });
        const cardCount = cards.reduce<{[id: number]: number}>((a,v) =>{
            a[v.card]=1;
            return a;
        }, {});
        for (const card of cards) {
            const intersect = new Set([...card.winning].filter(i => card.dealt.has(i)));
            const score = intersect.size;
            for (let nr = card.card+1; nr < cards.length && nr <= card.card + score; nr++) {
                cardCount[nr] += cardCount[card.card];
            }
        }
        return Object.values(cardCount).reduce((a,v)=> a+v, 0);
    }
);


(async () => {
    await rig.test(`Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11`, 30);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

