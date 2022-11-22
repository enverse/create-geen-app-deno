import { green, red, bold } from "https://deno.land/std@0.123.0/fmt/colors.ts";

const redBold = (text: string) => red(bold(text));

const executeComand = async (command: string, cwd = "./") => {
  const splitCommand = command.split(" ");
  const process = Deno.run({
    cmd: splitCommand,
    stdout: "piped",
    stderr: "piped",
    cwd,
  });

  const { code } = await process.status();

  // Reading the outputs closes their pipes
  const rawOutput = await process.output();
  const rawError = await process.stderrOutput();

  if (code === 0) {
    await Deno.stdout.write(rawOutput);
  } else {
    const errorString = new TextDecoder().decode(rawError);
    console.log(errorString);
  }
};

const buildTemplate = async (gitUrl: string, dest: string) => {
  console.log(`cd ${dest}; pnpm install`);
  try {
    await executeComand(`pnpm dlx tiged ${gitUrl} ${dest}`);
    await executeComand(`echo ${green(`installed project from: ${gitUrl}`)}`);
    await executeComand(`pnpm install`, dest);
  } catch (e) {
    console.log(redBold("ERROR creating repo"), e);
    Deno.exit(1);
  }
};

export { redBold, buildTemplate, green, executeComand };
