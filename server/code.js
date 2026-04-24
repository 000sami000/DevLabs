export async function runPython(code) {
  const id = randomUUID();
  const dir = path.join(os.tmpdir(), id);

  fs.mkdirSync(dir);

  const filePath = path.join(dir, "main.py");
  fs.writeFileSync(filePath, code);

  const container = await docker.createContainer({
    Image: "python:3.11-alpine",
    Cmd: ["python", "/app/main.py"],
    Tty: false,
    HostConfig: {
      Binds: [`${dir}:/app`],
      AutoRemove: true
    }
  });

  await container.start();

  const output = await container.wait();
  const logs = await container.logs({
    stdout: true,
    stderr: true
  });

  fs.rmSync(dir, { recursive: true, force: true });

  return logs.toString();
}


export async function runJS(code) {
  const id = randomUUID();
  const dir = path.join(os.tmpdir(), id);

  fs.mkdirSync(dir);

  const filePath = path.join(dir, "main.js");
  fs.writeFileSync(filePath, code);

  const container = await docker.createContainer({
    Image: "node:20-alpine",
    Cmd: ["node", "/app/main.js"],
    HostConfig: {
      Binds: [`${dir}:/app`],
      AutoRemove: true
    }
  });

  await container.start();

  await container.wait();

  const logs = await container.logs({
    stdout: true,
    stderr: true
  });

  fs.rmSync(dir, { recursive: true, force: true });

  return logs.toString();
}

export async function runCPP(code) {
  const id = randomUUID();
  const dir = path.join(os.tmpdir(), id);

  fs.mkdirSync(dir);

  const filePath = path.join(dir, "main.cpp");
  fs.writeFileSync(filePath, code);

  const container = await docker.createContainer({
    Image: "gcc:latest",
    Cmd: ["sh", "-c", "g++ /app/main.cpp -o /app/a.out && /app/a.out"],
    HostConfig: {
      Binds: [`${dir}:/app`],
      AutoRemove: true
    }
  });

  await container.start();
  await container.wait();

  const logs = await container.logs({
    stdout: true,
    stderr: true
  });

  fs.rmSync(dir, { recursive: true, force: true });

  return logs.toString();
}