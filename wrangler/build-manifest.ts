import fileSystem from "fs";
import glob from "glob";
import chalk from "chalk";

function sortFunctionPaths(functionPaths: string[]) {
  return functionPaths.sort((pathA, pathB) => {
    let pathASegments = pathA.slice(0, -8).split("/");
    let pathBSegments = pathB.slice(0, -8).split("/");

    pathASegments = pathASegments.filter(_ => _.toLowerCase() !== "index");
    pathBSegments = pathBSegments.filter(_ => _.toLowerCase() !== "index");
    
    if (pathASegments.length < pathBSegments.length) return 1;
    if (pathASegments.length > pathBSegments.length) return -1;

    const getFPSI = (_: string[]) => _.map(__ => __[0]).indexOf("@");
    const firstParamSegmentIndexes = [pathASegments, pathBSegments].map(getFPSI);
    const firstParamSegmentIndex = Math.min(...firstParamSegmentIndexes.filter(_ => _ > -1));
    if (firstParamSegmentIndex === Infinity) return 0;

    const getPBFS = (_: string[]) => _.slice(0, firstParamSegmentIndex).join("/");
    const pathBeforeFirstSegments = [pathASegments, pathBSegments].map(getPBFS);
    if (pathBeforeFirstSegments[0] !== pathBeforeFirstSegments[1]) return 0;

    if (pathASegments[firstParamSegmentIndex].startsWith("@")) return 1;
    if (pathBSegments[firstParamSegmentIndex].startsWith("@")) return -1;
    return 0;
  });
}

(async _ => {
  const root = __dirname.replace(/\/wrangler$/, "");
  fileSystem.mkdirSync(`${root}/dist/omelette/`, { recursive: true });

  const functionGlob = `${root}/pages/**/*.func.{ts,js}`;
  const functionPaths = glob.sync(functionGlob);

  let functionsRouteCounter: number = 0;
  let functionsModuleText: string = "let routes: any[] = [];\n";

  await Promise.all(sortFunctionPaths(functionPaths).map(async functionPath => {
    let expression = functionPath.replace(`${root}/pages`, "").slice(0, -8);
    expression = expression.replace(/^(\/)index|\/index/g, "$1");
    expression = expression.replace(/@([^\/]+)/g, "(?<$1>[^/]+)");
    expression = expression.replace(/@([^\/]+)/g, "(?<$1>[^/]+)");
    expression = (expression + "/?").replace(/\//g, "\\/");

    let modulePath = functionPath.replace(`${root}`, "../..").slice(0, -3);
    let moduleName = "f" + functionsRouteCounter;
    functionsModuleText += `import ${moduleName} from "${modulePath}";\n`;
    functionsModuleText += `routes.push({ expression: /^${expression}$/, module: ${moduleName} });\n`;
    functionsRouteCounter += 1;
  }));
  
  functionsModuleText += "export default routes;\n";
  fileSystem.writeFileSync(`${root}/dist/omelette/functions.ts`, functionsModuleText);
  console.log(`${chalk.blue('BUILD')} functions.ts`);
})();
