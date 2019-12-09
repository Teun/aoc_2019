import { AssertionError } from "assert";

type DoNext = "Exit" | "Stay" | number;

interface Op {
    baseOp: number;
    argMode1: ArgMode;
    argMode2: ArgMode;
    argMode3: ArgMode;
}
type ArgMode = number;

const opFromNum = (num: number): Op => {
    const bitOnPos = (full: number, pos: number): ArgMode => {
        const padded = "00000" + full;
        return Number(padded[padded.length - pos]);
    };
    const baseOp = num % 100;
    const argMode1: ArgMode = bitOnPos(num, 3);
    const argMode2: ArgMode = bitOnPos(num, 4);
    const argMode3: ArgMode = bitOnPos(num, 5);
    return {
        baseOp,
        argMode1,
        argMode2,
        argMode3
    };
};
function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export class IntCodeMachine {
    private memory: number[];
    public get Memory(): number[] {
        return this.memory;
    }
    public get output(): number[] {
        return this._stdout;
    }
    private _pointer: number = 0;
    private _relativeBase = 0;
    private _stdin: number[] = [];
    public get StdIn(): number[] {
        return this._stdin;
    }

    private _stdout: number[] = [];

    constructor(code: number[], private name: string = "<unnamed>") {
        this.memory = code.slice(0);
    }

    public input(val: number) {
        this._stdin.push(val);
    }
    public pipeOutput(out: number[]) {
        this._stdout = out;
    }

    public async Run() {
        while (await this.Step()) {
            // do nothing
        }
    }
    private argPos(arg: number, mode: ArgMode) {
        if (mode === 1) {
            throw new Error("No using of mode 1 for position");
        }
        if (mode === 0) {
            return this.Memory[arg + this._pointer];
        }
        if (mode === 2) {
            return this.Memory[arg + this._pointer] + this._relativeBase;

        }
        throw new Error(`Invalid argMode: ${mode}`);
    }
    private get(arg: number, argMode: ArgMode) {
        if (argMode === 1) {
            return this.Memory[this._pointer + arg];
        } else if (argMode === 0 || argMode === 2) {
            return this.Memory[this.argPos(arg, argMode)] || 0;
        }
        throw new Error(`Invalid argMode: ${argMode}`);
    }
    private arg(nr: number, op: Op) {
        const argMode = op ? op["argMode" + nr] : 1;
        return this.get(nr, argMode);
    }
    private async readIn(): Promise<number> {
        while (this._stdin.length === 0) {
            await timeout(50);
        }
        return this._stdin.shift();
    }
    private writeOut(val: number) {
        // console.debug(`     Machine ${this.name} outputs ${val}`);
        return this._stdout.push(val);
    }

    private async Step(): Promise<boolean> {
        const result = await this.ExecOp();
        if (typeof(result) === "number") { this._pointer += result; }
        return result !== "Exit";
    }

    private async ExecOp(): Promise<DoNext> {
        const operation = opFromNum(this.memory[this._pointer]);
        switch (operation.baseOp) {
            case 1: // add
                const sum = this.arg(1, operation) +
                    this.arg(2, operation);
                this.memory[this.argPos(3, operation.argMode3)] = sum;
                return 4;
            case 2: // mult
                const prod = this.arg(1, operation) *
                    this.arg(2, operation);
                this.memory[this.argPos(3, operation.argMode3)] = prod;
                return 4;
            case 3: // read
                const rd = await this.readIn();
                this.memory[this.argPos(1, operation.argMode1)] = rd;
                return 2;
            case 4: // write
                const wr = this.arg(1, operation);
                this.writeOut(wr);
                return 2;
            case 5: // jmp_nonzero
                const toNonzero = this.arg(2, operation);
                if (this.arg(1, operation) !== 0) {
                    this._pointer = toNonzero;
                    return "Stay";
                }
                return 3;
            case 6: // jmp_zero
                const toZero = this.arg(2, operation);
                if (this.arg(1, operation) === 0) {
                    this._pointer = toZero;
                    return "Stay";
                }
                return 3;
            case 7: // less
                this.memory[this.argPos(3, operation.argMode3)] =
                    (this.arg(1, operation) <
                        this.arg(2, operation))
                        ? 1 : 0;
                return 4;
            case 8: // equals
                    this.memory[this.argPos(3, operation.argMode3)] =
                    (this.arg(1, operation) ===
                        this.arg(2, operation))
                        ? 1 : 0;
                    return 4;
            case 9: // change_offset
                const add = this.arg(1, operation);
                this._relativeBase += add;
                return 2;
            case 99: // exit
                return "Exit";
            default:
                throw new Error(`Unexpected op: ${operation.baseOp}`);
        }

    }
}
