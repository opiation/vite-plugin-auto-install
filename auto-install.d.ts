/**
 * Return a Vite plugin that automatically invokes the configured package
 * manager to reinstall dependencies when any `package.json` files have
 * changed.
 *
 * @param {string} [packageManagerName]
 *   Defaults to `"npm"` regardless of any existing lock files
 * @returns {import("vite").Plugin<Installer>}
 */
export function autoInstall(packageManagerName?: string | undefined): import("vite").Plugin<Installer>;
export type ProcessOutput = {
    stderr: string;
    stdout: string;
};
export type Installer = {
    command: () => `${string} install --silent`;
    installPackages: () => Promise<ProcessOutput>;
};
