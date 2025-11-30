import { Coord, Grid, GridPos, Direction, rotate } from "./modules/grid";
import {Rig} from "./modules/rig";
import { parseToObjects } from "./modules/lineParser";
import { ftruncateSync } from "fs";

const rig = new Rig(19,
    async (d) => {
        const [d1, d2] = d.split('\n\n');
        const rules = parseToObjects(d1, /(\w+){([^}]+)}/, (s)=>{
            const parts = s[2].split(',');
            return {name: s[1], func: makeFunction(parts)};
        }).reduce((a,v)=> {a[v.name] = v.func; return a;}, {});
        const items = parseToObjects(d2, /{x=(\d+),m=(\d+),a=(\d+),s=(\d+)}/, (s)=>{
            return new item(Number(s[1]), Number(s[2]), Number(s[3]), Number(s[4]));
        });
        const itemsAccepted = items.filter(it => {
            return rules["in"](it, rules) === 'A';
        })
        return itemsAccepted.reduce((a, v) => a + v.sum(), 0);
    }
);
class item{
    constructor(public x: number, public m:number, public a: number, public s: number){}
    public sum(): number {return this.x + this.m + this.a + this.s;}
}
type Acceptor = (a: item, fs: funcSet)=> 'A'|'R';
type funcSet = {[id: string]: Acceptor}
function makeFunction(parts: string[]): Acceptor {

    const selectors = parts.map(p => {
        return (p.indexOf(':') === -1) ? (i:item)=>null : (i:item) => i[p.substring(0, 1)];
    });
    const evals = parts.map(p => {
        const colon = p.indexOf(':');
        if (colon === -1) return  (i:item)=>true;
        const toCompare = Number(p.substring(2, colon));
        if(p.substring(1,2) == '<') return (v: number) => v < toCompare;
        return (v: number) => v > toCompare;
    });
    const targets = parts.map(p => {
        const colon = p.indexOf(':');
        const str = (colon === -1) ? p : p.substring(colon + 1);
        return (a: item, fs: funcSet) => {
            if(str == 'A')return 'A';
            if(str == 'R')return 'R';
            return fs[str](a, fs);
        }
    });
    
    return (a, fs: funcSet) => {
        for (let i = 0; i < selectors.length; i++) {
            const val = selectors[i](a);
            if(evals[i](val)){
                return targets[i](a, fs);
            }

        }
    };
}
(async () => {
    await rig.test(`px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}`, 19114);
    await rig.runPrint();
})().then(() => {console.log("Done"); });



