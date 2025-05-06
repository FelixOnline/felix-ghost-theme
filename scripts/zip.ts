import fs from "fs";
import path from "path";
import archiver, { ArchiverError } from "archiver";
import { packageName } from "./lib/package";

const filename = `${packageName}.zip`;
const projectRoot: string = path.join(__dirname, ".."); // Define project root
const destination: string = path.join(projectRoot, "dist");
const output: string = path.join(destination, filename);

export function getThemeZipPath(): string {
  return output;
}

// Ensure the dist directory exists
fs.mkdirSync(destination, { recursive: true });

const stream: fs.WriteStream = fs.createWriteStream(output);
const archive = archiver("zip", {
  zlib: { level: 9 }, // Sets the compression level.
});

stream.on("close", function () {
  console.log(
    `✅ ${filename} created successfully (${Math.round(archive.pointer() / 1024)} KB)`
  );
});

archive.on("warning", function (err: ArchiverError) {
  if (err.code === "ENOENT") {
    console.warn("Archiver warning: ", err);
  } else {
    throw err;
  }
});

archive.on("error", function (err: ArchiverError) {
  throw err;
});

archive.pipe(stream);

const filesToInclude: string[] = [
  "package.json",
  "*.hbs",
  "partials/**/*",
  "assets/built/**/*",
];

filesToInclude.forEach((pattern) => {
  archive.glob(pattern, {
    cwd: projectRoot,
    dot: false,
  });
});

archive.finalize();
