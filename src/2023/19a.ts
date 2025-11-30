import { Coord, Grid, GridPos, Direction, rotate } from "./modules/grid";
import {Rig} from "./modules/rig";
import { parseToObjects } from "./modules/lineParser";
import { ftruncateSync } from "fs";

const rig = new Rig(19,
    async (d) => {
        const [d1, d2] = d.split('\n\n');
        const rules: {[id: string]: Acceptor} = parseToObjects(d1, /(\w+){([^}]+)}/, (s)=>{
            const parts = s[2].split(',');
            return {name: s[1], func: makeFunction(parts)};
        }).reduce((a,v)=> {a[v.name] = v.func; return a;}, {});
        const universe = new range([1, 4001], [1, 4001], [1, 4001], [1, 4001]);
        const ranges = rules['in'](universe, rules);
        const itemsAccepted = ranges.filter(it => it.accepted);
        return itemsAccepted.reduce((a, v) => a + v.count(), 0);
    }
);
class range{
    constructor(public x: [number,number], public m:[number,number], public a: [number,number], public s: [number,number]){}
    public accepted: boolean = null;
    public count(): number { 
        return Math.max(0, this.x[1] - this.x[0]) 
            * Math.max(0, this.m[1] - this.m[0]) 
            * Math.max(0, this.a[1] - this.a[0]) 
            * Math.max(0, this.s[1] - this.s[0]);
    };
    public clone(): range {
        return new range(this.x.slice() as [number,number], this.m.slice() as [number,number], 
            this.a.slice() as [number,number], this.s.slice() as [number,number]);
    }
    public split(reg: string, at: number, op: string){
        const first = this.clone();
        const rest = this.clone();
        switch (op) {
            case '<':
                first[reg][1] = at;
                rest[reg][0] = at;
                break;
            case '>':
                first[reg][0] = at + 1;
                rest[reg][1] = at + 1;
                break;
                default:
                break;
        }
        return [first, rest];
    }
}
type Acceptor = (a: range, fs: funcSet)=> range[];
type funcSet = {[id: string]: Acceptor}
function makeFunction(parts: string[]): Acceptor {

    const evals = parts.map(p => {
        const colon = p.indexOf(':');
        if (colon === -1) return null;
        return {reg: p.substring(0, 1), op: p.substring(1,2), val: Number(p.substring(2, colon))};
    });
    const targets = parts.map(p => {
        const colon = p.indexOf(':');
        const str = (colon === -1) ? p : p.substring(colon + 1);
        return (a: range, fs: funcSet) => {
            if(str == 'A'){
                a.accepted = true;
                return [a];
            }
            if(str == 'R'){
                a.accepted = false;
                return [a];
            }
            return fs[str](a, fs);
        }
    });
    
    return (a, fs: funcSet) => {
        let res: range[] = [];
        let rest = a;
        for (let i = 0; i < evals.length; i++) {
            let first: range = null;
            if(evals[i] == null){
                first = rest;
                rest = null;
            }else{
                const [a1, a2] = rest.split(evals[i].reg, evals[i].val, evals[i].op);
                first = a1; rest = a2;
            }
            const newRanges = targets[i](first, fs);
            res = res.concat(newRanges);
        }
        return res;
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
{x=2127,m=1623,a=2188,s=1013}`, 167409079868000);
    await rig.runPrint();
})().then(() => {console.log("Done"); });



