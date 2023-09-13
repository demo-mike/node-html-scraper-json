import { rm, mkdir } from "fs/promises";
import chalk from "chalk";

/**
 * Clears a directory and its content
 * @param {string} directory - The directory to clear
 * @returns {Promise<void>}
 */
export async function clearDirectory(directory) {
  try {
    console.log(chalk.yellow(`🗑️  Clearing ${directory} old data\n`));

    // Remove the directory and its content
    await rm(directory, { recursive: true, force: true });

    // Create the directory
    await mkdir(directory, { recursive: true });

    console.log(chalk.green(`✅ Successfully cleared and recreated ${directory}\n`));
  } catch (error) {
    console.error(chalk.red(`❌ Error while clearing ${directory}: ${error}\n`));
  }
}
