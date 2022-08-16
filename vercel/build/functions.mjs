import fileSystem from "fs";
import glob from "glob";

glob.sync("functions/**/*.func.{ts,js}").map(functionPath => {
  const functionDirectoryPath = functionPath.split("/").slice(1).join("/").slice(0, -3);
  const outputPath = ".vercel/output/functions/_functions/" + functionDirectoryPath;
  fileSystem.mkdirSync(outputPath, { recursive: true });
  console.log(functionPath, outputPath);
});
