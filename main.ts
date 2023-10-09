import { parse } from "https://deno.land/std@0.119.0/flags/mod.ts";

import {
  redBold,
  green,
  executeComand,
  tigedProject,
  installProject,
} from "./utils.ts";


const GITHUB_NEXT_GREEN_TEMPLATE_URL =
  "git@gitlab.com:enverse-labs/next-green-template.git";
const GITHUB_VITE_GREEN_TEMPLATE_URL =
  "git@github.com:enverse/vite-green-template.git";

  const templates: {[key: string]: string} = {
    "next-basic": "git@gitlab.com:enverse-labs/next-green-template.git",
    "vite-basic": "git@github.com:enverse/vite-green-template.git",
    "next-supabase-router": "git@gitlab.com:enverse-labs/green-templates/next-green-template-app-router-supabase.git"
  }

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
  default: { "with-docker": false, framework: "next-basic" },
});


const withDocker = flags["with-docker"];
const { framework } = flags;

if (!templates[flags.framework]) {
  console.log(
    redBold(`The only accepted frameworks are ${Object.keys(templates).join(",")}`)
  );
}

const girlUrl =
  framework === "next"
    ? GITHUB_NEXT_GREEN_TEMPLATE_URL
    : GITHUB_VITE_GREEN_TEMPLATE_URL;

await executeComand(["mkdir", projectName]);

await tigedProject(girlUrl, projectName);
if (withDocker) {
  try {
    await tigedProject(GITLAB_DOCKER_TEMPLATE_URL, `./${projectName}/tmp`);
    await executeComand(
      ["mv", "./tmp/docker", "./tmp/Makefile", "./tmp/.gitlab-ci.yml", "./"],
      projectName
    );
    await executeComand(["rm", "-rf", "./tmp"], projectName);

    // await executeComand(["echo", `${degitConfig}`, ">>", "degit.json"]);
  } catch (e) {
    console.log(redBold(e));
    Deno.exit(1);
  }
}
await installProject(projectName);

await executeComand(["git", "init"], projectName);
await executeComand([
  "echo",
  green("welcome to your new green project :) start eco-desiginin away !!"),
]);
Deno.exit();
