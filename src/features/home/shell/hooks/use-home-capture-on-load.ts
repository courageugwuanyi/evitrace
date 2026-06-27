import { useEffect, type Dispatch, type SetStateAction } from "react";

type UseHomeCaptureOnLoadParams = {
  openCaptureOnLoad: boolean;
  setShowCapture: Dispatch<SetStateAction<boolean>>;
};

export function useHomeCaptureOnLoad({
  openCaptureOnLoad,
  setShowCapture,
}: UseHomeCaptureOnLoadParams) {
  useEffect(() => {
    if (!openCaptureOnLoad) return;
    setShowCapture(true);
  }, [openCaptureOnLoad, setShowCapture]);
}
