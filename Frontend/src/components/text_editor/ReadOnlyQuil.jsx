import React, { useEffect, useRef } from 'react';
// import Quill from 'quill';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css'; // Import Quill's CSS
import './quil_style.css'
const ReadOnlyQuillEditor = ({ content }) => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    // Initialize Quill editor in read-only mode
    // editorRef.current = new Quill(quillRef.current, {
    //   theme: 'snow',
    //   readOnly: true,
    //   modules: {
    //     toolbar: false, // Hide the toolbar
    //   },
    // });
    
    // if (content) {
    //   editorRef.current.clipboard.dangerouslyPasteHTML(content); 
    // }
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.clipboard.dangerouslyPasteHTML(content); // Use dangerouslyPasteHTML to ensure HTML content is set correctly
    }
  }, [content]);

  return <div className="custom-quill-container w-full ">
  <ReactQuill
    ref={quillRef}
    readOnly={true}
    theme="snow"
    modules={{ toolbar: false }} // No toolbar in read-only mode
    formats={['image']} // Add other formats if needed
  />
</div>;
};

export default ReadOnlyQuillEditor;