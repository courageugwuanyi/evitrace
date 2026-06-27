import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { C, GhostBtn } from "@/features/home/shared/ui-kit";

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Backdrop onClose={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md border"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            {destructive ? (
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-red-100">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-amber-100">
                <AlertCircle size={18} className="text-amber-600" />
              </div>
            )}
            <div className="flex-1">
              <div className="text-base font-bold" style={{ color: C.navy }}>
                {title}
              </div>
              <div className="text-sm mt-1.5 leading-relaxed" style={{ color: C.slate }}>
                {description}
              </div>
            </div>
          </div>
        </div>
        <div
          className="px-5 py-3 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border, background: C.bg }}
        >
          <GhostBtn onClick={onCancel}>{cancelLabel}</GhostBtn>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded text-sm font-semibold text-white transition-colors"
            style={{ background: destructive ? C.red : C.primary }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </Backdrop>
  );
}

export function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
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

export function Textarea({
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
