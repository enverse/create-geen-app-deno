import { bold, green, red } from "https://deno.land/std@0.203.0/fmt/colors.ts";
import tiged from "npm:tiged@2.12.5";

const redBold = (text: string) => red(bold(text));

const commandError = (command: string, error: string) => {
  console.log(red(`Command \n ${redBold(command)} \n failed with: ${error}`));
};

const executeComand = async (isntructions: string[], cwd = "./") => {
  //   const splits = splitCommand(command);
  const [command, ...args] = isntructions;

  try {
    const executableCommand = new Deno.Command(command, {
      args,
      stdout: "piped",
      stderr: "piped",
      cwd,
    });

    const { success, stdout, stderr } = await executableCommand.output();

    // Reading the outputs closes their pipes

    if (success) {
      await Deno.stdout.write(stdout);
    } else {
      const errorString = new TextDecoder().decode(stderr);
      commandError(command, errorString);
      Deno.exit(1);
    }
  } catch (e) {
    commandError(command, e);
    Deno.exit(1);
  }
};

const installProject = async (dest: string) => {
  try {
    await executeComand(["pnpm", "install"], dest);
  } catch (e) {
    console.log(
      redBold(
        `ERROR isntalling dependecies, run npm/yarn/pnpm install in ${dest}`,
      ),
      e,
    );
    Deno.exit(1);
  }
};

const tigedProject = async (url: string, dest: string, shouldForce = false) => {
  try {
    const emitter = tiged(url, { force: shouldForce, subgroup: true });
    await emitter.clone(dest);
    await executeComand(
      ["echo", `${green(`installed project from: ${url} in ${dest}`)}`],
    );
  } catch (e) {
    console.log(red(`Error getting project from: \n\t${redBold(url)}\n`));
    console.log(red(`Message: \n\t${redBold(e.message)}\n`));

    Deno.exit(1);
  }
};

export { executeComand, green, installProject, redBold, tigedProject };
