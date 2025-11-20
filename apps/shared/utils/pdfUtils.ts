import html2pdf from "html2pdf.js";

export interface PDFConfig {
  margin?: [number, number, number, number];
  image?: { type: "jpeg" | "png"; quality: number };
  html2canvas?: { scale: number };
  jsPDF?: {
    unit: "in" | "mm" | "pt" | "px";
    format: "letter" | "a4" | "legal" | [number, number];
    orientation: "portrait" | "landscape";
  };
}

export const DEFAULT_PDF_CONFIG: PDFConfig = {
  margin: [0.2, 0.2, 0.2, 0.2],
  image: { type: "jpeg", quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
};

export const PDF_ERROR_MESSAGES = {
  GENERATION_FAILED: "Failed to generate PDF. Please try again.",
  INVALID_ELEMENT: "Invalid element provided for PDF generation.",
};

export interface GeneratePDFOptions {
  filename?: string;
  config?: Partial<PDFConfig>;
}

export const generatePDF = async (
  element: HTMLElement,
  options: GeneratePDFOptions = {}
): Promise<void> => {
  if (!element) {
    throw new Error(PDF_ERROR_MESSAGES.INVALID_ELEMENT);
  }

  try {
    const { filename, config = {} } = options;
    // Default filename - can be overridden by passing filename in options
    const pdfFilename = filename || `document-${new Date().getTime()}.pdf`;
    const mergedConfig = { ...DEFAULT_PDF_CONFIG, ...config };

    await html2pdf()
      .set({
        ...mergedConfig,
        filename: pdfFilename,
      })
      .from(element)
      .save();
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(PDF_ERROR_MESSAGES.GENERATION_FAILED);
  }
};

