import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
// import ImageTool from '@editorjs/image';
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import Warning from "@editorjs/warning";
// import Code from '@editorjs/code'
import CodeTool from "@editorjs/code";
import LinkTool from "@editorjs/link";
import CheckList from "@editorjs/checklist";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import Raw from "@editorjs/raw";
import AlignmentTuneTool from "editorjs-text-alignment-blocktune";
import InlineCode from '@editorjs/inline-code';
import Hyperlink from 'editorjs-hyperlink';
// import RedTextInlineTool from "./inlinetool";
// import "./inlinetool.css"
import TextColorPlugin  from 'editorjs-text-color-plugin';
import "./text_color.css"
import "./temp.css"
const ReadOnlyEditor = ({ data }) => {
  const ejInstance = useRef(null);
  const editorContainer = useRef(null);

  useEffect(() => {
    if (!editorContainer.current) return;

    ejInstance.current = new EditorJS({
      holder: editorContainer.current,
      data: data,
      readOnly: true,
      tools: {
        // Color: {
        //   class: TextColorPlugin , // if load from CDN, please try: window.ColorPlugin
        //   config: {
        //      colorCollections: ['#EC7878','#9C27B0','#673AB7','#3F51B5','#0070FF','#03A9F4','#00BCD4','#4CAF50','#8BC34A','#CDDC39', '#FFF'],
        //      defaultColor: '#FF1300',
        //      type: 'text', 
        //      customPicker: true // add a button to allow selecting any colour  
        //   }     
        // },
    //     hyperlink: {
    //   class: Hyperlink,
    //   config: {
    //     shortcut: 'CMD+L',
    //     target: '_blank',
    //     rel: 'nofollow',
    //     availableTargets: ['_blank', '_self'],
    //     availableRels: ['author', 'noreferrer'],
    //     validate: false,
        
    //   }
    // },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
          tunes: ["alignment"],
          config: {
            placeholder: "Start typing your text here...",
          },
        },

        image: Image,

        header: {
          class: Header,
          inlineToolbar: true,
          inlineToolbar: ['bold', 'italic', 'marker','link'],
          config: {
            placeholder: "Enter a header",
            levels: [1, 2, 3],
            defaultLevel: 1,
          },
          tunes: ["alignment"],
        },

        embed: {
          class: Embed,
          inlineToolbar: true,
          config: {
            services: {
              youtube: true,
              
            },
          },
        },
        list: {
          class: List,
          inlineToolbar: true, // Enable inline toolbar for List tool
        },
    //     Marker: {
    //   class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
    //   config: {
    //      defaultColor: '#FFBF00',
    //      type: 'marker',
    //      icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`
    //     }       
    // },
        table: Table,
        warning: Warning,
        code: CodeTool,
        linkTool: LinkTool,
        quote: {
          class: Quote,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+O',
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote\'s author',
          },
        },
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+M',
        },
        marker: Marker,
        checklist: CheckList,
        raw: Raw,
        alignment: {
          class: AlignmentTuneTool,
          config: {
            default: "left",
            alignments: ["left", "center", "right", "justify"],
          },
        },
        // redText: {
        //   class: RedTextInlineTool,
        //   shortcut: 'CMD+SHIFT+R',
        // },
      },
    
    });

    return () => {
      ejInstance.current.destroy();
      ejInstance.current = null;
    };
  }, [data]);

  return (
    <div>
      <div id="editorjs" ref={editorContainer} />
    </div>
  );
};

export default ReadOnlyEditor;