const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const { exec } = require("child_process");
const { randomUUID } = require("crypto");
const env = require("./config/env");
const { apiRateLimiter } = require("./middlewares/rateLimiter");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");
const routes = require("./routes");
const Docker = require("dockerode");
const fs = require("fs");
const os = require("os");

const { randomUUID } = require("crypto");
const { runPython, runJS, runCPP } = require("../code");

const docker = new Docker();

const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "tiny"));
app.use(express.json({ limit: "60mb" }));
app.use(express.urlencoded({ extended: true, limit: "60mb" }));
app.use(cookieParser());
app.use(apiRateLimiter);
app.use("/public/upload", express.static(path.join(__dirname, "public", "upload")));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", environment: env.nodeEnv });
});

app.post("/run", (req, res) => {
  const { language, code, input } = req.body;
  const fileId = randomUUID();
  const extension = language === "c_cpp" ? "cpp" : language;
  const tempDir = os.tmpdir();
  const fileName = path.join(tempDir, `${fileId}.${extension}`);
  const inputFileName = path.join(tempDir, `${fileId}.input.txt`);
  const outputFileName = path.join(tempDir, `${fileId}.out`);
  const isWindows = os.platform() === "win32";

  fs.writeFileSync(fileName, code || "");
  fs.writeFileSync(inputFileName, input || "");

  const commandMap = {
    c_cpp: isWindows
      ? `g++ ${fileName} -o ${outputFileName} && ${outputFileName} < ${inputFileName}`
      : `g++ ${fileName} -o ${outputFileName} && ./${outputFileName} < ${inputFileName}`,
    java: `javac ${fileName} && java ${path.basename(fileName, ".java")} < ${inputFileName}`,
    php: `php ${fileName} < ${inputFileName}`,
    javascript: `node ${fileName} < ${inputFileName}`,
    python: `python ${fileName} < ${inputFileName}`,
  };

  const cleanup = () => {
    [fileName, inputFileName, outputFileName].forEach((target) => {
      if (fs.existsSync(target)) {
        fs.unlinkSync(target);
      }
    });
  };

  const command = commandMap[language];
  if (!command) {
    cleanup();
    return res.status(400).json({ output: "Unsupported language" });
  }

  exec(command, (error, stdout, stderr) => {
    cleanup();

    if (error) {
      return res.json({ output: stderr || error.message });
    }

    return res.json({ output: stdout });
  });
});

/*
app.post("/run", async (req, res) => {
  const { language, code } = req.body;

  try {
    let output = "";

    if (language === "python") {
      output = await runPython(code);
    } 
    else if (language === "javascript") {
      output = await runJS(code);
    } 
    else if (language === "c_cpp") {
      output = await runCPP(code);
    } 
    else {
      return res.status(400).json({ output: "Unsupported language" });
    }

    return res.json({ output: output.toString() });

  } catch (err) {
    return res.status(500).json({
      output: err.message
    });
  }
});
*/

app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
