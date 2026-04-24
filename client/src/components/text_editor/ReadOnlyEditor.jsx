import React, { useEffect, useId, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import Warning from "@editorjs/warning";
import CodeTool from "@editorjs/code";
import LinkTool from "@editorjs/link";
import CheckList from "@editorjs/checklist";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import Raw from "@editorjs/raw";
import AlignmentTuneTool from "editorjs-text-alignment-blocktune";
import InlineCode from '@editorjs/inline-code';
import "./text_color.css";
import "./temp.css";

const getData = (data) => {
  if (data && typeof data === 'object' && Array.isArray(data.blocks)) {
    return data;
  }

  return {
    blocks: [],
  };
};

const ReadOnlyEditor = ({ data }) => {
  const ejInstance = useRef(null);
  const editorContainerId = useId().replace(/:/g, '-');

  useEffect(() => {
    ejInstance.current = new EditorJS({
      holder: editorContainerId,
      data: getData(data),
      readOnly: true,
      tools: {
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
          inlineToolbar: ['bold', 'italic', 'marker', 'link'],
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
          inlineToolbar: true,
        },
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
            captionPlaceholder: "Quote's author",
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
      },
    });

    return () => {
      if (ejInstance.current) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, [data, editorContainerId]);

  return (
    <div className="editorpro-preview-shell">
      <div id={editorContainerId} className="editorpro-preview-holder" />
    </div>
  );
};

export default ReadOnlyEditor;

