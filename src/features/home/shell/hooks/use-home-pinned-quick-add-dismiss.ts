import { useEffect, type Dispatch, type RefObject, type SetStateAction } from "react";

type UseHomePinnedQuickAddDismissParams = {
  isPinnedQuickAddOpen: boolean;
  setIsPinnedQuickAddOpen: Dispatch<SetStateAction<boolean>>;
  pinnedQuickAddPopoverRef: RefObject<HTMLDivElement | null>;
  pinnedQuickAddTriggerRef: RefObject<HTMLButtonElement | null>;
};

export function useHomePinnedQuickAddDismiss({
  isPinnedQuickAddOpen,
  setIsPinnedQuickAddOpen,
  pinnedQuickAddPopoverRef,
  pinnedQuickAddTriggerRef,
}: UseHomePinnedQuickAddDismissParams) {
  useEffect(() => {
    if (!isPinnedQuickAddOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (pinnedQuickAddPopoverRef.current?.contains(target)) return;
      if (pinnedQuickAddTriggerRef.current?.contains(target)) return;
      setIsPinnedQuickAddOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPinnedQuickAddOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [
    isPinnedQuickAddOpen,
    pinnedQuickAddPopoverRef,
    pinnedQuickAddTriggerRef,
    setIsPinnedQuickAddOpen,
  ]);
}
