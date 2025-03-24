# PDF Merger

A web application for merging multiple PDF files into a single document. Built with Next.js, React, TypeScript, and Tailwind CSS.

## What It Does

- Clean, responsive interface for desktops, tablets, and mobile devices
- Drag-and-drop to add PDFs or use the file selector
- Reorder files easily with drag-and-drop
- Choose between browser-based or server processing
- No data storage - your files never leave your device with client-side processing
- Preview thumbnails of your PDF files before merging

## Running Locally

Prerequisites: Node.js 16+

```bash
# Clone the repo
git clone https://github.com/Duckygomoo/pdf-merger.git
cd pdf-merger

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## How To Use

1. Drop your PDF files or click to select them
2. Arrange them in the desired order
3. Name your output file
4. Choose processing method
5. Click "Merge and Download"

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- pdf-lib (PDF processing)
- pdf.js (PDF rendering)
- react-dnd (drag-and-drop)
- react-dropzone (file uploads)

## Deployment

Built to deploy easily on Vercel or any Node.js hosting:

```bash
npm run build
```

## License

MIT