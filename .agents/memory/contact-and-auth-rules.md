---
name: Contact and authentication rules
description: User-selected login methods and independent seller contact numbers.
---

Use email and Google for account sign-in. The user selected “Email va Google orqali”; do not introduce phone/SMS sign-in as a substitute.

**Why:** The user explicitly chose these account access methods.

**How to apply:** Keep account access separate from the contact phone entered in a profile or listing.

Phone and other numeric-entry fields must reject letters, including pasted text. Each submitted listing requires its own seller telephone number. Its phone action must open the device dialer using that listing's number.

**Why:** The user requested numeric-only entry and an individual number for the person who posted each listing.

**How to apply:** Store a contact-number snapshot with the listing. Changing the profile phone must not silently change existing listing contacts. Never substitute the viewer's phone for a missing seller number or invent contacts for sample listings.

Google-provider enablement and permission for the application's browser domain are separate settings.

**Why:** The supplied Firebase project had Google enabled but allowed only localhost and Firebase hosting domains. A valid public SDK configuration alone did not authorize either Replit Preview domain.

**How to apply:** Inspect the provider's current authorized-domain list and the actual browser hostname. Verify Preview and the real published domain separately; reaching a Google chooser does not prove a completed sign-in.
