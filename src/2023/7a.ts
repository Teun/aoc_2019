import { firstBy as by } from "thenby";
import { parseToObjects } from "./modules/lineParser";
import {Rig} from "./modules/rig";
interface Hand {hand:string, bid:number};
const groupBy = function(xs: string[]): {[id:string]: string[]} {
    return xs.reduce(function(rv, x) {
      (rv[x] = rv[x] || []).push(x);
      return rv;
    }, {});
  };
const rig = new Rig(7,
    async (d) => {
        const hands: Hand[] = parseToObjects(d, /(\w{5}) (\d+)/, (s, n) => {
            return {hand: s[1], bid: Number(s[2])};
        });
        hands.sort(by(bestScoreWhenReplacingJ)
            .thenBy(h => letterStrength(h.hand[0]))
            .thenBy(h => letterStrength(h.hand[1]))
            .thenBy(h => letterStrength(h.hand[2]))
            .thenBy(h => letterStrength(h.hand[3]))
            .thenBy(h => letterStrength(h.hand[4]))
            );
        return hands.map((h, i) => h.bid * (i+1))
            .reduce((a,v)=>a+v, 0);

    }
);
const bestScoreWhenReplacingJ = (h: Hand) =>{
    const allPossibleHands = getVariants(h);
    allPossibleHands.sort(by(handTypeScore, -1));
    return handTypeScore(allPossibleHands[0]);
}
function getVariants(h: Hand):Hand[]{
    var results = [h];
    const otherLetters = h.hand.replace('J', '');
    for (let index = 0; index < h.hand.length; index++) {
        if(h.hand[index] == 'J'){
            const newSet = results.flatMap(old => {
                return otherLetters.split('').map(l => {
                    return {bid: h.bid, hand:old.hand.substring(0,index) + l + old.hand.substring(index+1)};
                });
            });
            results = results.concat(newSet);
        }
    }
    return results;
}
const handTypeScore = (h: Hand) =>{
    const groups = groupBy(h.hand.split(''));
    const counts = Object.keys(groups).map(k => { return {card:k, count:groups[k].length};});
    counts.sort(by(c => c.count, -1));
    if(counts[0].count == 5) return 10;
    if(counts[0].count == 4) return 9;
    if(counts[0].count == 3 && counts[1].count == 2) return 8;
    if(counts[0].count == 3) return 7;
    if(counts[0].count == 2 && counts[1].count == 2) return 6;
    if(counts[0].count == 2) return 5;

    return 1;
}
const allLetters = 'J23456789TQKA';
const letterStrength = (l: string) =>{
    return allLetters.indexOf(l);
}

(async () => {
    await rig.test(`32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`, 5905);
    await rig.runPrint();
})().then(() => {console.log("Done"); });


