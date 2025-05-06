#!/usr/bin/env node

import path from "path";
import fs from "fs";
import GhostAdminAPI from "@tryghost/admin-api";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import dotenv from "dotenv";
import { packageName } from "./lib/package";

// Load .env file variables into process.env (if it exists)
dotenv.config({ path: path.resolve(__dirname, "../.env") });


interface Argv {
  url: string;
  key?: string;
  file: string;
  help?: boolean;
  h?: boolean;
  [key: string]: any; // For other yargs properties like $0, _
}

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
    default: path.join(__dirname, "..", "dist", `${packageName}.zip`),
  })
  .help()
  .alias("help", "h").argv as Argv;

const apiUrl: string = argv.url.replace(/\/$/, ""); // Remove trailing slash if present
const apiKey: string | undefined = argv.key;
const zipFilePath: string = path.resolve(argv.file); // Ensure absolute path

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

const api = new GhostAdminAPI({
  url: apiUrl,
  key: apiKey,
  version: "v5.0",
});

interface GhostTheme {
  name?: string;
  active?: boolean;
  [key: string]: any;
}

interface GhostError {
  message: string;
  context?: string;
}

interface GhostErrorResponse {
  response?: {
    data?: {
      errors?: GhostError[];
    };
  };
  [key: string]: any;
}

async function uploadTheme(): Promise<void> {
  console.log(
    `\n🚀 Uploading theme '${packageName}' to ${apiUrl}...`
  );

  try {
    const response: GhostTheme | undefined = await api.themes.upload({
      file: zipFilePath,
    });
    const uploadedThemeName: string | undefined = response?.name;
    const isActive: boolean | undefined = response?.active;

    if (uploadedThemeName === packageName) {
      console.log(`✅ Theme '${uploadedThemeName}' uploaded successfully!`);
      if (!isActive) {
        console.log(`\n🔗 Activating theme '${packageName}'...`);
        await api.themes.activate(packageName);
        console.log(`✅ Theme '${packageName}' activated successfully!`);
      }
    } else {
      console.log(
        `⚠️ Upload successful, but response format unexpected or theme name mismatch.`
      );
      console.log("Full response:", JSON.stringify(response, null, 2));
    }
  } catch (error) {
    const err = error as GhostErrorResponse;
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

uploadTheme();
