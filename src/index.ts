import { Server } from "http";
import app from "./app";
import config, { validateEnvConfig } from "./config";

export async function main() {
  validateEnvConfig();

  const server: Server = app.listen(config.port, () => {
    console.log(`Scaling Garbanzo server running on port ${config.port}`);
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.log("Server closed");
      });
    }
    process.exit(1);
  };

  const unexpectedErrorHandler = (error: unknown) => {
    console.log(error);
    exitHandler();
  };

  process.on("uncaughtException", unexpectedErrorHandler);
  process.on("unhandledRejection", unexpectedErrorHandler);

  process.on("SIGTERM", () => {
    console.log("SIGTERM received");
    if (server) {
      server.close();
    }
  });
}

main();
