import { parse } from "https://deno.land/std@0.119.0/flags/mod.ts";

import { redBold, green, buildTemplate, executeComand } from "./utils.ts";

const GITHUB_NEXT_GREEN_TEMPLATE_URL =
  "git@github.com:enverse/next-green-template.git";
const GITHUB_VITE_GREEN_TEMPLATE_URL =
  "git@github.com:enverse/vite-green-template.git";

const GITLAB_DOCKER_TEMPLATE_URL =
  "git@gitlab.com:enverse-labs/docker-template.git";

const projectName = Deno.args[0];

if (!projectName) {
  console.log(redBold("specify project name"));
  Deno.exit(1);
}

const flags = parse(Deno.args, {
  boolean: ["with-docker"],
  string: ["framework", "project"],
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
    redBold(`The only accepted frameworks are ${possibleFrameworks.join(",")}`)
  );
}

const girlUrl =
  framework === "next"
    ? GITHUB_NEXT_GREEN_TEMPLATE_URL
    : GITHUB_VITE_GREEN_TEMPLATE_URL;

await buildTemplate(girlUrl, projectName);

if (withDocker) {
  try {
    await executeComand(`pnpm dlx tiged ${GITLAB_DOCKER_TEMPLATE_URL}`);
  } catch (e) {
    console.log(redBold(e));
    Deno.exit(1);
  }
}

await executeComand("git init", projectName);
await executeComand(
  `echo ${green(
    "welcome to your new green project :) start eco-desiginin away !!"
  )}`
);
// console.log(green("Start eco designing away :)"));
Deno.exit();
