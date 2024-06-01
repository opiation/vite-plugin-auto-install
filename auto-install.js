import Chalk from "chalk";
import Path from "node:path";

const name = "vite-plugin-autoinstaller";

/**
 * Return a Vite plugin that automatically invokes the configured package
 * manager to reinstall dependencies when any `package.json` files have
 * changed.
 *
 * @param {string} [packageManagerName]
 *   Defaults to `"npm"` regardless of any existing lock files
 * @returns {import("vite").Plugin<Installer>}
 */
export function autoInstall(packageManagerName) {
  const api = installer(packageManagerName);

  return {
    api,
    name,
    configureServer(server) {
      const { logger } = server.config;

      /**
       * @param {string} message
       */
      function log(message) {
        if (message.trim().length === 0) return;

        const timestamp = new Date().toLocaleTimeString(undefined, {
          hour: "2-digit",
          hour12: true,
          minute: "2-digit",
          second: "2-digit",
        });
        const label = `[${name}]`;

        logger.info(
          [Chalk.grey(timestamp), Chalk.yellow.bold(label), message].join(" ")
        );
      }

      server.watcher.on("change", async (path) => {
        if (Path.basename(path) !== "package.json") return;

        try {
          const output = await api.installPackages();
          const updateMessage = `Dependencies installed after changes to ${Path.basename(
            path
          )}`;

          if (output.stderr.trim()) log(output.stderr);
          if (output.stderr.trim()) log(output.stdout);

          log(updateMessage);
        } catch (error) {
          logger.warn(asError(error).message);
        }
      });

      const listeningMessage = `  ${Chalk.grey("➜")}  ${Chalk.yellow.dim(
        name + ":"
      )} ${Chalk.grey("Auto-installing on changes to package.json files...")}`;

      server.httpServer?.once("listening", () =>
        setTimeout(() => logger.info(listeningMessage), 20)
      );
    },
    version: "1.0.0",
  };
}

/**
 * @typedef {Object} ProcessOutput
 * @property {string} stderr
 * @property {string} stdout
 */

/**
 * Return the given `error` if it is an {@link Error} or otherwise stringify
 * the given `error` and use it as the `message` of a new {@link Error}.
 *
 * @param {unknown} error
 * @returns {Error}
 */
function asError(error) {
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * @param {string} [packageManager]
 * @returns {Readonly<Installer>}
 */
function installer(packageManager = "npm") {
  /** @type {Readonly<Installer>} */
  const self = Object.freeze({
    command() {
      return `${packageManager} install --silent`;
    },

    /**
     * @param {string} [packageJsonPath]
     *   Defaults to `"package.json"`
     * @returns {Promise<ProcessOutput>}
     */
    async installPackages(packageJsonPath = "package.json") {
      const ChildProcess = await import("node:child_process");

      return new Promise((resolve, reject) => {
        ChildProcess.exec(self.command(), (error, stdout, stderr) => {
          if (error) {
            return reject(error);
          }

          return resolve({ stderr, stdout });
        });
      });
    },
  });

  return self;
}

/**
 * @typedef {Object} Installer
 * @property {() => `${string} install --silent`} command
 * @property {() => Promise<ProcessOutput>} installPackages
 */
