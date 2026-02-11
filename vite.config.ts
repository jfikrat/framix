import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { spawn, type ChildProcess } from "child_process";

function renderServerPlugin(): Plugin {
  let child: ChildProcess | null = null;

  async function isServerUp(): Promise<boolean> {
    try {
      const res = await fetch("http://localhost:3001/health");
      return res.ok;
    } catch {
      return false;
    }
  }

  async function waitForServer(timeoutMs: number): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (await isServerUp()) return true;
      await new Promise((r) => setTimeout(r, 100));
    }
    return false;
  }

  return {
    name: "render-server-launcher",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "";

        // Only intercept render server routes
        if (!url.startsWith("/api/") && !url.startsWith("/ws") && !url.startsWith("/output/")) {
          return next();
        }

        // Server already running
        if (await isServerUp()) return next();

        // Spawn render server if not already spawning
        if (!child) {
          console.log("[render-server] Starting render server...");
          child = spawn("bun", ["server.ts"], {
            cwd: process.cwd(),
            stdio: ["ignore", "inherit", "inherit"],
          });

          child.on("exit", (code) => {
            console.log(`[render-server] Server exited (code ${code})`);
            child = null;
          });
        }

        // Wait for health check
        const ready = await waitForServer(10_000);
        if (!ready) {
          res.statusCode = 503;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Render server failed to start" }));
          return;
        }

        console.log("[render-server] Server ready");
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), renderServerPlugin()],
  server: {
    port: 4200,
    strictPort: true,
    open: false,
    proxy: {
      "/api": "http://localhost:3001",
      "/output": "http://localhost:3001",
      "/ws": {
        target: "ws://localhost:3001",
        ws: true,
      },
    },
  },
});
