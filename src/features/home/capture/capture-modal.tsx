import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  Info,
  Link as LinkIcon,
  Plus,
  Share2,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useFramework } from "@/context/FrameworkContext";
import { C, Field, GhostBtn, Input, PrimaryBtn, Select } from "@/features/home/shared/ui-kit";
import { inferCompetencyFromText, polishText } from "@/features/home/shared/text-utils";

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

function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full min-h-[150px] resize-y rounded border bg-[#F4F5F7] p-3 text-sm leading-relaxed outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${className ?? ""}`}
      style={{ borderColor: C.border, color: C.navy, overflowWrap: "anywhere" }}
    />
  );
}

function buildFrameworkCategoryMapFromContext(
  categories: string[],
  getQuestionsForCategory: (categoryName: string) => string[],
): Record<string, { summary: string; items: string[] }> {
  return categories.reduce<Record<string, { summary: string; items: string[] }>>((acc, categoryName) => {
    acc[categoryName] = {
      summary: "",
      items: getQuestionsForCategory(categoryName),
    };
    return acc;
  }, {});
}

export function CaptureModal({
  onClose,
  onSaveEvidence,
  onSaveKnowledge,
  competencyDescriptions,
}: {
  onClose: () => void;
  onSaveEvidence: (payload: {
    title: string;
    description: string;
    sourceLink: string;
    category: string;
    subcategory: string;
  }) => void;
  onSaveKnowledge: (payload: {
    challenge: string;
    lesson: string;
    referenceLinks: string[];
    reset: () => void;
  }) => void;
  competencyDescriptions: Record<string, string>;
}) {
  const { categories: frameworkCategories, getQuestionsForCategory, isLoading } = useFramework();
  const [tab, setTab] = useState<"evidence" | "knowledge">("evidence");
  const categoryMap = useMemo(
    () => buildFrameworkCategoryMapFromContext(frameworkCategories, getQuestionsForCategory),
    [frameworkCategories, getQuestionsForCategory],
  );
  const categories = useMemo(
    () => frameworkCategories.filter((categoryName) => categoryName.trim().length > 0),
    [frameworkCategories],
  );
  const hasFrameworkTaxonomy = categories.length > 0;
  const initialCategory = categories[0] ?? "";
  const initialSubcategory = categoryMap[initialCategory]?.items[0] ?? "";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [subcategory, setSubcategory] = useState(initialSubcategory);
  const [challenge, setChallenge] = useState("");
  const [lesson, setLesson] = useState("");
  const [knowledgeReferenceInput, setKnowledgeReferenceInput] = useState("");
  const [knowledgeReferenceLinks, setKnowledgeReferenceLinks] = useState<string[]>([]);
  const linkValid = !sourceLink || /^https?:\/\/\S+\.\S+/i.test(sourceLink);
  const knowledgeInputValid =
    !knowledgeReferenceInput || /^https?:\/\/\S+\.\S+/i.test(knowledgeReferenceInput);

  function onCategoryChange(v: string) {
    setCategory(v);
    setSubcategory(categoryMap[v]?.items[0] ?? "");
  }

  function handleAutoMapCompetency() {
    const inferred = inferCompetencyFromText(title, description);
    const mappedCategory = categories.includes(inferred)
      ? inferred
      : categories.find((candidate) => candidate.toLowerCase().includes(inferred.toLowerCase())) ??
        categories[0] ??
        "";
    setCategory(mappedCategory);
    setSubcategory(categoryMap[mappedCategory]?.items[0] ?? "");
    toast.success("Competency auto-mapped.");
  }

  useEffect(() => {
    if (isLoading) return;
    if (categories.length === 0) {
      if (category) setCategory("");
      if (subcategory) setSubcategory("");
      return;
    }
    if (!categories.includes(category)) {
      setCategory(initialCategory);
      setSubcategory(initialSubcategory);
      return;
    }
    const selectedItems = categoryMap[category]?.items ?? [];
    if (!selectedItems.includes(subcategory)) {
      setSubcategory(selectedItems[0] ?? "");
    }
  }, [
    categories,
    category,
    subcategory,
    categoryMap,
    initialCategory,
    initialSubcategory,
    isLoading,
  ]);

  function handlePolishContent() {
    if (!title.trim() && !description.trim()) {
      toast.info("Add title or description first.");
      return;
    }
    if (title.trim()) setTitle((prev) => polishText(prev));
    if (description.trim()) setDescription((prev) => polishText(prev));
    toast.success("Content polished.");
  }

  function resetKnowledgeFields() {
    setChallenge("");
    setLesson("");
    setKnowledgeReferenceInput("");
    setKnowledgeReferenceLinks([]);
  }

  function addKnowledgeReferenceLink() {
    const trimmed = knowledgeReferenceInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/\S+\.\S+/i.test(trimmed)) {
      toast.error("Enter a valid URL starting with http:// or https://");
      return;
    }
    setKnowledgeReferenceLinks((previous) => {
      if (previous.some((link) => link.toLowerCase() === trimmed.toLowerCase())) return previous;
      return [...previous, trimmed];
    });
    setKnowledgeReferenceInput("");
  }

  function removeKnowledgeReferenceLink(linkToRemove: string) {
    setKnowledgeReferenceLinks((previous) => previous.filter((link) => link !== linkToRemove));
  }

  return (
    <Backdrop onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-xl border"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: C.border }}
        >
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.subtle }}>
              Manual Capture
            </div>
            <div className="text-lg font-bold mt-0.5" style={{ color: C.navy }}>
              Capture activity
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#F4F5F7]"
            style={{ color: C.slate }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div
            className="inline-flex rounded-md border p-0.5"
            style={{ borderColor: C.border }}
            role="tablist"
            aria-label="Capture mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "evidence"}
              onClick={() => setTab("evidence")}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${tab === "evidence" ? "text-white" : ""}`}
              style={{
                background: tab === "evidence" ? C.primary : "transparent",
                color: tab === "evidence" ? "#fff" : C.slate,
              }}
            >
              Capture Evidence
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "knowledge"}
              onClick={() => setTab("knowledge")}
              className="px-3 py-1.5 text-xs font-semibold rounded"
              style={{
                background: tab === "knowledge" ? C.primary : "transparent",
                color: tab === "knowledge" ? "#fff" : C.slate,
              }}
            >
              Log Knowledge
            </button>
          </div>

          {tab === "evidence" ? (
            <>
              <Field label="Evidence Title" required>
                <Input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Led RFC review for payments cutover"
                />
              </Field>
              <Field label="Description / Context" optional>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What challenge did you solve and what was the impact?"
                  rows={4}
                />
              </Field>
              <div
                className="rounded-md border p-2.5 space-y-2"
                style={{ borderColor: C.border, background: "#FAFBFC" }}
              >
                <div className="text-[11px] font-semibold" style={{ color: C.slate }}>
                  AI Assistant Actions
                </div>
                <div className="flex items-center gap-2">
                  <GhostBtn type="button" className="border h-8 px-2.5" onClick={handlePolishContent}>
                    <Sparkles size={13} />
                    Polish Content
                  </GhostBtn>
                  <GhostBtn
                    type="button"
                    className="border h-8 px-2.5"
                    onClick={handleAutoMapCompetency}
                  >
                    <Sparkles size={13} />
                    Auto-Map Competency
                  </GhostBtn>
                </div>
                <div className="text-[11px]" style={{ color: C.subtle }}>
                  AI will clean up your engineering shorthand for corporate clarity and auto-select
                  matching competency options.
                </div>
              </div>
              <Field label="Source Link" optional>
                <div className="relative">
                  <LinkIcon
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: C.subtle }}
                  />
                  <Input
                    value={sourceLink}
                    onChange={(e) => setSourceLink(e.target.value)}
                    placeholder="https://github.com/org/repo/pull/142"
                    className="pl-8"
                  />
                </div>
                <div className="text-[11px] mt-1" style={{ color: linkValid ? C.subtle : C.red }}>
                  {linkValid
                    ? "Add URL to a Jira ticket, PR, or Confluence page."
                    : "Enter a valid URL starting with http:// or https://"}
                </div>
              </Field>
              <Field label="Competency Category" required>
                <Select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
                  {hasFrameworkTaxonomy ? null : (
                    <option value="">No framework categories available</option>
                  )}
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
                <div className="text-[11px] mt-1.5 leading-relaxed" style={{ color: C.subtle }}>
                  {categoryMap[category]?.summary || competencyDescriptions[category] || "No summary provided."}
                </div>
              </Field>
              <Field label="Subcategory / Question" required>
                <Select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  disabled={!hasFrameworkTaxonomy || !category}
                >
                  {!hasFrameworkTaxonomy ? (
                    <option value="">No framework categories available</option>
                  ) : null}
                  {(categoryMap[category]?.items ?? []).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
            </>
          ) : (
            <>
              <Field label="Core Activity / Challenge" required>
                <Textarea
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="What challenge did you run into?"
                  rows={4}
                />
              </Field>
              <Field label="Solution / Lesson Learned" required>
                <Textarea
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  placeholder="What did you learn that you'll reuse?"
                  rows={5}
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
                      value={knowledgeReferenceInput}
                      onChange={(e) => setKnowledgeReferenceInput(e.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addKnowledgeReferenceLink();
                        }
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="pl-8"
                    />
                  </div>
                  <GhostBtn
                    type="button"
                    className="border h-9 px-2.5 whitespace-nowrap"
                    onClick={addKnowledgeReferenceLink}
                  >
                    <Plus size={13} />
                    Add Reference Link
                  </GhostBtn>
                </div>
                {!knowledgeInputValid && (
                  <div className="text-[11px] mt-1" style={{ color: C.red }}>
                    Enter a valid URL starting with http:// or https://
                  </div>
                )}
                {knowledgeReferenceLinks.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {knowledgeReferenceLinks.map((link) => (
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
                          onClick={() => removeKnowledgeReferenceLink(link)}
                          className="rounded-full p-0.5 hover:bg-[#B3D4FF]"
                          aria-label={`Remove reference link ${link}`}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </Field>
            </>
          )}
        </div>
        <div
          className="p-4 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border }}
        >
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          {tab === "evidence" ? (
            <PrimaryBtn
              disabled={
                !hasFrameworkTaxonomy ||
                !title.trim() ||
                !category.trim() ||
                !subcategory.trim() ||
                !linkValid
              }
              onClick={() =>
                onSaveEvidence({
                  title,
                  description,
                  sourceLink,
                  category,
                  subcategory,
                })
              }
            >
              Save Evidence
            </PrimaryBtn>
          ) : (
            <PrimaryBtn
              disabled={!hasFrameworkTaxonomy || !challenge.trim() || !lesson.trim() || !knowledgeInputValid}
              onClick={() =>
                onSaveKnowledge({
                  challenge,
                  lesson,
                  referenceLinks: knowledgeReferenceLinks,
                  reset: resetKnowledgeFields,
                })
              }
            >
              Save Knowledge
            </PrimaryBtn>
          )}
        </div>
      </motion.div>
    </Backdrop>
  );
}
