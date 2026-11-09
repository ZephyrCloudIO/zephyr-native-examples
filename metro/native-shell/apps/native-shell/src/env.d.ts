declare module 'zephyr-build-info' {
  /** Set only in a Zephyr publish; empty in local dev (scripts/lib/zephyr-build.cjs). */
  const buildInfo: {applicationUid?: string; buildId?: string};
  export default buildInfo;
}
