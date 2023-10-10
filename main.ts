import { parse } from "https://deno.land/std@0.119.0/flags/mod.ts";
import {
  Confirm,
  Select,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";

import {
  executeComand,
  green,
  installProject,
  redBold,
  tigedProject,
} from "./utils.ts";

const templates: { [key: string]: string } = {
  "next-basic":
    "git@gitlab.com:enverse-labs/green-templates/next-green-template.git",
  "vite-basic": "git@github.com:enverse/vite-green-template.git",
  "next-supabase-app-router":
    "git@gitlab.com:enverse-labs/next-green-template-app-router-supabase.git",
};

const GITLAB_DOCKER_TEMPLATE_URL =
  "git@gitlab.com:enverse-labs/docker-template.git";

let projectName = Deno.args[0];

if (!projectName) {
  const promptedProjetName = await prompt("What is the name of your project");
  if (!promptedProjetName) {
    console.log(redBold("specify project name"));
    Deno.exit(1);
  }
  projectName = promptedProjetName;
}

const flags = parse(Deno.args, {
  boolean: ["with-docker"],
  string: ["framework", "project"],
  alias: {
    "with-docker": "d",
    framework: "f",
  },
});

let withDocker = flags["with-docker"];
let { framework } = flags;

if (!withDocker) {
  withDocker = await Confirm.prompt({
    message: "Would you like to dockerize your app ?",
  });
}

if (!framework) {
  framework = await Select.prompt({
    message: "Which template would you like to use ?",
    options: ["next-basic", "vite-basic", "next-supabase-app-router"],
  });
}

const templateUrl = templates[framework];

if (!templateUrl) {
  console.log(framework);
  console.log(
    redBold(
      `The only accepted frameworks are ${Object.keys(templates).join(",")}`,
    ),
  );
  Deno.exit(1);
}
try {
  await Deno.mkdir(projectName);
} catch (e) {
  console.log(redBold(e));
  Deno.exit(1);
}

await tigedProject(templateUrl, projectName);
if (withDocker) {
  try {
    await tigedProject(GITLAB_DOCKER_TEMPLATE_URL, `./${projectName}/tmp`);
    await executeComand(
      ["mv", "./tmp/docker", "./tmp/Makefile", "./tmp/.gitlab-ci.yml", "./"],
      projectName,
    );
    await executeComand(["rm", "-rf", "./tmp"], `./${projectName}`);

    // await executeComand(["echo", `${degitConfig}`, ">>", "degit.json"]);
  } catch (e) {
    console.log(redBold(e));
    Deno.exit(1);
  }
}
await installProject(projectName);

await executeComand(["git", "init"], projectName);
await executeComand(
  [
    "echo",
    green("welcome to your new green project :) start eco-designing away !!"),
  ],
);
Deno.exit();
