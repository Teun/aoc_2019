declare module "pngjs-image"{
    function createImage(width: number, height: number): PngImage;
    interface PngImage {
        getWidth(): number;
        getHeight(): number;
        setAt(x: number, y: number, color: ColorDef);
        writeImage(file: string, cb: (err: any) => void);
    }
    interface ColorDef {
        red: number;
        green: number;
        blue: number;
        alpha: number;
    }

}

