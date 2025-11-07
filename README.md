# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

---

Repository branch layout (project standard)

This repository follows the team's branching convention: the code for each major component lives in its own branch. The `main` branch intentionally does NOT contain frontend or backend source code — it holds documentation and project-level notes only. Current branches:

- `frontend` — contains the full frontend code (Astro project, `src/`, `public/`, build tooling). This is the working branch for front-end development.
- `backend` — contains only the backend API files extracted from this repo (kept here as a backup). The canonical backend repo is external: https://github.com/Eroroshy/PrimerPaso-Back

Workflow notes

- Create feature branches from `frontend` (for example `frontend/feature/auth-ui`) and open pull requests into `frontend` when ready.
- Create feature branches from `backend` (for example `backend/feature/auth-api`) and push to the backend repo for collaboration.
- `main` remains a documentation branch summarizing structure, sprint notes and deliverables.

SCRUM & deliverables

Follow the sprint cadence and maintain descriptive commits. Include sprint notes and short demo instructions in `docs/` (create this directory on `main` if needed).

If you need me to push the backend branch to the external backend repo (https://github.com/Eroroshy/PrimerPaso-Back), I can attempt to push a branch named `initial-backend` — note: that operation requires write permission on the target repo. If permission is not available I will provide exact commands for you to run from an account with access.
