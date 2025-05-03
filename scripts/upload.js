#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const GhostAdminAPI = require("@tryghost/admin-api");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

// Load .env file variables into process.env (if it exists)
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// --- Configuration ---

// Read theme name from package.json
let packageJson;
try {
  packageJson = require("../package.json");
} catch (err) {
  console.error("❌ Error: package.json not found in the parent directory.");
  process.exit(1);
}
const themeName = packageJson.name;
const defaultZipPath = path.join(__dirname, `../dist/${themeName}.zip`);

// --- Argument Parsing ---

const argv = yargs(hideBin(process.argv))
  .usage(
    "Usage: $0 [--url <ghost_url>] [--key <admin_api_key>] [--file <path_to_zip>]"
  )
  .option("url", {
    alias: "u",
    type: "string",
    description: "Ghost Admin API URL",
    default: process.env.GHOST_ADMIN_API_URL || "https://felix.ghost.io",
  })
  .option("key", {
    alias: "k",
    type: "string",
    description: "Ghost Admin API Key",
    default: process.env.GHOST_ADMIN_API_KEY,
  })
  .option("file", {
    alias: "f",
    type: "string",
    description: "Path to the theme zip file",
    default: defaultZipPath,
  })
  .help()
  .alias("help", "h").argv;

// --- Validation ---

const apiUrl = argv.url.replace(/\/$/, ""); // Remove trailing slash if present
const apiKey = argv.key;
const zipFilePath = path.resolve(argv.file); // Ensure absolute path

if (!apiKey) {
  console.error("❌ Error: Ghost Admin API Key is required.");
  console.error(
    "Provide it via --key argument, GHOST_ADMIN_API_KEY environment variable, or .env file."
  );
  process.exit(1);
}

if (!fs.existsSync(zipFilePath)) {
  console.error(`❌ Error: Theme file not found at ${zipFilePath}`);
  console.error(`Did you run 'yarn zip' first?`);
  process.exit(1);
}

// Split key into id and secret
const [id, secret] = apiKey.split(":");
if (!id || !secret || id.length !== 24 || secret.length !== 64) {
  console.warn(
    "🤔 Warning: API key format looks unusual. Ensure it is a valid Admin API Key."
  );
}

// --- API Initialisation ---

const api = new GhostAdminAPI({
  url: apiUrl,
  key: apiKey,
  version: "v5.0",
});

// --- Upload Logic ---

async function uploadTheme() {
  console.log(
    `\n🚀 Uploading theme '${themeName}' from ${zipFilePath} to ${apiUrl}...`
  );

  try {
    const response = await api.themes.upload({ file: zipFilePath });
    const uploadedThemeName = response?.name;
    const isActive = response?.active;
    if (uploadedThemeName === themeName) {
      console.log(`✅ Theme '${uploadedThemeName}' uploaded successfully!`);
      if (!isActive) {
        console.log(`\n🔗 Activating theme '${themeName}'...`);
        await api.themes.activate(themeName);
        console.log(`✅ Theme '${themeName}' activated successfully!`);
      }
    } else {
      console.log(
        `⚠️ Upload successful, but response format unexpected or theme name mismatch.`
      );
      console.log("Full response:", JSON.stringify(response, null, 2));
    }
  } catch (err) {
    console.error(`❌ Error uploading theme:`);
    // Provide more specific feedback if available
    if (err.response?.data?.errors?.[0]?.message) {
      console.error(`   Message: ${err.response.data.errors[0].message}`);
      if (err.response.data.errors[0].context) {
        console.error(`   Context: ${err.response.data.errors[0].context}`);
      }
    } else {
      console.error(err); // Fallback to full error
    }
    process.exit(1);
  }
}

// --- Execution ---

uploadTheme();
