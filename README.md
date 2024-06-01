# vite-plugin-auto-install

```ts
import { defineConfig } from "vite";
import { autoInstall } from "vite-plugin-auto-install";

export default defineConfig({
  plugins: [
    // Automatically run `bun install` any time a `package.json` changes
    autoInstall("bun"),
  ],
});
```
