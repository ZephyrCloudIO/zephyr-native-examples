/**
 * The Host's Zephyr settings, read by Zephyr builds only (`ZEPHYR_BUILD=1`).
 *
 * - `org`, `project`: explicit, so builds don't depend on the git origin naming the GitHub
 *   repository. Branch and commit still come from git.
 * - `remoteDependencies`: the remotes the Host is built against, from the environment for the
 *   platform being built. Zephyr replaces `${target}` with `ios` or `android`; plain quotes, not a
 *   template literal.
 */
module.exports = {
  org: 'zephyrcloudio',
  project: 'zephyr-native-examples',
  remoteDependencies: {
    remote_blue: 'remote_blue@demo-${target}',
    remote_green: 'remote_green@demo-${target}',
  },
};
