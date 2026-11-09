/**
 * The Native Shell's Zephyr settings, read by Zephyr builds only (`ZEPHYR_BUILD=1`).
 *
 * - `org`, `project`: explicit, so builds don't depend on the git origin naming the GitHub
 *   repository. Branch and commit still come from git.
 * - `remoteDependencies`: the Host the binary is built against, from the environment for the
 *   platform being built. Zephyr replaces `${target}` with `ios` or `android`; plain quotes, not a
 *   template literal.
 * - `runtimeManifest`: installed shells follow the shell's own `demo-ios`/`demo-android`
 *   environment. Each launch applies the `zephyr-manifest.json` the previous launch fetched from
 *   it, so a `host` remote override or `ZE_PUBLIC_*` value set on that environment in the Zephyr
 *   dashboard reaches the shell without a rebuild. The build fails while that environment has no
 *   shell version yet: build once per platform with this field removed, then put it back.
 */
module.exports = {
  org: 'zephyrcloudio',
  project: 'zephyr-native-examples',
  remoteDependencies: {
    host: 'host@demo-${target}',
  },
  runtimeManifest: '@demo-${target}',
};
