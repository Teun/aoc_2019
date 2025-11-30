import { machine } from "os";
import {Rig} from "./modules/rig";

const rig = new Rig(15,
    async (d) => {
        const strings = d.split(',');
        const machine = new Machine();
        const operations = strings.map(createOp);
        operations.forEach(op => {
            op.exec(machine);
        });
        return machine.power();
    }
);
function hash(value: string): number {
    const chars = value.split('');
    const h = chars.reduce((a,v) => {
        return ((a + v.charCodeAt(0)) * 17) % 256;
    }, 0);
    return h;
}
function createOp(code: string): Operation{
    if(code.indexOf('=') > -1){
        const parts = code.split('=');
        return new EqualOp(parts[0], Number(parts[1]));
    }
    if(code.indexOf('-') > -1){
        const parts = code.split('-');
        return new MinusOp(parts[0]);
    }

}
class EqualOp implements Operation {
    constructor(public label: string, public value:number){}
    public op: string = "=";
    public exec(m)  {
        const box = hash(this.label);
        m.add(box, this.label, this.value);
    }
}
class MinusOp implements Operation {
    constructor(public label: string){}
    public op: string = "-";
    public value = 0;
    public exec(m) {
        const box = hash(this.label);
        m.remove(box, this.label);
}
}
interface Operation{
    label: string;
    op: string; 
    value:number;
    exec: (Machine)=>void
}
class Machine{
    private boxes: {[id:number]: Box} = {};
    public getBox(boxId: number) {
        if(! (boxId in this.boxes)) this.boxes[boxId] = new Box();
        return this.boxes[boxId];
    }
    public add(boxId, label, value) {
        const box = this.getBox(boxId);
        if(box.Lenses.findIndex(l => l.label === label) > -1){
            box.Lenses[box.Lenses.findIndex(l => l.label === label)] = 
                {label: label, value: value};
        }else{
            box.Lenses.push({label: label, value: value});
        }
    }
    public remove(boxId, label) {
        const box = this.getBox(boxId);
        box.remove(label);
    }
    public power() {
        return Object.keys(this.boxes).reduce((a,v) => {
            return a + (Number(v) + 1) * this.boxes[v].power();

        }, 0);
    }
}
class Box{
    public Lenses: {label:string, value:0}[] = [];
    public remove(label: string){
        const pos = this.Lenses.findIndex(l => l.label === label);
        if(pos > -1){
            this.Lenses.splice(pos, 1);
        }
    }
    public power(): number {
        return this.Lenses.reduce((a,v,i)=>{
            return a + v.value * (i+1);
        }, 0);
    }
}



(async () => {
    await rig.test(`rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`, 145);
    await rig.runPrint();
})().then(() => {console.log("Done"); });



