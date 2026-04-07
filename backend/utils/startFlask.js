const { spawn } = require("child_process");
const path = require("path");

let flaskProcess = null;
let flaskStartingPromise = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForFlask = async (retries = 15, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch("http://127.0.0.1:8000/");

      if (response.ok) {
        console.log("Flask is ready");
        return true;
      }
    } catch (error) {
      console.log(`⏳ Waiting for Flask... attempt ${i + 1}/${retries}`);
    }

    await sleep(delay);
  }

  throw new Error("Flask did not start in time");
};

const startFlask = async () => {
  if (flaskProcess) {
    try {
      await waitForFlask(3, 500);
      console.log("Flask already running");
      return;
    } catch {
      console.log("Flask process exists but is not responding. Restarting...");
      flaskProcess.kill();
      flaskProcess = null;
    }
  }

  if (flaskStartingPromise) {
    return flaskStartingPromise;
  }

  flaskStartingPromise = (async () => {
    const flaskPath = path.join(__dirname, "../../ml-service/app.py");

    flaskProcess = spawn("python", [flaskPath], {
      stdio: "pipe",
      shell: true,
    });

    flaskProcess.stdout.on("data", (data) => {
      console.log(`Flask: ${data.toString()}`);
    });

    flaskProcess.stderr.on("data", (data) => {
      console.error(`Flask ERROR: ${data.toString()}`);
    });

    flaskProcess.on("close", (code) => {
      console.log(`Flask exited with code ${code}`);
      flaskProcess = null;
      flaskStartingPromise = null;
    });

    await waitForFlask();
    flaskStartingPromise = null;
  })();

  return flaskStartingPromise;
};

module.exports = { startFlask };