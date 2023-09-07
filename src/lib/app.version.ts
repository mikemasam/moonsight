import path from "path";
import { readFile } from "fs/promises";
import { KernelArgs } from "..";

export default async function app$version(opts: KernelArgs): Promise<string> {
  if (!opts.version) throw "Version is number is required";
  return opts.version;
}
