import chalk from "chalk";

/**
 * Counts down from a specified number of seconds and then calls a callback function
 * @param {number} seconds - The number of seconds to count down from
 * @param {Function} callback - The function to call after the countdown
 */
export default function countdown(seconds, callback) {
  try {
    console.log(chalk.cyan(`⏱️ Starting in ${seconds} seconds...`));
    let remaining = seconds;
    const timer = setInterval(() => {
      remaining--;
      console.log(chalk.cyan(`${remaining}...`));
      if (remaining === 0) {
        clearInterval(timer);
        console.log(chalk.green("👇 Starting now!\n"));
        callback();
      }
    }, 1000);
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error}\n`));
  }
}
