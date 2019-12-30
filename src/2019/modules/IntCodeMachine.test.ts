import { IntCodeMachine } from "./IntCodeMachine";

it("Calculates sums", async () => {
    const machine = new IntCodeMachine([1, 0, 0, 0, 99]);
    await machine.Run();

    expect(machine.Memory).toEqual([2, 0, 0, 0, 99]);
});
it("Calculates products", async () => {
    const machine = new IntCodeMachine([2, 4, 4, 5, 99, 0]);
    await machine.Run();

    expect(machine.Memory).toEqual([2, 4, 4, 5, 99, 9801]);
});
it("Calculates products with argModes", async () => {
    const machine = new IntCodeMachine([102, 4, 4, 5, 99, 0]);
    await machine.Run();

    expect(machine.Memory).toEqual([102, 4, 4, 5, 99, 396]);
});
it("Handles overwritten operations", async () => {
    const machine = new IntCodeMachine([1, 1, 1, 4, 99, 5, 6, 0, 99]);
    await machine.Run();

    expect(machine.Memory).toEqual([30, 1, 1, 4, 2, 5, 6, 0, 99]);
});
it("Can work with relative addresses", async () => {
    const machine = new IntCodeMachine([109, 1, 204, -1, 1001, 100, 1, 100, 1008, 100, 16, 101, 1006, 101, 0, 99]);
    await machine.Run();

    expect(machine.output).toEqual([109, 1, 204, -1, 1001, 100, 1, 100, 1008, 100, 16, 101, 1006, 101, 0, 99]);
});
it("Can work with large numbers", async () => {
    const machine = new IntCodeMachine([1102, 34915192, 34915192, 7, 4, 7, 99, 0]);
    await machine.Run();

    expect(machine.output[0].toString().length).toEqual(16);
});
it("Can work with large numbers", async () => {
    const machine = new IntCodeMachine([104, 1125899906842624, 99]);
    await machine.Run();

    expect(machine.output[0]).toEqual(1125899906842624);
});
it("emits events for output", async () => {
    const machine = new IntCodeMachine([104, 1125899906842624, 99]);
    const prom = new Promise<number>((res, rej) => {
        machine.on("output", () => {
            res(machine.output[0]);
        });
    });
    await machine.Run();
    const result = await prom;
    expect(result).toEqual(1125899906842624);
});
