import { useRef, useCallback } from "react";
import { generatePDF, GeneratePDFOptions } from "../utils/pdfUtils";

export interface UsePDFDownloadOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showAlert?: boolean;
}

export const usePDFDownload = (options: UsePDFDownloadOptions = {}) => {
  const { onSuccess, onError, showAlert = true } = options;
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = useCallback(
    async (pdfOptions?: GeneratePDFOptions) => {
      if (!contentRef.current) {
        const error = new Error("PDF content reference is not available");
        console.warn(error.message);
        if (onError) {
          onError(error);
        }
        return;
      }

      try {
        await generatePDF(contentRef.current, pdfOptions);
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        const pdfError =
          error instanceof Error ? error : new Error("Unknown PDF error");
        console.error("PDF download error:", pdfError);

        if (showAlert) {
          alert(pdfError.message);
        }

        if (onError) {
          onError(pdfError);
        }
      }
    },
    [onSuccess, onError, showAlert]
  );

  return {
    contentRef,
    handleDownloadPDF,
  };
};

