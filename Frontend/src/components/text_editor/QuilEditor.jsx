
import React, { useState, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import interact from 'interactjs';

// Custom Image Handler
const imageHandler = function() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = () => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const range = this.quill.getSelection();
      const url = e.target.result;
      this.quill.insertEmbed(range.index, 'image', url);
    };
    reader.readAsDataURL(file);
  };
};

// Quill Toolbar Configuration
const modules = {
  
  toolbar: {
    container: [

      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      
      // [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3,  false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
    handlers: {
      image: imageHandler
    }
  }
};

const formats =  [
  'bold', 'italic', 'underline', 'strike',
  'blockquote', 'code-block',
  'link', 'image', 'video', 
  'list', 'bullet', 'check',
  'script', 'indent', 'direction',
  'size', 'header', 'color', 'background',
  'font', 'align'
]

// Custom CSS for Image Resizing
const customCSS = `
  .ql-editor img {
    max-width: 100%;
    height: auto;
    cursor: pointer;
    border: 1px solid #ddd;
    padding: 4px;
    background: #f9f9f9;
   
    -webkit-user-drag: none;
  }
    
.ql-editor{
height:200px;
  max-height:350px;
  overflow-y:scroll;

}
`;

const QuilEditor = ({ContentHtml,setContentHtml}) => {
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    // Function to make images resizable using Interact.js
    const makeImagesResizable = () => {
      interact('.ql-editor img').resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          start(event) {
            event.target.setAttribute('data-resizing', true);
            // Prevent Quill from interfering with resizing
            document.querySelector('.ql-editor').classList.add('disable-pointer-events');
          },
          move(event) {
            const { target, rect } = event;
            target.style.width = `${rect.width}px`;
            target.style.height = `${rect.height}px`;
          },
          end(event) {
            event.target.removeAttribute('data-resizing');
            // Re-enable Quill pointer events after resizing
            document.querySelector('.ql-editor').classList.remove('disable-pointer-events');
          }
        }
      })   .draggable({
        listeners: {
          start(event) {
            event.target.setAttribute('data-dragging', true);
            const style = window.getComputedStyle(event.target);
            const matrix = new WebKitCSSMatrix(style.transform);
            event.target.setAttribute('data-x', matrix.m41);
            event.target.setAttribute('data-y', matrix.m42);
          },
          move(event) {
            const { target, dx, dy } = event;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + dy;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          },
          end(event) {
            event.target.removeAttribute('data-dragging');
          }
        },
        inertia: true, // Add inertia to make dragging smoother
        modifiers: [
          interact.modifiers.restrict({
            restriction: 'parent', // Restrict movement within the editor
            endOnly: true,
            elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
          })
        ]
      });;

    };

    // Apply resizing functionality
 
    makeImagesResizable();
    // Cleanup function
    return () => {
      interact('.ql-editor img').unset();
    };
  
  }, [ContentHtml]);

 
  return (
    
    <div >
      <style>{customCSS}</style>
       <style>
        {`
          .disable-pointer-events {
            pointer-events: none;
          }
          
        `}
      </style>
       <ReactQuill
        value={ContentHtml}
        onChange={setContentHtml}
        modules={modules}
        formats={formats}
        theme="snow"
      />
    </div>

  );
};

export default QuilEditor;
