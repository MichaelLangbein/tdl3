import fs from "fs";
import fsp from "fs/promises";


export function fileExists(path: string): boolean {
    return fs.existsSync(path);
}