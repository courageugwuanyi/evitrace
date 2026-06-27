import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, Lock, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { C, Field, GhostBtn, Input, PrimaryBtn, Select } from "@/features/home/shared/ui-kit";

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
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

function SecureEditDialog({
  label,
  current,
  options,
  onClose,
  onSave,
}: {
  label: string;
  current: string;
  options?: string[];
  onClose: () => void;
  onSave: (next: string, password: string) => Promise<boolean>;
}) {
  const [next, setNext] = useState(current);
  const [pwd, setPwd] = useState("");
  const canSave = pwd.trim().length > 0 && next.trim().length > 0;
  return (
    <ModalBackdrop onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md border"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: C.border }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: C.primarySoft, color: C.primary }}
            >
              <Lock size={16} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Edit {label}
              </div>
              <div className="text-xs" style={{ color: C.subtle }}>
                Confirm your password to save changes.
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#F4F5F7]"
            style={{ color: C.slate }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Field label={`New ${label}`}>
            {options ? (
              <Select value={next} onChange={(e) => setNext(e.target.value)}>
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            ) : (
              <Input value={next} onChange={(e) => setNext(e.target.value)} />
            )}
          </Field>
          <Field label="Current Password">
            <Input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Enter your password"
              icon={<KeyRound size={14} />}
            />
          </Field>
        </div>
        <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: C.border }}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn
            disabled={!canSave}
            onClick={async () => {
              if (!canSave) return;
              const ok = await onSave(next.trim(), pwd);
              if (!ok) toast.error("Incorrect password");
              else {
                toast.success(`${label} updated`);
                onClose();
              }
            }}
          >
            Save Changes
          </PrimaryBtn>
        </div>
      </motion.div>
    </ModalBackdrop>
  );
}

export function SecureField({
  label,
  value,
  options,
  onSave,
}: {
  label: string;
  value: string;
  options?: string[];
  onSave: (next: string, password: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <Input value={value} readOnly />
        <GhostBtn onClick={() => setEditing(true)}>
          <Pencil size={12} />
          Edit
        </GhostBtn>
      </div>
      <AnimatePresence>
        {editing && (
          <SecureEditDialog
            label={label}
            current={value}
            options={options}
            onClose={() => setEditing(false)}
            onSave={onSave}
          />
        )}
      </AnimatePresence>
    </Field>
  );
}
