import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"] || "5000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Wake a suspended serverless database now, so the first user request does not
  // pay the cold-start delay. Failure here is only logged; requests still retry.
  const started = Date.now();
  pool.query("select 1")
    .then(() => logger.info({ ms: Date.now() - started }, "Database ready"))
    .catch((dbErr: Error) => logger.warn({ err: dbErr.message }, "Database warm-up failed"));
});
