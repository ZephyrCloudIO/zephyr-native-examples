# Zephyr examples

This repository is a pnpm workspace. Shared formatting is configured at the repository root; run `pnpm format` to format all examples or `pnpm format:check` to check them.

## Metro

The Native Shell + Host example is in [`metro/native-shell`](metro/native-shell/README.md). Its four apps—Native Shell, Host, remote blue, and remote green—are independent workspace projects under `metro/native-shell/apps/`. The Turbo package, scripts, and Ruby version pin live in `metro/native-shell`; the root `turbo.json` holds Turbo's required workspace-level task configuration. Prettier remains at the repository root.
