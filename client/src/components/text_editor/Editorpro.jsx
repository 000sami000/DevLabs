import EditorJS from "@editorjs/editorjs";
import React, { useEffect, useId, useRef } from "react";
import ImageTool from "@editorjs/image";
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
import InlineCode from "@editorjs/inline-code";
import { imgUpload } from "../../api";
import "./text_color.css";
import "./temp.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const getInitialData = (content) => {
  if (content && typeof content === "object" && Array.isArray(content.blocks)) {
    return content;
  }

  return {
    blocks: [
      {
        type: "paragraph",
        data: {
          text: "",
        },
      },
    ],
  };
};

function Editorpro({ ContentHtml, setContentHtml }) {
  const editorInstance = useRef(null);
  const holderId = useId().replace(/:/g, "-");
  const lastRenderedData = useRef(JSON.stringify(getInitialData(ContentHtml)));

  useEffect(() => {
    let isMounted = true;

    const initializeEditor = async () => {
      editorInstance.current = new EditorJS({
        holder: holderId,
        data: getInitialData(ContentHtml),
        autofocus: true,
        placeholder: "Type / to choose a block, or just start writing.",
        async onChange() {
          if (!editorInstance.current || !isMounted) {
            return;
          }

          const savedData = await editorInstance.current.save();
          lastRenderedData.current = JSON.stringify(savedData);
          setContentHtml(savedData);
        },
        tools: {
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
            tunes: ["alignment"],
            config: {
              placeholder: "Start writing your story...",
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file) {
                  const formData = new FormData();
                  formData.append("file", file);

                  try {
                    const response = await imgUpload(formData);
                    const { filePath } = response.data;

                    return {
                      success: 1,
                      file: {
                        url: filePath,
                      },
                    };
                  } catch (error) {
                    console.error("Error uploading image:", error);
                    return {
                      success: 0,
                      message: error.message,
                    };
                  }
                },
              },
            },
          },
          header: {
            class: Header,
            inlineToolbar: ["bold", "italic", "marker", "link"],
            config: {
              placeholder: "Heading",
              levels: [1, 2, 3],
              defaultLevel: 2,
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
            shortcut: "CMD+SHIFT+O",
            config: {
              quotePlaceholder: "Pull quote",
              captionPlaceholder: "Source",
            },
          },
          inlineCode: {
            class: InlineCode,
            shortcut: "CMD+SHIFT+M",
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

      await editorInstance.current.isReady;
    };

    initializeEditor();

    return () => {
      isMounted = false;
      if (editorInstance.current && typeof editorInstance.current.destroy === "function") {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, [holderId, setContentHtml]);

  useEffect(() => {
    const nextData = JSON.stringify(getInitialData(ContentHtml));

    if (!editorInstance.current || lastRenderedData.current === nextData) {
      return;
    }

    const syncEditor = async () => {
      await editorInstance.current.isReady;
      await editorInstance.current.render(JSON.parse(nextData));
      lastRenderedData.current = nextData;
    };

    syncEditor();
  }, [ContentHtml]);

  return (
    <div className="editorpro-shell">
      <div id={holderId} className="editorpro-holder" />
    </div>
  );
}

export default Editorpro;


