import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Edit2,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  Pin,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatUtcToLocal } from "@/lib/datetime";
import { C, Card, Field, GhostBtn, Input, PrimaryBtn } from "@/features/home/shared/ui-kit";
import {
  extractYouTubeVideoId,
  firstUrlInText,
  normalizeReferenceLinks,
} from "@/features/home/shared/text-utils";
import type { KnowledgeHubItem } from "@/features/home/knowledge/knowledge";

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(9, 30, 66, 0.54)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      {children}
    </motion.div>
  );
}

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full min-h-[150px] resize-y rounded border bg-[#F4F5F7] p-3 text-sm leading-relaxed outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${className ?? ""}`}
      style={{ borderColor: C.border, color: C.navy, overflowWrap: "anywhere" }}
    />
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
      <div className="min-w-0">
        <div className="text-sm font-bold" style={{ color: C.navy }}>
          {title}
        </div>
        {sub && (
          <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

export function KnowledgeHubView({
  items,
  pinnedKnowledgeIds,
  focusedItemId,
  onTogglePin,
  onEdit,
  onDelete,
}: {
  items: KnowledgeHubItem[];
  pinnedKnowledgeIds: Set<string>;
  focusedItemId: string | null;
  onTogglePin: (item: KnowledgeHubItem) => void;
  onEdit: (item: KnowledgeHubItem) => void;
  onDelete: (item: KnowledgeHubItem) => void;
}) {
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!focusedItemId) return;
    const target = document.getElementById(`knowledge-card-${focusedItemId}`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedItemId(focusedItemId);
    const timer = window.setTimeout(() => {
      setHighlightedItemId((current) => (current === focusedItemId ? null : current));
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [focusedItemId, items]);

  return (
    <Card className="p-5">
      <SectionHeader
        title="Knowledge Hub"
        sub="Capture and revisit technical insights, architecture notes, and personal engineering learnings."
      />
      {items.length === 0 ? (
        <div
          className="mt-4 rounded-lg border border-dashed px-4 py-6 text-sm"
          style={{ borderColor: C.border, color: C.subtle }}
        >
          No knowledge entries yet. Use <span className="font-semibold">Log Knowledge</span> from
          Manual Capture or the Extension popup to populate this hub.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
          {items.map((item) => {
            const fallbackUrl = firstUrlInText(`${item.challenge} ${item.lesson}`);
            const allReferenceLinks = normalizeReferenceLinks([
              ...(item.referenceLinks ?? []),
              ...(fallbackUrl ? [fallbackUrl] : []),
            ]);
            const youtubeIds = allReferenceLinks
              .map((link) => extractYouTubeVideoId(link))
              .filter((id): id is string => Boolean(id));
            const uniqueYoutubeIds = Array.from(new Set(youtubeIds));
            return (
              <div
                key={item.id}
                id={`knowledge-card-${item.id}`}
                className={`min-w-0 rounded-xl border p-4 space-y-3 flex flex-col overflow-hidden transition-colors ${
                  highlightedItemId === item.id
                    ? "ring-2 ring-indigo-300 border-indigo-300 bg-indigo-50/20"
                    : ""
                }`}
                style={{
                  borderColor: highlightedItemId === item.id ? "#A5B4FC" : C.border,
                  background: "#FFFFFF",
                }}
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onTogglePin(item)}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${
                        pinnedKnowledgeIds.has(item.id)
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                          : "hover:bg-[#DEEBFF]"
                      }`}
                      style={
                        pinnedKnowledgeIds.has(item.id)
                          ? undefined
                          : { color: C.primary, borderColor: "#B3D4FF" }
                      }
                    >
                      <Pin size={12} />
                      {pinnedKnowledgeIds.has(item.id) ? "Pinned" : "Pin"}
                    </button>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border"
                      style={{ background: "#EAE6FF", color: "#403294", borderColor: "#C5B8FF" }}
                    >
                      Knowledge
                    </span>
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold hover:bg-[#DEEBFF]"
                      style={{ color: C.primary, borderColor: "#B3D4FF" }}
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold hover:bg-[#FFEBE6]"
                      style={{ color: C.red, borderColor: "#FFBDAD" }}
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-sm font-semibold break-words whitespace-pre-wrap [overflow-wrap:break-word]"
                      style={{ color: C.navy }}
                    >
                      {item.challenge || "Knowledge log"}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: C.subtle }}>
                      Logged on{" "}
                      {formatUtcToLocal(item.createdAt, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                </div>
                <div
                  className="min-w-0 text-sm leading-relaxed break-words whitespace-pre-wrap [overflow-wrap:break-word]"
                  style={{ color: C.slate }}
                >
                  {item.lesson || "No lesson text provided."}
                </div>
                {allReferenceLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 min-w-0">
                    {allReferenceLinks.map((link) => (
                      <a
                        key={`${item.id}-${link}`}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-w-0 items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold break-words whitespace-pre-wrap [overflow-wrap:break-word]"
                        style={{ color: "#006644", borderColor: "#79F2C0", background: "#E3FCEF" }}
                      >
                        Reference
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                )}
                {uniqueYoutubeIds.length > 0 && (
                  <div className="space-y-2">
                    {uniqueYoutubeIds.map((youtubeId) => (
                      <div
                        key={`${item.id}-${youtubeId}`}
                        className="rounded-lg overflow-hidden border"
                        style={{ borderColor: C.border, background: "#F4F5F7" }}
                      >
                        <iframe
                          title={`Knowledge video ${item.id}-${youtubeId}`}
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          className="w-full aspect-video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function KnowledgeEditorModal({
  item,
  isSaving,
  onClose,
  onSave,
}: {
  item: KnowledgeHubItem;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (payload: { challenge: string; lesson: string; referenceLinks: string[] }) => void;
}) {
  const [challenge, setChallenge] = useState(item.challenge ?? "");
  const [lesson, setLesson] = useState(item.lesson ?? "");
  const [referenceInput, setReferenceInput] = useState("");
  const [referenceLinks, setReferenceLinks] = useState<string[]>(
    normalizeReferenceLinks(item.referenceLinks ?? []),
  );
  const referenceInputValid = !referenceInput || /^https?:\/\/\S+\.\S+/i.test(referenceInput);

  useEffect(() => {
    setChallenge(item.challenge ?? "");
    setLesson(item.lesson ?? "");
    setReferenceInput("");
    setReferenceLinks(normalizeReferenceLinks(item.referenceLinks ?? []));
  }, [item.id, item.challenge, item.lesson, item.referenceLinks]);

  function addReferenceLink() {
    const trimmed = referenceInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/\S+\.\S+/i.test(trimmed)) {
      toast.error("Enter a valid URL starting with http:// or https://");
      return;
    }
    setReferenceLinks((previous) => normalizeReferenceLinks([...previous, trimmed]));
    setReferenceInput("");
  }

  function removeReferenceLink(linkToRemove: string) {
    setReferenceLinks((previous) => previous.filter((link) => link !== linkToRemove));
  }

  return (
    <Backdrop onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl border"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: C.border }}
        >
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Knowledge Hub
            </div>
            <div className="text-lg font-bold mt-0.5" style={{ color: C.navy }}>
              Edit knowledge log
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#F4F5F7]"
            style={{ color: C.slate }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <Field label="Core Activity / Challenge" required>
            <Textarea
              autoFocus
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="What challenge did you run into?"
              rows={7}
            />
          </Field>
          <Field label="Solution / Lesson Learned" required>
            <Textarea
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="What did you learn that you'll reuse?"
              rows={9}
            />
          </Field>
          <Field label="External Reference Links" optional>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: C.subtle }}
                />
                <Input
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addReferenceLink();
                    }
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="pl-8"
                />
              </div>
              <GhostBtn
                type="button"
                className="border h-9 px-2.5 whitespace-nowrap"
                onClick={addReferenceLink}
              >
                <Plus size={13} />
                Add Reference Link
              </GhostBtn>
            </div>
            {!referenceInputValid && (
              <div className="text-[11px] mt-1" style={{ color: C.red }}>
                Enter a valid URL starting with http:// or https://
              </div>
            )}
            {referenceLinks.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {referenceLinks.map((link) => (
                  <span
                    key={link}
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
                    style={{ borderColor: "#B3D4FF", background: "#DEEBFF", color: C.primary }}
                  >
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      Link
                      <ExternalLink size={11} />
                    </a>
                    <button
                      type="button"
                      onClick={() => removeReferenceLink(link)}
                      className="rounded-full p-0.5 hover:bg-[#B3D4FF]"
                      aria-label={`Remove reference link ${link}`}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>
        </div>
        <div
          className="p-4 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border }}
        >
          <GhostBtn type="button" onClick={onClose}>
            Cancel
          </GhostBtn>
          <PrimaryBtn
            type="button"
            disabled={isSaving || !challenge.trim() || !lesson.trim() || !referenceInputValid}
            onClick={() =>
              onSave({
                challenge,
                lesson,
                referenceLinks,
              })
            }
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save Changes
              </>
            )}
          </PrimaryBtn>
        </div>
      </motion.div>
    </Backdrop>
  );
}
