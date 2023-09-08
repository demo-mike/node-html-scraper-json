import { writeFile, mkdir, rm } from "fs/promises";
import chalk from "chalk";

/**
 * Clears a directory and then recreates it
 * @param {string} directory - The name of the directory
 * @returns {Promise<void>}
 */
export async function cleanDirectory(directory) {
  try {
    // Clear the directory
    console.log(chalk.yellow("🗑️  Clearing old data\n"));
    await rm(directory, { recursive: true, force: true });

    // Recreate the directory
    console.log(chalk.yellow("📂 Creating data directory\n"));
    await mkdir(directory, { recursive: true });
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error}\n`));
  }
}

/**
 * Writes a file to a specific directory, creating the directory if it doesn't exist
 * @param {string} dirName - The name of the directory
 * @param {string} fileName - The name of the file
 * @param {string} content - The content to write to the file
 * @returns {Promise<void>}
 */
export async function writeFile(dirName, fileName, content) {
  try {
    await writeFile(`${dirName}/${fileName}`, content);
    console.log(chalk.green(`💾 File ${fileName} has been saved to ${dirName}!\n`));
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error}\n`));
  }
}
