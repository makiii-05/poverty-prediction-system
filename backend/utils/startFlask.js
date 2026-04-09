const { spawn } = require("child_process");
const path = require("path");

let flaskProcess = null;

const startFlask = () => {
  if (flaskProcess) {
    console.log("Flask already running");
    return;
  }

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
  });
};

module.exports = { startFlask };