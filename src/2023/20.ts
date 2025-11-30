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
        })
        const queue = new Qu();
        for (let index = 0; index < 1000; index++) {
            console.log("click");
            queue.push({from: 'button', to: 'broadcaster', type: HighLow.L});
            runToComplete(engine, queue);
        }
        return queue.sentLow * queue.sentHigh;
    }
);

class Module{
    constructor(public name: string, public dest: string[]){}
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
    public receive(msg: Message): Message[] {
        this.lastReceived[msg.from] = msg.type;
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
            console.log(`${outMsg.from} --${outMsg.type ? 'Low-' : 'High'}->${outMsg.to}`);
            queue.push(outMsg);
        }
    }
}



(async () => {
    await rig.test(`broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a`, 32000000);
await rig.test(`broadcaster -> a
%a -> inv, con
&inv -> b
%b -> con
&con -> output`, 11687500);


    await rig.runPrint();
})().then(() => {console.log("Done"); });

