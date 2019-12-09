// Type definitions for pngjs-image 0.11
// Project: https://github.com/yahoo/pngjs-image
// Definitions by: Teun Duynstee <https://github.com/Teun>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export function createImage(width: number, height: number): PngImage;
export function readImage(filePath: string, cb: (err: any, image: PngImage) => void): void;

export interface PngImage {
    getWidth(): number;
    getHeight(): number;
    setAt(x: number, y: number, color: ColorDef): void;
    writeImage(file: string, cb: (err: any) => void): void;
}
export interface ColorDef {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}
