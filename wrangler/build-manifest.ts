import fileSystem from "fs";
import glob from "glob";
import chalk from "chalk";

(async _ => {
  const root = __dirname.replace(/\/wrangler$/, "");
  fileSystem.mkdirSync(`${root}/dist/omelette/`, { recursive: true });

  const functionGlob = `${root}/functions/**/*.func.{ts,js}`;
  const functionManifest: { [key: string]: string } = {};
  
  await Promise.all(glob.sync(functionGlob).map(async functionPath => {
    const modulePath = functionPath.replace(`${root}/functions`, "").slice(0, -8);
    const deployPath = `/fn${modulePath.replace(/\/index/g, "")}`;
    functionManifest[deployPath] = functionPath.slice(0, -3);
  }));
  
  const generateFunctionModuleExport = (path: string, index: number) => {
    functionModuleText += `import f${index} from "${functionManifest[path]}";\n`;
    return true;
  };

  const generateFunctionManifestEntry = (path: string, index: number) => {
    functionModuleText += ` "${path}": f${index},`;
    return true;
  };
  
  let functionModuleText = "";
  Object.keys(functionManifest).every(generateFunctionModuleExport);
  functionModuleText += "export default {";
  Object.keys(functionManifest).every(generateFunctionManifestEntry);
  functionModuleText += " };";

  fileSystem.writeFileSync(`${root}/dist/omelette/manifest.ts`, functionModuleText);
  console.log(`${chalk.blue('BUILD')} functions.ts`);
})();
