import { exec } from "https://deno.land/x/exec@0.0.5/mod.ts";
import { parse } from "https://deno.land/std@0.119.0/flags/mod.ts";
import { green, red, bold } from "https://deno.land/std@0.123.0/fmt/colors.ts";

const GITHUB_NEXT_GREEN_TEMPLATE_URL =
  "git@github.com:enverse/next-green-template.git";
const GITHUB_VITE_GREEN_TEMPLATE_URL =
  "git@github.com:enverse/vite-green-template.git";

const GITLAB_DOCKER_TEMPLATE_URL =
  "git@gitlab.com:enverse-labs/docker-template.git";

const redBold = (text: string) => red(bold(text));

const buildTemplate = async (gitUrl: string) => {
  try {
    await exec(`pnpm -dlx degit ${gitUrl}`);
    await exec("pnpm install");
  } catch (e) {
    console.log(redBold("ERROR creating repo"), e);
    Deno.exit(1);
  }
};

const flags = parse(Deno.args, {
  boolean: ["with-docker"],
  string: ["framework"],
  alias: {
    "with-docker": "d",
    framework: "f",
  },
  default: { "with-docker": false, framework: "next" },
});

const possibleFrameworks: Array<"vite" | "next"> = ["vite", "next"];

const withDocker = flags["with-docker"];
const { framework } = flags;

if (possibleFrameworks.indexOf(flags.framework) === -1) {
  console.log(
    red(
      bold(`The only accepted frameworks are ${possibleFrameworks.join(",")}`)
    )
  );
}

const girlUrl =
  framework === "next"
    ? GITHUB_NEXT_GREEN_TEMPLATE_URL
    : GITHUB_VITE_GREEN_TEMPLATE_URL;

buildTemplate(girlUrl);

if (withDocker) {
  try {
    await exec(`pnpx degit ${GITLAB_DOCKER_TEMPLATE_URL}`);
  } catch (e) {
    console.log(redBold(e));
    Deno.exit(1);
  }
}

await exec("git init");
console.log(green("Start eco designing away :)"));
Deno.exit();
