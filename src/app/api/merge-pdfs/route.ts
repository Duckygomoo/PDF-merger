import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

// Maximum file size (10 MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const fileName = formData.get('fileName') as string || 'merged-document.pdf';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Check file sizes and types
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds maximum size of 10MB` },
          { status: 400 }
        );
      }

      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: `File ${file.name} is not a PDF` },
          { status: 400 }
        );
      }
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    
    // Process each file
    for (const file of files) {
      const fileArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileArrayBuffer);
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }
    
    // Save the merged document
    const mergedPdfBytes = await mergedPdf.save();
    
    // Return the merged PDF
    return new NextResponse(mergedPdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error merging PDFs:", error);
    return NextResponse.json(
      { error: "An error occurred while merging the PDFs" },
      { status: 500 }
    );
  }
} 