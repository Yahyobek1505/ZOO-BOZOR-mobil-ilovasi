import { Storage } from "@google-cloud/storage";

// Replit sidecar authentication; no service-account credentials are stored here.
const endpoint = "http://127.0.0.1:1106";
const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${endpoint}/token`,
    type: "external_account",
    credential_source: {
      url: `${endpoint}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function location(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("Invalid image ID");
  const dir = process.env.PRIVATE_OBJECT_DIR;
  if (!dir) throw new Error("App Storage is not configured");
  const [bucketName, ...parts] = dir.replace(/^\/|\/$/g, "").split("/");
  return { bucketName, objectName: `${parts.join("/")}/listing-images/${id}` };
}

export function imageFile(id: string) {
  const { bucketName, objectName } = location(id);
  return storage.bucket(bucketName).file(objectName);
}

export async function imageUploadUrl(id: string) {
  const { bucketName, objectName } = location(id);
  const response = await fetch(`${endpoint}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName, object_name: objectName, method: "PUT",
      expires_at: new Date(Date.now() + 900_000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error("Image upload URL could not be created");
  const result = await response.json() as { signed_url?: string };
  if (!result.signed_url) throw new Error("Image upload URL is missing");
  return result.signed_url;
}
