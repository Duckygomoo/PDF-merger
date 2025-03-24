import PDFMerger from "./components/PDFMerger";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gray-50">
      <header className="w-full max-w-5xl mb-8 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-600">
          PDF Merger
        </h1>
        <p className="text-center text-gray-600 mt-2">
          Combine multiple PDF files into a single document in seconds
        </p>
      </header>

      <section className="w-full max-w-5xl">
        <PDFMerger />
      </section>

      <footer className="w-full max-w-5xl mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>PDF Merger © {new Date().getFullYear()}</p>
        <p className="mt-1">All PDF processing is done securely on your browser. Your files never leave your device.</p>
      </footer>
    </main>
  );
}
