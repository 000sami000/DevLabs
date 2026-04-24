import React, { useCallback, useState } from "react";
import { FiTag } from "react-icons/fi";
import { IoAddCircle } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { createProblem } from "../../redux_/actions/problem";
import { useToast } from "../common/ToastProvider";
import Tags_input from "../Tags_input";
import QuilEditor from "../text_editor/QuilEditor";

function Problem_form({ user }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ContentHtml, setContentHtml] = useState("");
  const [Problem_obj, setProblem_obj] = useState({ title: "", ContentHtml: "", tags: [] });

  const getter = useCallback((Tags) => {
    setProblem_obj((prev) => {
      const prevTags = Array.isArray(prev.tags) ? prev.tags : [];
      const nextTags = Array.isArray(Tags) ? Tags : [];
      const sameLength = prevTags.length === nextTags.length;
      const sameValues = sameLength && prevTags.every((tag, i) => String(tag) === String(nextTags[i]));
      if (sameValues) return prev;
      return { ...prev, tags: nextTags };
    });
  }, []);

  const submit_handler = async () => {
    if (!Problem_obj.title || !ContentHtml) {
      toast.info("Missing fields", "Add a title and description before posting.");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.info("Creating...", "Posting your problem.");
      await dispatch(
        createProblem({
          ...Problem_obj,
          ContentHtml,
          creator_id: user?._id,
          creator_username: user?.username,
          profile_img_: user?.profile_img_,
        })
      );

      toast.success("Problem created", "Your question is now live.");
      setProblem_obj({ title: "", ContentHtml: "", tags: [] });
      setContentHtml("");
    } catch (error) {
      toast.error("Create failed", error?.response?.data?.message || "Unable to create problem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] overflow-hidden">
      <div className="border-b border-[var(--app-border)] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[var(--app-text)]">Ask a question</h2>
        <p className="mt-0.5 text-[13px] text-[var(--app-muted)]">Describe the actual behavior, expected output, and what you already tried.</p>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[var(--app-text)]">Title</label>
          <textarea
            rows={2}
            className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-[14px] text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)] focus:border-[var(--app-accent)] focus:ring-1 focus:ring-[var(--app-accent)]/30 transition resize-none"
            onChange={(e) => setProblem_obj((p) => ({ ...p, title: e.target.value }))}
            value={Problem_obj.title}
            placeholder="e.g. Why does my Express middleware run twice?"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[var(--app-text)]">Body</label>
          <div className="overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg)]">
            <QuilEditor ContentHtml={ContentHtml} setContentHtml={setContentHtml} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--app-text)]">
            <FiTag className="text-[var(--app-muted)]" /> Tags
          </label>
          <Tags_input
            getter={getter}
            Tags_arry={Problem_obj.tags}
            variant="community-dark"
            placeholder="Add tags and press Enter"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={submit_handler}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-md border border-[#238636] bg-[#238636] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#2ea043] hover:border-[#2ea043] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IoAddCircle className="text-base" />
            {isSubmitting ? "Creating..." : "Post question"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Problem_form;
