const BLOCKSIZE = 1000;
class StringAppender {

    private blocks: Block[] = [new Block()];
    private lastBlock: number = 0;
    public append(s: string) {
        const lastBlock = this.blocks[this.lastBlock];
        lastBlock.data += s;
        if (lastBlock.data.length > BLOCKSIZE + 10) {
            this.splitLast();
        }
    }
    public tail(n: number) {
        const s = this.blocks[this.lastBlock].data;
        return s.substring(s.length - n);
    }
    public get(i: number) {
        let blockNum = Math.floor(i / BLOCKSIZE);
        let inBlock = i % BLOCKSIZE;
        if (blockNum >= this.lastBlock) {
            blockNum = this.lastBlock;
            inBlock = i - (blockNum * BLOCKSIZE);
        }
        return this.blocks[blockNum].data[inBlock];
    }
    public get length(): number {
        return (this.lastBlock * BLOCKSIZE) + this.blocks[this.lastBlock].data.length;
    }
    private splitLast() {
        const lastBlock = this.blocks[this.lastBlock];
        const newBlock = new Block();
        newBlock.data = lastBlock.data.substring(BLOCKSIZE);
        lastBlock.data = lastBlock.data.substring(0, BLOCKSIZE);
        this.blocks.push(newBlock);
        this.lastBlock++;

    }
}
class Block {
    public data: string = "";
}
export {StringAppender};
