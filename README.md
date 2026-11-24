# Zephyr examples

> This branch reproduces [module-federation/core#5288](https://github.com/module-federation/core/issues/5288). It differs from `main` only in leaving the entry URL rewrite fix out of `patches/@module-federation__metro@2.9.0.patch`.

## Reproducing module-federation/core#5288

1. `pnpm install`
2. `pnpm --filter host start`: Metro for the remote named `host`, on `localhost:8082`.
3. In another terminal, register the remote's entry bundle with Metro's HMR server, as React Native's HMR client does once the app has loaded it (Node.js 22 or later):

   ```bash
   node -e "const ws = new WebSocket('ws://localhost:8082/hot'); ws.onopen = () => ws.send(JSON.stringify({ type: 'register-entrypoints', entryPoints: ['http://localhost:8082/host.bundle?platform=ios&dev=true'] }))"
   ```

Metro rewrites the URL to `http://localnode_modules/.mf-metro/host:8082/host.bundle?...` and exits with `UnableToResolveError: Unable to resolve module ./.mf-metro/host:8082/host`. On `main` the same message leaves Metro running.

Running the apps hits the same crash once the Native Shell loads the Host: `pnpm dev` and `pnpm ios` from `metro/native-shell`.

This repository is a pnpm workspace. Shared formatting is configured at the repository root; run `pnpm format` to format all examples or `pnpm format:check` to check them.

## Metro

The Native Shell + Host example is in [`metro/native-shell`](metro/native-shell/README.md). Its four apps—Native Shell, Host, remote blue, and remote green—are independent workspace projects under `metro/native-shell/apps/`. The Turbo package, scripts, and Ruby version pin live in `metro/native-shell`; the root `turbo.json` holds Turbo's required workspace-level task configuration. Prettier remains at the repository root.
