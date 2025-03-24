# PDF Merger

A modern, professional web application for merging multiple PDF files into a single document. Built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- **Modern UI**: Clean, responsive design that works seamlessly on desktops, tablets, and mobile devices
- **Drag-and-Drop Interface**: Easily add PDFs via drag-and-drop or file selector
- **File Management**: 
  - Preview thumbnails of uploaded PDFs
  - Reorder files with drag-and-drop functionality
  - Remove individual files
  - Clear all files at once
- **Processing Options**:
  - Client-side processing: PDF merging happens entirely in your browser, files never leave your device
  - Server-side processing: Offload processing to the server for larger files or complex merges
- **Security**:
  - No PDF data is stored on the server
  - All temporary files are automatically deleted after processing
  - Client-side option keeps all files completely local to the user's browser
- **Accessibility**: Designed to be keyboard navigable and screen reader friendly
- **Error Handling**: Proper validation for file types, sizes, and processing errors

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pdf-merger.git
   cd pdf-merger
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Drag and drop PDF files onto the upload area, or click to browse and select files
2. Rearrange files by dragging if needed
3. Enter a name for the merged output file
4. Select processing method (client-side or server-side)
5. Click "Merge and Download" button
6. Save the merged PDF to your device

## Deployment

The application can be deployed to any Node.js-compatible hosting service like Vercel, Netlify, or AWS:

```
npm run build
# or
yarn build
```

For detailed deployment instructions specific to different platforms, please refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework with server-side rendering
- [React](https://reactjs.org/) - Frontend library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [pdf-lib](https://pdf-lib.js.org/) - PDF processing library
- [react-dnd](https://react-dnd.github.io/react-dnd/) - Drag and drop for React
- [react-dropzone](https://react-dropzone.js.org/) - File upload component

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Heroicons](https://heroicons.com/) - SVG icons used in the UI
- [Next.js team](https://nextjs.org/about) - For creating an amazing framework