export default function countdown(seconds, callback) {
  console.log(`Starting in ${seconds} seconds...`);
  let remaining = seconds;
  const timer = setInterval(() => {
    remaining--;
    console.log(`${remaining}...`);
    if (remaining === 0) {
      clearInterval(timer);
      console.log('Starting now!\n');
      callback();
    }
  }, 1000);
}