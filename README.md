# DRS Documents — Report & Proposal PDF Generator

> Web panel that generates **DRS Advogados Associados**' client documents in a few clicks: monthly legal report, fee proposal and holding company presentation — all as A4 PDFs with the firm's visual identity.

![Editing panel with live preview](docs/preview.png)

> The app UI and generated documents are in Brazilian Portuguese, as they are sent to the firm's clients in Brazil.

## What it generates

| Document | Purpose | Highlights |
|---|---|---|
| **Monthly report** | Monthly accountability report of the legal work done for each client | Custom cover, activities automatically categorized, hours per activity and monthly total |
| **Fee proposal** | Commercial proposal for new services | Editable content boxes, 5 pricing modes (single amount, monthly fee, upfront discount, upfront + installments, discount + installments), automatic discount calculation, team section |
| **Holding presentation** | Material on structuring an asset-holding company | Explanation, benefits, project steps as a timeline, team and contact details |

## How it works

1. The side panel (`/`) edits the fields and shows a **live preview** of the document.
2. Clicking **Gerar PDF** sends the data to `POST /api/gerar-pdf`.
3. The API launches **Puppeteer** (headless Chrome) on the document's clean route — `/relatorio`, `/proposta` or `/holding` —, waits for fonts and images to load and prints it as A4.
4. The PDF is downloaded with a standardized name, e.g. `Relatorio-Empresa-Abril-2026.pdf` or `Proposta-DRS-Cliente-01-10-2026.pdf`.

## Tech stack

- **Next.js 14** (Pages Router) + **React 18** + **TypeScript**
- **Puppeteer 22** for PDF rendering
- **Tailwind CSS** + inline styles for fine-grained print control (`@page`, page breaks)

## Getting started

Requirements: Node.js 18+.

```bash
git clone https://github.com/ianleaao/drs-relatorio.git
cd drs-relatorio
npm install        # also downloads the Chromium used by Puppeteer
npm run dev
```

Open **http://localhost:3000**.

Other commands:

```bash
npm run typecheck  # type checking
npm run build      # production build
npm start          # production server
```

## Client files (not versioned)

Team photos and client logos are **kept out of the repository** for confidentiality. Add them locally to these folders — each one has a `README.md` describing the expected files:

| Folder | Contents | Used in |
|---|---|---|
| `public/clientes/` | Client logos (`.png`, `.jpg`, `.jpeg`) | Monthly report |
| `public/clientes-relatorio/` | Client logos | Proposal and holding |
| `public/pessoas/` | `daniel`, `douglas`, `laila` (`.jpg`/`.png`) | "Nossa Equipe" (team) section |

In the panel, type only the file name without the extension (e.g. `EMPRESA`). Without a logo, the cover shows the client's initials.

## Project structure

```
drs-relatorio/
├── pages/
│   ├── index.tsx            # Editing panel + preview (3 tabs)
│   ├── relatorio.tsx        # Clean report route (used by Puppeteer)
│   ├── proposta.tsx         # Clean proposal route
│   ├── holding.tsx          # Clean holding route
│   └── api/
│       ├── gerar-pdf.ts     # Generates the PDF with Puppeteer
│       └── foto-pessoa.ts   # Team photos as base64 for the preview
├── components/
│   ├── RelatorioContent.tsx
│   ├── PropostaContent.tsx
│   ├── HoldingContent.tsx
│   └── LogoDRS.tsx
├── public/                  # DRS logo, background, social icons (+ local client folders)
└── styles/globals.css
```

## Deployment notes

Puppeteer needs an environment with Chrome — it runs on your own server, a VPS or a container. On serverless platforms (Vercel, Netlify) switch to `puppeteer-core` + `@sparticuz/chromium`.

---

Built by [Ian Leão](https://github.com/ianleaao) for DRS Advogados Associados — Brasília, Brazil.
