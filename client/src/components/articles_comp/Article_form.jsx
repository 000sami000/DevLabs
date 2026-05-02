import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiClock, FiEdit3, FiEye, FiFileText, FiImage, FiEyeOff } from "react-icons/fi";
import { IoAddCircle } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { createArticle, updateArticle } from "../../redux_/actions/article";
import { useToast } from "../common/ToastProvider";
import Tags_input from "../Tags_input";
import Editorpro from "../text_editor/Editorpro";
import QuilEditor from "../text_editor/QuilEditor";
import ReadOnlyEditor from "../text_editor/ReadOnlyEditor";
import Toggle_button from "./Toggle_button";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const getAssetUrl = (file) => {
  if (file?.url) return file.url;
  if (!file?.destination || !file?.filename) return "";
  return `${API_BASE}/${file.destination}/${file.filename}`;
};

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const getPlainTextFromBlocks = (content) => {
  if (!content || typeof content !== "object" || !Array.isArray(content.blocks)) return "";
  return content.blocks
    .map((block) => {
      const data = block?.data || {};
      if (typeof data.text === "string") return stripHtml(data.text);
      if (typeof data.caption === "string") return data.caption;
      if (typeof data.quote === "string") return data.quote;
      if (Array.isArray(data.items))
        return data.items.map((item) => (typeof item === "string" ? item : stripHtml(item?.content || item?.text || ""))).join(" ");
      return Object.values(data).filter((v) => typeof v === "string").join(" ");
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

function Article_form({ user, Edit_articleobj, setEdit_articleobj, onArticleSaved }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const inputRef = useRef(null);
  const isLegacyContent = Boolean(Edit_articleobj && typeof Edit_articleobj?.article_content === "string");
  const [activeView, setActiveView] = useState("edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [Article_obj, setArticle_obj] = useState({
    title: Edit_articleobj?.title || "",
    description: Edit_articleobj?.description || "",
    tags: Edit_articleobj?.tags || [],
    isActive: Edit_articleobj?.isActive ?? true,
  });
  const [article_content, setarticle_content] = useState(Edit_articleobj?.article_content || null);
  const [File, setFile] = useState(null);
  const [imageUrl, setimageUrl] = useState(getAssetUrl(Edit_articleobj?.thumbnail) || null);

  useEffect(() => {
    setArticle_obj({
      title: Edit_articleobj?.title || "",
      description: Edit_articleobj?.description || "",
      tags: Edit_articleobj?.tags || [],
      isActive: Edit_articleobj?.isActive ?? true,
    });
    setarticle_content(Edit_articleobj?.article_content || null);
    setimageUrl(getAssetUrl(Edit_articleobj?.thumbnail) || null);
    setFile(null);
    setActiveView("edit");
  }, [Edit_articleobj]);

  const plainText = useMemo(() => {
    if (typeof article_content === "string") return stripHtml(article_content);
    return getPlainTextFromBlocks(article_content);
  }, [article_content]);

  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 220));

  const getter = (tags) => setArticle_obj((prev) => ({ ...prev, tags }));

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFile(file);
    setimageUrl(URL.createObjectURL(file));
  };

  const submit_handler = async (draftMode = false) => {
    if (!draftMode && (!Article_obj.title || !Article_obj.description || !article_content)) {
      toast.info("Missing fields", "Title, summary, and content are required to publish.");
      return;
    }
    const payload = {
      ...Article_obj,
      article_content,
      creator_id: user?._id,
      creator_username: user?.username,
      file: File,
      profile_img_: user?.profile_img_,
      isDraft: draftMode,
    };
    try {
      setIsSubmitting(true);
      toast.info(draftMode ? "Saving draft..." : Edit_articleobj ? "Updating..." : "Publishing...", draftMode ? "Storing article draft." : "Saving article.");
      if (Edit_articleobj) {
        const data = await dispatch(updateArticle(Edit_articleobj._id, payload));
        toast.success(draftMode ? "Draft saved" : "Article updated", draftMode ? "Draft changes saved." : "Your article changes are now live.");
        onArticleSaved?.(data, { draftMode, isUpdate: true });
        if (draftMode && setEdit_articleobj) setEdit_articleobj(data);
        return;
      }
      const data = await dispatch(createArticle(payload));
      if (draftMode) {
        toast.success("Draft saved", "You can continue editing this draft anytime.");
        if (setEdit_articleobj) setEdit_articleobj(data);
      } else {
        toast.success("Article created", "Your article was published.");
        setArticle_obj({ title: "", description: "", tags: [], isActive: true });
        setarticle_content(null);
        setFile(null);
        setimageUrl(null);
        setActiveView("edit");
        if (setEdit_articleobj) setEdit_articleobj(null);
      }
      onArticleSaved?.(data, { draftMode, isUpdate: false });
    } catch (error) {
      toast.error(Edit_articleobj ? "Update failed" : "Save failed", error?.response?.data?.message || "Unable to save article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileClick = () => inputRef.current?.click();

  return (
    <div className="theme-surface overflow-visible rounded-lg border">
      {/* Header with actions */}
      <div className="border-b border-[var(--app-border)] bg-[var(--app-bg-soft)] px-5 py-4 md:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              {Edit_articleobj ? "Edit article" : "Create new article"}
            </h3>
            <p className="theme-text-muted mt-1 text-sm">
              Write your content, add a cover image, and publish when ready.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="theme-soft-surface flex items-center gap-1 rounded-md p-1">
              <button
                type="button"
                onClick={() => setActiveView("edit")}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                  activeView === "edit"
                    ? "theme-button-primary"
                    : "theme-button-secondary hover:bg-[var(--app-bg-soft-strong)]"
                }`}
              >
                <FiEdit3 /> Write
              </button>
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                  activeView === "preview"
                    ? "theme-button-primary"
                    : "theme-button-secondary hover:bg-[var(--app-bg-soft-strong)]"
                }`}
              >
                <FiEye /> Preview
              </button>
            </div>
            <button
              type="button"
              onClick={() => submit_handler(true)}
              disabled={isSubmitting}
              className="theme-button-secondary inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save draft"}
            </button>
            <button
              type="button"
              onClick={() => submit_handler(false)}
              disabled={isSubmitting}
              className="theme-button-primary inline-flex items-center justify-center gap-2 rounded-md px-5 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? Edit_articleobj
                  ? "Updating..."
                  : "Publishing..."
                : Edit_articleobj
                ? "Update Article"
                : "Publish Article"}
              <IoAddCircle />
            </button>
          </div>
        </div>
      </div>

      {/* Main form area */}
      <div className="p-5 md:p-7">
        {/* Cover image upload - improved design */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-[var(--app-text)]">Cover image</label>
            {imageUrl && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setimageUrl(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="text-xs text-[var(--app-muted)] hover:text-[var(--app-danger)] transition"
              >
                Remove
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleFileClick}
            className="group relative flex min-h-[220px] w-full cursor-pointer items-end overflow-hidden rounded-xl border-2 border-dashed border-[var(--app-border)] bg-[var(--app-bg-soft)] transition hover:border-[var(--app-accent)] focus:outline-none"
            style={
              imageUrl
                ? {
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            {!imageUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--app-muted)]">
                <FiImage className="text-4xl" />
                <span className="text-sm font-medium">Click to upload a cover image</span>
                <span className="text-xs">PNG, JPG up to 5MB</span>
              </div>
            )}
            {imageUrl && (
              <div className="relative z-10 w-full bg-gradient-to-t from-black/60 to-transparent p-4 text-left text-white">
                <div className="text-sm font-semibold">Cover image set</div>
                <div className="text-xs opacity-80">Click or tap to replace</div>
              </div>
            )}
          </button>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
            ref={inputRef}
          />
        </div>

        {/* Title and description */}
        <div className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--app-text)]">Title</label>
            <textarea
              onChange={(e) => setArticle_obj((prev) => ({ ...prev, title: e.target.value }))}
              value={Article_obj.title}
              className="w-full resize-none rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-2xl font-semibold leading-tight outline-none transition focus:border-[var(--app-accent)] focus:ring-1 focus:ring-[var(--app-accent)]"
              placeholder="Give your article a compelling title"
              rows={2}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--app-text)]">Summary</label>
            <textarea
              onChange={(e) => setArticle_obj((prev) => ({ ...prev, description: e.target.value }))}
              value={Article_obj.description}
              className="w-full resize-none rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-base leading-relaxed outline-none transition focus:border-[var(--app-accent)] focus:ring-1 focus:ring-[var(--app-accent)]"
              placeholder="Write a short summary that captures the essence of your article"
              rows={3}
            />
          </div>
        </div>

        {/* Settings row - compact & well organized */}
        <div className="my-8 flex flex-wrap items-center gap-4 border-t border-[var(--app-border)] pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-md bg-[var(--app-bg-soft)] px-3 py-1.5 text-sm">
              <FiFileText className="theme-text-subtle" />
              <span>{wordCount} words</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-[var(--app-bg-soft)] px-3 py-1.5 text-sm">
              <FiClock className="theme-text-subtle" />
              <span>{readTime} min read</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-md bg-[var(--app-bg-soft)] px-3 py-1.5">
            <span className="text-sm font-medium">Visibility</span>
            <div className="flex items-center gap-2">
              {Article_obj.isActive ? <FiEye className="text-[var(--app-success)]" /> : <FiEyeOff className="text-[var(--app-muted)]" />}
              <Toggle_button Article_obj={Article_obj} setArticle_obj={setArticle_obj} toggle_val={Edit_articleobj?.isActive ?? true} />
            </div>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-3 rounded-md bg-[var(--app-bg-soft)] px-3 py-1.5">
            <span className="text-sm font-medium">Tags</span>
            <Tags_input Tags_arry={Article_obj.tags} getter={getter} />
          </div>
        </div>

        {/* Legacy content notice */}
        {isLegacyContent && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
            ℹ️ This article uses legacy HTML content. The classic editor is enabled.
          </div>
        )}

        {/* Editor / Preview area */}
        <div className="relative z-10 mt-2">
          {activeView === "edit" ? (
            <div className="relative overflow-visible rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] transition focus-within:ring-1 focus-within:ring-[var(--app-accent)]">
              <div className="border-b border-[var(--app-border)] bg-[var(--app-bg-soft)] px-4 py-2 text-xs font-medium text-[var(--app-muted)]">
                {isLegacyContent ? "Rich text editor (HTML)" : "Block editor"}
              </div>
              <div className="p-4 min-h-[500px]">
                {isLegacyContent ? (
                  <QuilEditor ContentHtml={article_content} setContentHtml={setarticle_content} />
                ) : (
                  <Editorpro ContentHtml={article_content} setContentHtml={setarticle_content} />
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)]">
              <div className="border-b border-[var(--app-border)] bg-[var(--app-bg-soft)] px-4 py-2 text-xs font-medium text-[var(--app-muted)]">
                Live preview
              </div>
              <div className="px-6 py-8 md:px-10 md:py-10">
                <div className="mb-8 border-b border-[var(--app-border)] pb-6">
                  <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                    {Article_obj.title || "Untitled article"}
                  </h1>
                  <p className="theme-text-muted mt-4 max-w-3xl text-base leading-relaxed">
                    {Article_obj.description || "Your summary will appear here."}
                  </p>
                </div>
                {typeof article_content === "string" ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: article_content || "<p>No content yet.</p>" }}
                    className="ql-editor"
                  />
                ) : (
                  <ReadOnlyEditor data={article_content} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Article_form;
