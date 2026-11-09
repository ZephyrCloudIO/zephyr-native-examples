'use strict';
function isZephyrBuild(env = process.env) {
  return env.ZEPHYR_BUILD === '1';
}
function zephyrTarget(env = process.env) {
  return env.ZEPHYR_TARGET === 'android' ? 'android' : 'ios';
}
module.exports = {isZephyrBuild, zephyrTarget};
