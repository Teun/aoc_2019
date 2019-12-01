import * as assert from "assert";
import {readFile, exists } from "fs";
import { promisify } from "util";

export class Rig
{
    constructor(private day: number, private func: (d: string)=>Promise<any>){}

    private async getContent(): Promise<string>{
        const read = promisify(readFile);
        const d = await read(`input/${this.day}.txt`, "utf8");
        return d;
    }

    public async run(){
        const raw = await this.getContent();
        const result = await this.func(raw);
        return result;
    }
    public async runPrint(){
        console.log(`Result: ${await this.run()}`);
    }
    public async test(raw, expected){
        const result = await this.func(raw);
        assert(result == expected);
        console.log(`OK: ${result}`);
    }
    public async testFromFile(snipName, expected){
        const testFile = `input/${this.day}.snips.txt`;
        assert(await promisify(exists)(testFile));
        const all = await promisify(readFile)(testFile, "utf8");
        const snip: string = extractSnip(snipName, all);
        await this.test(snip, expected)

    }

}
const extractSnip = (name, all: string) => {
    const lines = all.split('\n');
    const startMarker = lines.findIndex(l => l.startsWith(`snip:${name}`));
    assert(startMarker > -1);
    const endMarker = lines.indexOf("====", startMarker);
    assert(endMarker > startMarker);
    const snip = lines.slice(startMarker+1, endMarker).join('\n');
    return snip;
}
