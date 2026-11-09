---
name: Legacy listing import policy
description: Preserve guest and account-local data when sharing listings through the server.
---

Importing old local listings must be an explicit, per-listing publishing choice, not a side effect of signing in. Preserve the source data even after a successful import.

**Why:** Local guest data is not proof of account ownership, and publishing makes its contact number and location visible to everyone. The product requirement explicitly calls for user-selected import without data loss.

**How to apply:** Keep failed imports and drafts recoverable, use stable identities for retries, and never bulk-publish local content or erase guest storage during sign-in.
