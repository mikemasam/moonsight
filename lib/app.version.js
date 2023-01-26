import path from 'path';
import { readFile } from 'fs/promises';

export default async function app$version(opts){
  if(opts.version) throw "Version is set in package.json";
  let version = readEnv();
  if(!version) version = await readPackage();
  return version;
}

const readPackage = async () => {
  const url = path.join(process.env.PWD, '/package.json');
  const pkg = JSON.parse(await readFile(url));
  return pkg.version;
}

const readEnv = () => {
  return process.env.npm_package_version;
}


//  if(!process.env.npm_package_version) 
//    throw "Invalid Version number package.json";
//  if(opts.version) throw "Version is set in package.json";
