import serverless from "serverless-http";
import { connectLambda } from "@netlify/blobs";
import app from "./app";
import { useNetlifyBlobs } from "./lib/listingStorage";

// Netlify Function entry: the same Express app, called per request instead of listening on a port.
useNetlifyBlobs();
const run = serverless(app, { binary: ["image/*"] });
const FUNCTION_PREFIX = "/.netlify/functions/api";

type LambdaEvent = Parameters<typeof connectLambda>[0] & { path?: string };

export const handler = async (event: LambdaEvent, context: object) => {
  // Netlify passes the Blobs credentials with every request (absent when run outside Netlify).
  if (event.blobs) connectLambda(event);
  // netlify.toml rewrites /api/* here; make sure Express always sees the public /api/... path.
  if (event.path?.startsWith(FUNCTION_PREFIX)) event.path = `/api${event.path.slice(FUNCTION_PREFIX.length)}`;
  return run(event, context);
};
