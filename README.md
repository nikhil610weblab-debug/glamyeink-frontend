# GlaymeInk

A PDF agreement editor and e-signature workflow: upload a PDF, place text/signature/date/checkbox/dropdown/image fields, collect a signature (draw, type, or upload), export a real flattened PDF, and send it by email through a backend SMTP service.

## Structure

- `src/` — React + TypeScript + Vite frontend (editor, dashboard, preview, signing)
- `backend/` — Node/Express API that owns SMTP credentials and sends the signed agreement by email

## Run the frontend

```bash
npm install
cp .env.example .env      # points at the backend, defaults to localhost:4000
npm run dev
```

## Run the backend (required for "Send")

```bash
cd backend
npm install
cp .env.example .env      # fill in real SMTP_* credentials
npm run dev
```

Without the backend running, everything except "Send" works fully client-side (upload, edit, sign, export, autosave to IndexedDB).

## Notable implementation choices

- **Coordinates are stored as percentages** of page width/height, not pixels, so fields stay correctly placed across zoom levels, window resizes, and PDF export.
- **Export uses `pdf-lib`** to draw real text/images/signatures into the original PDF — not a screenshot.
- **Every sent PDF is persisted server-side** in `backend/storage/pdfs/` (not just IndexedDB) and served publicly at `GET /files/<file>.pdf`. Only that `pdfs` subfolder is exposed statically — the SQLite database file is never served.
- **Agreement records live in SQLite** (`backend/storage/db.sqlite`, via `better-sqlite3`) with sender, recipient, status, PDF URL, and timestamps — queried by `GET /api/agreements` (search/filter/sort/paginate) for the admin panel at `/admin`.
- **Documents still autosave to IndexedDB** in the browser for in-progress editing/drafts; the SQLite DB is the source of truth once an agreement is actually sent.
- **SMTP credentials never touch the frontend** — the browser posts to `POST /api/documents/send`, and only the Express backend talks to the SMTP server via Nodemailer. The PDF is stored and the agreement recorded even if the email itself fails (status `failed`), so nothing is silently lost.
- The toolbar's "Text" tool covers both freeform text and styled text fields (font, weight, italic, underline, alignment, color) in one field type, to keep the model consistent — see `src/types/document.ts`.

## Admin panel

Visit `/admin` (linked from the dashboard header) to see every sent agreement: search, status filter, date range, sender/recipient filters, sortable columns, and pagination — all backed by `GET /api/agreements`.

## Known scope limits (v1)

- Field snapping is percentage-based, not a visual alignment-guide system.
- The dashboard's "Download PDF" row action is disabled by design (use Preview → Download, which is fully wired) — isolating it rather than shipping a dead button.
- No multi-recipient signing order/workflow yet — one recipient per send.
