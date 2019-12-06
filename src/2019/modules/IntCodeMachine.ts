type DoNext = "Exit" | "Stay" | number;

interface Op {
    baseOp: number;
    argMode1: ArgMode;
    argMode2: ArgMode;
    argMode3: ArgMode;
}
type ArgMode = 0 | 1;

const OpFromNum = (num: number): Op => {
    const bitOnPos = (full: number, pos: number): ArgMode => {
        const padded = "00000" + full;
        return padded[padded.length - pos] === "0" ? 0 : 1;
    }
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

export class IntCodeMachine {
    public get Memory(): number[] {
        return this.memory;
    }
    private get(arg: number, argMode: number) {
        if(argMode === 0){
            return this.Memory[arg];
        }else{
            return arg;
        }
    }
    private arg(nr: number, op?: Op) {
        const argMode = op ? op["argMode" + nr] : 1;
        return this.get(this.memory[nr + this._pointer], argMode);
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

    public Run() {
        while (this.Step()) {
            // do nothing
        }
    }

    private Step(): boolean {
        const result = this.ExecOp();
        if (typeof(result) === "number") { this._pointer += result; }
        return result !== "Exit";
    }

    private ExecOp(): DoNext {
        const operation = OpFromNum(this.memory[this._pointer]);
        switch (operation.baseOp) {
            case 1: // add
                const sum = this.arg(1, operation) + 
                    this.arg(2, operation);
                this.memory[this.arg(3)] = sum;
                return 4;
            case 2: // mult
                const prod = this.arg(1, operation) * 
                    this.arg(2, operation);
                this.memory[this.arg(3)] = prod;
                return 4;
            case 3: // read
                const rd = this.readIn();
                this.memory[this.arg(1)] = rd;
                return 2;
            case 4: // write
                const wr = this.arg(1, operation);
                this.writeOut(wr);
                return 2;
            case 5: // jmp_nonzero
                const to_nonzero = this.arg(2, operation);
                if(this.arg(1, operation) !== 0){
                    this._pointer = to_nonzero;
                    return "Stay";
                }
                return 3
            case 6: // jmp_zero
                const to_zero = this.arg(2, operation);
                if(this.arg(1, operation) === 0){
                    this._pointer = to_zero;
                    return "Stay";
                }
                return 3
            case 7: // less
                this.memory[this.arg(3)] = 
                    (this.arg(1, operation) < 
                        this.arg(2, operation)) 
                        ? 1 : 0;
                return 4
            case 8: // equals
                    this.memory[this.arg(3)] = 
                    (this.arg(1, operation) === 
                        this.arg(2, operation))
                        ? 1 : 0;
                return 4
            case 99: // exit
                return "Exit";
            default:
                throw new Error(`Unexpected op: ${operation.baseOp}`);
        }

    }
}
