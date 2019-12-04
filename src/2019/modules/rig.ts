import * as assert from "assert";
import {exists, readFile } from "fs";
import { promisify } from "util";

type RunType = "run" | "test";
export interface RunContext {
    type: RunType;
}
const deepEquals = (first: any, second: any) => {
    if (Array.isArray(first)) {
        return first.every((e, i) => deepEquals(e, second[i]));
    }
    return first === second;
};

export class Rig {
    constructor(private day: number, private func: (d: string, opt: RunContext) => Promise<any>) {}

    public async run() {
        const raw = await this.getContent();
        const result = await this.func(raw, {type: "run"});
        return result;
    }
    public async runPrint() {
        console.log(`Result: ${await this.run()}`);
    }
    public async test(raw, expected) {
        const result = await this.func(raw, {type: "test"});
        assert(deepEquals(result, expected));
        console.log(`OK: ${result}`);
    }
    public async testPrint(raw) {
        const result = await this.func(raw, {type: "test"});
        console.log(`Result: ${result}`);
    }
    public async testFromFile(snipName, expected) {
        const all = await getFileContent(`${this.day}.snips`);
        const snip: string = extractSnip(snipName, all);
        await this.test(snip, expected);

    }

    private async getContent(): Promise<string> {
        return getFileContent(this.day.toString());
    }

}
const getFileContent = async (name: string) => {
    const fileName = `input/${name}.txt`;
    if (! (await promisify(exists)(fileName))) { return ""; }
    const d = await promisify(readFile)(fileName, "utf8");
    return d;
};

const extractSnip = (name, all: string) => {
    const lines = all.split("\n");
    const startMarker = lines.findIndex((l) => l.startsWith(`snip:${name}`));
    assert(startMarker > -1);
    const endMarker = lines.indexOf("====", startMarker);
    assert(endMarker > startMarker);
    const snip = lines.slice(startMarker + 1, endMarker).join("\n");
    return snip;
};
