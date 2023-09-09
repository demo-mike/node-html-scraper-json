import { rm, mkdir } from "fs/promises";
import chalk from "chalk";

/**
 * Clears a directory and its content
 * @param {string} directory - The directory to clear
 */
export async function clearDirectory(directory) {
  console.log(chalk.yellow(`🗑️  Clearing ${directory} old data\n`));
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
}
