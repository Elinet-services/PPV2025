# Deployment

`PPV2025` keeps runtime target URLs in versioned profiles:

- `config/runtime/dev.json`
- `config/runtime/jirka-dev.json`
- `config/runtime/test.json`
- `config/runtime/prod.json`

Available build commands:

- `npm run build:dev`
- `npm run build:jirka-dev`
- `npm run build:test`
- `npm run build:prod`

Local runtime switching commands:

- `npm run config:use:dev`
- `npm run config:use:jirka-dev`
- `npm run config:use:test`
- `npm run config:use:prod`

`react-scripts start` reads `public/configuration.json`, so the usual local flow is:

- `npm run config:use:dev`
- `npm start`

GitHub Environments expected by the workflows:

- `dev`
- `jirka-dev`
- `test`
- `prod`

Environment variables:

- `WEB_DEPLOY_HOST`
- `WEB_DEPLOY_PATH`
- `PPV_API_BASE_URL` (optional override, useful mainly for `dev`)
- `PPV_API_BASE_URL_GET` (optional override, useful mainly for `dev`)
- `PPV_DOMAIN_NAME` (optional override)

Environment secrets:

- `WEB_DEPLOY_USER`
- `WEB_DEPLOY_SSH_KEY`
- `MDB_GIT_TOKEN`

Workflows:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-dev.yml`
- `.github/workflows/deploy-jirka-dev.yml`
- `.github/workflows/deploy-test.yml`
- `.github/workflows/deploy-prod.yml`

Recommended repository settings:

- use `dev` as the shared development branch if you want automatic DEV deploys
- protect `main`
- require pull requests before merge
- require approval for the `prod` environment
