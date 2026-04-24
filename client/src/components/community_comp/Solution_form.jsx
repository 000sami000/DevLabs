import React, { useEffect, useState } from "react";
import { FiEdit3, FiMessageSquare } from "react-icons/fi";
import { IoAddCircle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { createSolution, updateSolution } from "../../redux_/actions/solution";
import { useToast } from "../common/ToastProvider";
import QuilEditor from "../text_editor/QuilEditor";

function Solution_form({ p_id, Sol_ed, setSol_ed }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userReducer.current_user);
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ContentHtml, setContentHtml] = useState(Sol_ed ? Sol_ed.solution_content : "");

  useEffect(() => {
    setContentHtml(Sol_ed ? Sol_ed.solution_content : "");
  }, [Sol_ed]);

  const submit_handler = async () => {
    if (!ContentHtml) {
      toast.info("Missing content", "You cannot submit an empty answer.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (Sol_ed) {
        toast.info("Updating...", "Saving your answer changes.");
        await dispatch(updateSolution(Sol_ed._id, { ...Sol_ed, solution_content: ContentHtml }));
        toast.success("Answer updated", "Your solution has been updated.");
        setSol_ed(null);
        setContentHtml("");
        return;
      }

      toast.info("Creating...", "Posting your answer.");
      await dispatch(createSolution(p_id, { ContentHtml, creator_username: user.username, profile_img_: user?.profile_img_ }));
      toast.success("Answer posted", "Your solution is now visible.");
      setContentHtml("");
    } catch (error) {
      toast.error(
        Sol_ed ? "Update failed" : "Create failed",
        error?.response?.data?.message || "Unable to save this answer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--app-border)] px-5 py-3">
        <div>
          <p className="text-[15px] font-semibold text-[var(--app-text)]">
            {Sol_ed ? "Edit answer" : "Your answer"}
          </p>
          <p className="mt-0.5 text-[13px] text-[var(--app-muted)]">
            {Sol_ed ? "Update your solution below." : "Explain the fix and why it works."}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-2.5 py-1.5 text-[12px] text-[var(--app-muted)]">
          <FiMessageSquare className="text-[11px]" /> Rich editor
        </div>
      </div>

      <div className="p-5">
        <div className="overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg)]">
          <QuilEditor ContentHtml={ContentHtml} setContentHtml={setContentHtml} />
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {Sol_ed != null && (
            <button
              type="button"
              onClick={() => setSol_ed(null)}
              disabled={isSubmitting}
              className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-4 py-2 text-[13px] font-medium text-[var(--app-text)] transition hover:bg-[var(--app-bg-soft-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          )}
          <button
            onClick={submit_handler}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-md border border-[#238636] bg-[#238636] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#2ea043] hover:border-[#2ea043] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {Sol_ed ? <FiEdit3 /> : <IoAddCircle />}
            {isSubmitting
              ? Sol_ed
                ? "Updating..."
                : "Creating..."
              : Sol_ed
                ? "Save answer"
                : "Post answer"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Solution_form;
