"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDropzone } from "react-dropzone";
import { ArrowDownTray, ArrowsUpDown, DocumentPlus, TrashIcon, XMarkIcon } from "./Icons";

interface PDFFile {
  id: string;
  name: string;
  size: number;
  data: ArrayBuffer;
  thumbnail?: string;
}

const FileItem = ({ 
  file, 
  index, 
  moveFile, 
  removeFile 
}: { 
  file: PDFFile; 
  index: number; 
  moveFile: (dragIndex: number, hoverIndex: number) => void;
  removeFile: (id: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: "FILE",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: "FILE",
    hover: (draggedItem: { index: number }, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) return;
      
      moveFile(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  const formattedSize = file.size < 1024 * 1024
    ? `${(file.size / 1024).toFixed(2)} KB`
    : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    
  return (
    <div 
      ref={ref}
      className={`p-3 mb-2 bg-white rounded-md shadow-sm border border-gray-200 flex items-center gap-3 ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex-shrink-0 w-10 h-12 bg-gray-100 rounded flex items-center justify-center">
        {file.thumbnail ? (
          <img src={file.thumbnail} alt="PDF thumbnail" className="w-full h-full object-cover rounded" />
        ) : (
          <DocumentPlus className="w-6 h-6 text-gray-400" />
        )}
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
        <p className="text-xs text-gray-500">{formattedSize}</p>
      </div>
      <div className="flex items-center gap-2">
        <button 
          className="text-gray-400 hover:text-gray-600 transition p-1"
          aria-label="Drag to reorder"
          title="Drag to reorder"
        >
          <ArrowsUpDown className="w-5 h-5" />
        </button>
        <button 
          onClick={() => removeFile(file.id)}
          className="text-gray-400 hover:text-red-500 transition p-1"
          aria-label="Remove file"
          title="Remove file"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default function PDFMerger() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [mergedFileName, setMergedFileName] = useState("merged-document.pdf");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processingMethod, setProcessingMethod] = useState<"client" | "server">("client");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showTooltip, setShowTooltip] = useState(true);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setErrorMsg(null);
    
    const pdfFiles = acceptedFiles.filter(file => file.type === "application/pdf");
    
    if (pdfFiles.length === 0) {
      setErrorMsg("Only PDF files are accepted.");
      return;
    }
    
    const newFiles = await Promise.all(
      pdfFiles.map(async (file) => {
        try {
          const data = await file.arrayBuffer();
          
          // Create thumbnail
          let thumbnail;
          try {
            const pdfDoc = await PDFDocument.load(data);
            if (pdfDoc.getPageCount() > 0) {
              const firstPage = pdfDoc.getPages()[0];
              const pngBytes = await pdfDoc.saveAsBase64({ pageIndices: [0] });
              thumbnail = `data:image/png;base64,${pngBytes}`;
            }
          } catch (error) {
            console.error("Error generating thumbnail:", error);
          }
          
          return {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            data,
            thumbnail
          };
        } catch (error) {
          console.error("Error reading file:", error);
          setErrorMsg(`Error reading file: ${file.name}`);
          return null;
        }
      })
    );
    
    setFiles(prev => [...prev, ...newFiles.filter(Boolean) as PDFFile[]]);
    
    // Hide tooltip after files are added
    setShowTooltip(false);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (rejections) => {
      const errors = rejections.map(rejection => {
        if (rejection.errors[0].code === 'file-too-large') {
          return `${rejection.file.name} exceeds the 10MB size limit.`;
        }
        return `${rejection.file.name}: ${rejection.errors[0].message}`;
      });
      setErrorMsg(errors.join(' '));
    }
  });
  
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };
  
  const moveFile = useCallback((dragIndex: number, hoverIndex: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const draggedFile = newFiles[dragIndex];
      newFiles.splice(dragIndex, 1);
      newFiles.splice(hoverIndex, 0, draggedFile);
      return newFiles;
    });
  }, []);
  
  const clearFiles = () => {
    setFiles([]);
    setErrorMsg(null);
  };
  
  const mergePDFsClient = async () => {
    if (files.length === 0) {
      setErrorMsg("Please add at least one PDF file to merge.");
      return;
    }
    
    setIsProcessing(true);
    setErrorMsg(null);
    
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        try {
          const pdf = await PDFDocument.load(file.data);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach(page => mergedPdf.addPage(page));
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          setErrorMsg(`Error processing file: ${file.name}`);
          setIsProcessing(false);
          return;
        }
      }
      
      const mergedPdfBytes = await mergedPdf.save();
      
      // Create download link
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = mergedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error merging PDFs:", error);
      setErrorMsg("An error occurred while merging the PDFs. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const mergePDFsServer = async () => {
    if (files.length === 0) {
      setErrorMsg("Please add at least one PDF file to merge.");
      return;
    }
    
    setIsProcessing(true);
    setErrorMsg(null);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      
      // Add each file to the form data
      files.forEach(file => {
        const blob = new Blob([file.data], { type: 'application/pdf' });
        formData.append('files', blob, file.name);
      });
      
      // Add the desired file name
      formData.append('fileName', mergedFileName);
      
      // Send request to server
      const response = await fetch('/api/merge-pdfs', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = mergedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error merging PDFs:', error);
      setErrorMsg(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleMerge = () => {
    if (processingMethod === 'client') {
      mergePDFsClient();
    } else {
      mergePDFsServer();
    }
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white rounded-lg shadow-md p-6">
        {showTooltip && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-md mb-6 relative">
            <button 
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-blue-500 hover:text-blue-700"
              aria-label="Close tooltip"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h3 className="font-medium mb-1">How to use this PDF merger:</h3>
            <ol className="list-decimal pl-5 text-sm space-y-1">
              <li>Drag and drop your PDF files or click to browse</li>
              <li>Arrange the files in the order you want them merged</li>
              <li>Name your output file</li>
              <li>Click "Merge and Download" to get your combined PDF</li>
            </ol>
          </div>
        )}
        
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          <DocumentPlus className="w-12 h-12 mx-auto text-blue-500" />
          <p className="mt-2 text-lg font-medium">Drag & drop PDF files here</p>
          <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
          <p className="text-xs text-gray-400 mt-3">Maximum file size: 10MB per PDF</p>
        </div>
        
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {errorMsg}
          </div>
        )}
        
        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Files to merge ({files.length})</h3>
              <button 
                onClick={clearFiles}
                className="text-sm text-gray-500 hover:text-red-500 transition"
              >
                Clear all
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto pr-2">
              {files.map((file, index) => (
                <FileItem 
                  key={file.id} 
                  file={file} 
                  index={index} 
                  moveFile={moveFile} 
                  removeFile={removeFile}
                />
              ))}
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="merged-filename" className="block text-sm font-medium text-gray-700 mb-1">
                  Output file name
                </label>
                <input
                  type="text"
                  id="merged-filename"
                  value={mergedFileName}
                  onChange={(e) => setMergedFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processing method
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-blue-600"
                      name="processing-method"
                      value="client"
                      checked={processingMethod === 'client'}
                      onChange={() => setProcessingMethod('client')}
                    />
                    <span className="ml-2 text-sm text-gray-700">Client-side (browser)</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-blue-600"
                      name="processing-method"
                      value="server"
                      checked={processingMethod === 'server'}
                      onChange={() => setProcessingMethod('server')}
                    />
                    <span className="ml-2 text-sm text-gray-700">Server-side</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {processingMethod === 'client' 
                    ? 'Client-side processing keeps files in your browser. Faster for smaller files.' 
                    : 'Server-side processing is better for larger files or complex merges.'}
                </p>
              </div>
              
              <button
                onClick={handleMerge}
                disabled={isProcessing || files.length === 0}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-white font-medium transition ${
                  isProcessing || files.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownTray className="w-5 h-5" />
                    <span>Merge and Download</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your files are processed securely. They're only shared with our server if you choose server-side processing.</p>
          <p className="mt-1">For larger files, the process may take a few moments.</p>
        </div>
      </div>
    </DndProvider>
  );
} 