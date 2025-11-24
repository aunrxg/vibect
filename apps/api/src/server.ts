import "dotenv/config";
import { buildApp } from "./app";
import { config } from "./config";

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: config.port,
      host: config.host,
    });

    app.log.info(`server listening on http://${config.host}:${config.port}`);
    // app.log.info(`
    //   websocket available at ws://${config.host}:${config.port}/ws
    // `);
    process.on("SIGINT", () => {
      console.log("Shutting down...");
      app.close().then(() => process.exit(0));
    });
    process.on("SIGTERM", () => {
      app.close().then(() => process.exit(0));
    });
  } catch (error) {
    console.error("Failed to start server: ", error);
    process.exit(1);
  }
}

start();
