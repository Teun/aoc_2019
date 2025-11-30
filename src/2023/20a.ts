import { parseToObjects } from "./modules/lineParser";
import {Rig} from "./modules/rig";

const rig = new Rig(20,
    async (d) => {
        const modules = parseToObjects(d, /([%&]?)(\w+) -> (.*)/, (s) => {
            const type = s[1];
            const name = s[2];
            const dest = s[3].split(',').map(s => s.trim());
            if(type == "%"){
                return new FlipFlop(name, dest);
            }
            if(type == "&"){
                return new Conjunction(name, dest);
            }
            if(name == "broadcaster"){
                return new Broadcaster(name, dest);
            }
            return new Module(name, dest);
        });
        var engine = modules.reduce((a, v) => {
            a[v.name] = v;
            return a;
        }, {} as {[id:string]: Module});
        modules.forEach(m => {
            m.dest.forEach(d => {
                if(!engine[d]){
                    engine[d] = new Module(d, []);
                }
                if(engine[d] instanceof Conjunction){
                    (engine[d] as Conjunction).addSource(m.name);
                }
            });
        });
        const queue = new Qu();
        for (index = 0; index < 100000000; index++) {
            //if(index%1000 == 0)console.log("click " + index);
            queue.push({from: 'button', to: 'broadcaster', type: HighLow.L});
            runToComplete(engine, queue);
            if(engine['rx'].count > 0){
                return index;
            }
        }
    }
);
let index = 0;
class Module{
    constructor(public name: string, public dest: string[]){}
    public count = 0;
    public receive(msg: Message): Message[]{
        return [];
    }
}
class FlipFlop extends Module {
    private on: boolean = false;
    public receive(msg: Message): Message[] {
        if(msg.type == HighLow.L){
            this.on = !this.on;
            return this.dest.map(d => { return {to: d, from: this.name, type: this.on ? HighLow.H : HighLow.L};})
        }
        return [];
    }
}
class Conjunction extends Module{
    private lastReceived: {[id: string]: HighLow} = {};
    public addSource(name:string){
        this.lastReceived[name] = HighLow.L;
    }
    private lastHighFrom: {[id:string]: number} = {};
    public receive(msg: Message): Message[] {
        this.lastReceived[msg.from] = msg.type;
        if(this.name == "zh" && msg.type == HighLow.H){
            console.log(`Click ${index} Conj ${this.name} received ${msg.type ? 'L' : 'H'} from ${msg.from}`);
            console.log(`State now: ${Object.keys(this.lastReceived).map(k => k + '=' + this.lastReceived[k]).join(', ')}`);
            console.log(`since last: ${index - (this.lastHighFrom[msg.from] || 0)}`);
            this.lastHighFrom[msg.from] = index;
        }
        return this.dest.map(d => {
            return {
                from: this.name,
                to: d,
                type: Object.values(this.lastReceived).every(v => v === HighLow.H)
                    ? HighLow.L
                    : HighLow.H
            };
        })
    }
}
class Broadcaster extends Module{
    public receive(msg: Message): Message[] {
        return this.dest.map(d => {return {from:this.name, to: d, type: msg.type};});
    }
}
class Message {
    constructor(public type: HighLow, public to: string, public from: string){}
}
class Qu extends Array<Message>{
    public sentLow = 0;
    public sentHigh = 0;
    public override push(...items: Message[]): number {
        this.sentHigh += items.filter(m => m.type == HighLow.H).length;
        this.sentLow += items.filter(m => m.type == HighLow.L).length;
        return super.push(...items);
    }
}

enum HighLow{H,L}
function runToComplete(engine: { [id: string]: Module; }, queue: Message[]) {
    while(queue.length>0){
        const msg = queue.shift();
        const dest = engine[msg.to];
        const results = dest.receive(msg);
        for (const outMsg of results) {
            //console.log(`${outMsg.from} --${outMsg.type ? 'Low-' : 'High'}->${outMsg.to}`);
            queue.push(outMsg);
        }
    }
}



(async () => {
    await rig.runPrint();
})().then(() => {console.log("Done"); });

