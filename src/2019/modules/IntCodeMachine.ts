type DoNext = "Exit" | "Next4" | "Next3" | "Next2" | "Stay";

interface Op {
    baseOp: number;
    argMode1: number;
    argMode2: number;
    argMode3: number;
}
const OpFromNum = (num: number): Op => {
    const baseOp = num % 100;
    num = (num - baseOp) / 100;
    const argMode1 = num % 10;
    num = (num - argMode1) / 10;
    const argMode2 = num % 10;
    num = (num - argMode2) / 10;
    const argMode3 = num % 10;
    num = (num - argMode3) / 10;
    return {
        baseOp,
        argMode1,
        argMode2,
        argMode3
    };
};

export class IntCodeMachine {
    public get Memory(): number[] {
        return this.memory;
    }
    public get arg1(): number {
        return this.Memory[this._pointer + 1];
    }
    public get arg2(): number {
        return this.Memory[this._pointer + 2];
    }
    public get arg3(): number {
        return this.Memory[this._pointer + 3];
    }
    private _pointer: number = 0;
    private _stdin: number[] = [];

    public input(val: number) {
        this._stdin.push(val);
    }
    private readIn(): number {
        return this._stdin.shift();
    }
    private writeOut(val: number) {
        return this._stdout.push(val);
    }
    public get output() : number[] {
        return this._stdout;
    }
    
    private _stdout: number[] = [];

    constructor(private memory: number[]) {
    }
    private get(arg: number, argMode: number) {
        if(argMode === 0){
            return this.Memory[arg];
        }else{
            return arg;
        }
    }

    public Run() {
        while (this.Step()) {
            // do nothing
        }
    }

    private Step(): boolean {
        const result = this.ExecOp();
        if (result === "Next4") { this._pointer += 4; }
        if (result === "Next3") { this._pointer += 3; }
        if (result === "Next2") { this._pointer += 2; }
        return result !== "Exit";
    }

    private ExecOp(): DoNext {
        const operation = OpFromNum(this.memory[this._pointer]);
        switch (operation.baseOp) {
            case 1:
                const sum = this.get(this.arg1, operation.argMode1) + 
                    this.get(this.arg2, operation.argMode2);
                this.memory[this.arg3] = sum;
                return "Next4";
            case 2:
                const prod = this.get(this.arg1, operation.argMode1) * 
                    this.get(this.arg2, operation.argMode2);
                this.memory[this.arg3] = prod;
                return "Next4";
            case 3:
                const rd = this.readIn();
                this.memory[this.arg1] = rd;
                return "Next2";
            case 4:
                const wr = this.get(this.arg1, operation.argMode1);
                this.writeOut(wr);
                return "Next2";
            case 5:
                const to_nonzero = this.get(this.arg2, operation.argMode2);
                if(this.get(this.arg1, operation.argMode1) !== 0){
                    this._pointer = to_nonzero;
                    return "Stay";
                }
                return "Next3"
            case 6:
                const to_zero = this.get(this.arg2, operation.argMode2);
                if(this.get(this.arg1, operation.argMode1) === 0){
                    this._pointer = to_zero;
                    return "Stay";
                }
                return "Next3"
            case 7:
                this.memory[this.arg3] = 
                    (this.get(this.arg1, operation.argMode1) < 
                        this.get(this.arg2, operation.argMode2)) 
                        ? 1 : 0;
                return "Next4"
            case 8:
                    this.memory[this.arg3] = 
                    (this.get(this.arg1, operation.argMode1) === 
                        this.get(this.arg2, operation.argMode2)) 
                        ? 1 : 0;
                return "Next4"
            case 99:
                return "Exit";
            default:
                throw new Error("Unexpected op");
        }

    }
}
