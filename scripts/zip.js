const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { name } = require("../package.json"); // Get theme name from package.json

const filename = `${name}.zip`;
const destination = path.join(__dirname, "../dist");
const output = path.join(destination, filename);

// Ensure the dist directory exists
fs.mkdirSync(destination, { recursive: true });

// Create a file to stream archive data to.
const stream = fs.createWriteStream(output);
const archive = archiver("zip", {
  zlib: { level: 9 }, // Sets the compression level.
});

stream.on("close", function () {
  console.log(
    `✅ ${filename} created successfully (${(
      archive.pointer() /
      1024 /
      1024
    ).toFixed(2)} MB)`
  );
});

archive.on("warning", function (err) {
  if (err.code === "ENOENT") {
    console.warn("Archiver warning: ", err);
  } else {
    throw err;
  }
});

archive.on("error", function (err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(stream);

// Add files and directories, excluding specified ones
archive.glob("**/*", {
  cwd: path.join(__dirname, ".."), // Run from project root
  ignore: [
    "node_modules/**",
    "dist/**",
    "yarn-error.log",
    "yarn.lock",
    ".git/**",
    ".github/**",
    "*.zip", // Ignore existing zip files
    "scripts/**", // Ignore the scripts folder itself
    "gulpfile.js", // Ignore old gulpfile
    "postcss.config.js", // Ignore postcss config
    // Add any other files/folders to ignore
  ],
});

// Finalise the archive
archive.finalize();
