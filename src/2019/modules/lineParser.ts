interface ParseCallback<T> {
    (s: string[], i?: number): T;
}
function parseToObjects<T>(d: string, re: RegExp, trans: ParseCallback<T>): T[] {
    const lines = d.split("\n").filter(s => s.length);
    return lines.map((line, i) => {
        const match = re.exec(line);
        return trans(match, i);
    });
}
function chunk<T> (items: T[], chunkSize: number) {
    const result: Array<Array<T>> = [];
    while (items.length > 0) {
        result.push(items.splice(0, chunkSize));
    }
    return result;
}
function parseToObjectsMultiline<T>(d: string, re: RegExp, trans: ParseCallback<T>, lineNr: number): T[] {
    const lines = d.split("\n");
    const chunks = chunk(lines, lineNr);
    return chunks.map(l => l.join("\n"))
        .filter(line => line.length > 0)
        .map((line, i) => {
        const match = re.exec(line);
        return trans(match, i);
    });
}
export {ParseCallback as parseCallback, parseToObjects, parseToObjectsMultiline};