import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ContentRead, ContentType } from "@/lib/api/content";

interface PDFExportOptions {
  title?: string;
  subtitle?: string;
  includeMetadata?: boolean;
  filename?: string;
}

/**
 * Converts markdown content to a formatted PDF document
 * following the existing TeacherlyAI design patterns
 */
export class PDFExporter {
  private static createTempContainer(content: ContentRead): HTMLElement {
    const container = document.createElement("div");
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 800px;
      background: white;
      padding: 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #0f172a;
    `;

    // Create header section
    const header = document.createElement("div");
    header.style.cssText = `
      border-bottom: 2px solid #00a078;
      padding-bottom: 20px;
      margin-bottom: 30px;
    `;

    // Title
    const title = document.createElement("h1");
    title.style.cssText = `
      color: #00a078;
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 10px 0;
    `;
    title.textContent = content.title;

    // Content type badge
    const typeBadge = document.createElement("span");
    const typeConfig = {
      [ContentType.EXAM]: { label: "EXAM", color: "#3b82f6" },
      [ContentType.ASSIGNMENT]: { label: "ASSIGNMENT", color: "#f59e0b" },
      [ContentType.MATERIAL]: { label: "MATERIAL", color: "#10b981" },
      [ContentType.NOTE]: { label: "NOTE", color: "#6b7280" },
    };
    const config = typeConfig[content.content_type];
    typeBadge.style.cssText = `
      display: inline-block;
      background: ${config.color};
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 15px;
    `;
    typeBadge.textContent = config.label;

    // Metadata section
    const metadata = document.createElement("div");
    metadata.style.cssText = `
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #475569;
    `;

    if (content.data?.source_request) {
      const { subject, grade, unit, topic } = content.data.source_request;
      if (subject) {
        const subjectDiv = document.createElement("div");
        subjectDiv.innerHTML = `<strong>Subject:</strong> ${subject}`;
        metadata.appendChild(subjectDiv);
      }
      if (grade) {
        const gradeDiv = document.createElement("div");
        gradeDiv.innerHTML = `<strong>Grade:</strong> ${grade}`;
        metadata.appendChild(gradeDiv);
      }
      if (unit) {
        const unitDiv = document.createElement("div");
        unitDiv.innerHTML = `<strong>Unit:</strong> ${unit}`;
        metadata.appendChild(unitDiv);
      }
      if (topic) {
        const topicDiv = document.createElement("div");
        topicDiv.innerHTML = `<strong>Topic:</strong> ${topic}`;
        metadata.appendChild(topicDiv);
      }
    }

    if (content.description) {
      const description = document.createElement("div");
      description.style.cssText = `
        font-style: italic;
        color: #64748b;
        margin-bottom: 10px;
      `;
      description.textContent = content.description;
      metadata.appendChild(description);
    }

    header.appendChild(title);
    header.appendChild(typeBadge);
    header.appendChild(metadata);

    // Content section
    const contentDiv = document.createElement("div");
    contentDiv.style.cssText = `
      font-size: 14px;
      line-height: 1.7;
    `;

    // Convert markdown to HTML for PDF rendering
    const markdownContent = content.data?.markdown || "No content available.";
    contentDiv.innerHTML = this.convertMarkdownToHTML(markdownContent);

    // Apply styles to rendered content
    this.applyContentStyles(contentDiv);

    container.appendChild(header);
    container.appendChild(contentDiv);

    return container;
  }

  private static convertMarkdownToHTML(markdown: string): string {
    let html = markdown;

    // Headers
    html = html.replace(
      /^### (.*$)/gm,
      '<h3 style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 18px 0 10px 0;">$1</h3>',
    );
    html = html.replace(
      /^## (.*$)/gm,
      '<h2 style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 20px 0 12px 0;">$1</h2>',
    );
    html = html.replace(
      /^# (.*$)/gm,
      '<h1 style="color: #0f172a; font-size: 20px; font-weight: 600; margin: 25px 0 15px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">$1</h1>',
    );

    // Code blocks (before inline code)
    html = html.replace(
      /```(\w*)\n([\s\S]*?)\n```/g,
      '<pre style="background: #f1f5f9; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; overflow-x: auto; font-family: monospace; font-size: 13px; margin: 15px 0;"><code>$2</code></pre>',
    );

    // Tables
    html = html.replace(
      /\|(.+)\|\n\|[-\s|]+\|\n((?:\|.+\|\n?)*)/g,
      (match, header, rows) => {
        const headerCells = header
          .split("|")
          .filter((cell: string) => cell.trim())
          .map(
            (cell: string) =>
              `<th style="border: 1px solid #e2e8f0; padding: 8px 12px; background: #f8fafc; font-weight: 600; text-align: left;">${cell.trim()}</th>`,
          )
          .join("");

        const bodyRows = rows
          .trim()
          .split("\n")
          .map((row: string) => {
            const cells = row
              .split("|")
              .filter((cell: string) => cell.trim())
              .map(
                (cell: string) =>
                  `<td style="border: 1px solid #e2e8f0; padding: 8px 12px;">${cell.trim()}</td>`,
              )
              .join("");
            return `<tr>${cells}</tr>`;
          })
          .join("");

        return `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e2e8f0;"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
      },
    );

    // Lists (handle nested lists)
    html = html.replace(
      /^(\s*)(\d+\.|\*|\-|\+) (.+$)/gm,
      (match, indent, marker, content) => {
        const level = Math.floor(indent.length / 2);
        const marginLeft = level * 20;
        const listStyle = /^\d+\./.test(marker) ? "decimal" : "disc";
        return `<li style="margin: 5px 0; margin-left: ${marginLeft}px; list-style-type: ${listStyle};">${content}</li>`;
      },
    );

    // Wrap consecutive list items in ul/ol tags
    html = html.replace(
      /(<li[^>]*>.*?<\/li>(?:\s*<li[^>]*>.*?<\/li>)*)/g,
      '<ul style="padding-left: 20px; margin: 10px 0;">$1</ul>',
    );

    // Text formatting
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong style="font-weight: 600;">$1</strong>',
    );
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(
      /`(.*?)`/g,
      '<code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px;">$1</code>',
    );

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" style="color: #00a078; text-decoration: underline;">$1</a>',
    );

    // Paragraphs
    html = html.replace(
      /\n\s*\n/g,
      '</p><p style="margin: 12px 0; line-height: 1.6;">',
    );
    html = html.replace(/\n/g, "<br>");

    // Wrap in paragraph tags
    html = `<p style="margin: 12px 0; line-height: 1.6;">${html}</p>`;

    // Clean up empty paragraphs
    html = html.replace(/<p[^>]*>\s*<\/p>/g, "");

    return html;
  }

  private static applyContentStyles(container: HTMLElement): void {
    // Apply consistent styling to all content elements
    const tables = container.querySelectorAll("table");
    tables.forEach((table) => {
      (table as HTMLElement).style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        border: 1px solid #e2e8f0;
      `;
    });

    const cells = container.querySelectorAll("th, td");
    cells.forEach((cell) => {
      (cell as HTMLElement).style.cssText = `
        border: 1px solid #e2e8f0;
        padding: 10px;
        text-align: left;
      `;
    });

    const headers = container.querySelectorAll("th");
    headers.forEach((header) => {
      (header as HTMLElement).style.cssText += `
        background: #f8fafc;
        font-weight: 600;
      `;
    });

    const codeBlocks = container.querySelectorAll("pre");
    codeBlocks.forEach((pre) => {
      (pre as HTMLElement).style.cssText = `
        background: #f1f5f9;
        padding: 15px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        overflow-x: auto;
        font-family: monospace;
        font-size: 13px;
        margin: 15px 0;
      `;
    });
  }

  /**
   * Exports a single content item to PDF
   */
  public static async exportContentToPDF(
    content: ContentRead,
    options: PDFExportOptions = {},
  ): Promise<void> {
    try {
      const container = this.createTempContainer(content);
      document.body.appendChild(container);

      // Wait for any dynamic content to load
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generate canvas from HTML with higher quality settings
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 800,
        height: container.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
        windowHeight: container.scrollHeight,
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Create PDF with better settings
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const currentPosition = 10; // Start with 10mm top margin
      const maxPageHeight = pdfHeight - 20; // 10mm margin top and bottom

      if (imgHeight <= maxPageHeight) {
        // Content fits on one page
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          10,
          currentPosition,
          imgWidth,
          imgHeight,
        );
      } else {
        // Content needs multiple pages
        const pageHeight = maxPageHeight;
        const totalPages = Math.ceil(imgHeight / pageHeight);

        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage();
          }

          const sourceY = (i * pageHeight * canvas.height) / imgHeight;
          const sourceHeight = Math.min(
            (pageHeight * canvas.height) / imgHeight,
            canvas.height - sourceY,
          );

          // Create a temporary canvas for this page slice
          const pageCanvas = document.createElement("canvas");
          const pageCtx = pageCanvas.getContext("2d")!;
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;

          pageCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sourceHeight,
            0,
            0,
            canvas.width,
            sourceHeight,
          );

          const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
          pdf.addImage(
            pageCanvas.toDataURL("image/png"),
            "PNG",
            10,
            10,
            imgWidth,
            pageImgHeight,
          );
        }
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename =
        options.filename ||
        `${content.title
          .replace(/[^a-z0-9\s]/gi, "")
          .replace(/\s+/g, "_")
          .toLowerCase()}_${content.content_type}_${timestamp}.pdf`;

      // Download the PDF
      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF. Please try again.");
    }
  }

  /**
   * Exports multiple content items to separate PDFs (batch export)
   */
  public static async exportMultipleContentsToPDF(
    contents: ContentRead[],
    options: PDFExportOptions = {},
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString().split("T")[0];

      for (let i = 0; i < contents.length; i++) {
        const content = contents[i];
        const filename = `${content.title
          .replace(/[^a-z0-9\s]/gi, "")
          .replace(/\s+/g, "_")
          .toLowerCase()}_${content.content_type}_${timestamp}.pdf`;

        await this.exportContentToPDF(content, { ...options, filename });

        // Add delay between downloads to prevent browser blocking, except for the last item
        if (i < contents.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    } catch (error) {
      console.error("Error in batch PDF export:", error);
      throw new Error("Failed to export PDFs. Please try again.");
    }
  }

  /**
   * Generates a filename for the PDF based on content
   */
  public static generateFilename(content: ContentRead): string {
    const timestamp = new Date().toISOString().split("T")[0];
    const sanitizedTitle = content.title
      .replace(/[^a-z0-9\s]/gi, "")
      .replace(/\s+/g, "_")
      .toLowerCase();
    return `${sanitizedTitle}_${content.content_type}_${timestamp}.pdf`;
  }

  /**
   * Creates a combined PDF with multiple content items
   */
  public static async exportCombinedContentsToPDF(
    contents: ContentRead[],
    options: PDFExportOptions = {},
  ): Promise<void> {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const timestamp = new Date().toISOString().split("T")[0];

      for (let i = 0; i < contents.length; i++) {
        const content = contents[i];
        const container = this.createTempContainer(content);
        document.body.appendChild(container);

        await new Promise((resolve) => setTimeout(resolve, 100));

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: 800,
          height: container.scrollHeight,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 800,
          windowHeight: container.scrollHeight,
        });

        document.body.removeChild(container);

        if (i > 0) {
          pdf.addPage();
        }

        const imgWidth = 190; // A4 width minus margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          10,
          10,
          imgWidth,
          imgHeight,
        );
      }

      const filename =
        options.filename ||
        `combined_contents_${contents[0].content_type}_${timestamp}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error("Error generating combined PDF:", error);
      throw new Error("Failed to generate combined PDF. Please try again.");
    }
  }
}

/**
 * Hook for PDF export functionality
 */
export const usePDFExport = () => {
  const exportSingleContent = async (
    content: ContentRead,
    options?: PDFExportOptions,
  ) => {
    try {
      await PDFExporter.exportContentToPDF(content, options);
    } catch (error) {
      throw error;
    }
  };

  const exportMultipleContents = async (
    contents: ContentRead[],
    options?: PDFExportOptions,
  ) => {
    try {
      await PDFExporter.exportMultipleContentsToPDF(contents, options);
    } catch (error) {
      throw error;
    }
  };

  const exportCombinedContents = async (
    contents: ContentRead[],
    options?: PDFExportOptions,
  ) => {
    try {
      await PDFExporter.exportCombinedContentsToPDF(contents, options);
    } catch (error) {
      throw error;
    }
  };

  return {
    exportSingleContent,
    exportMultipleContents,
    exportCombinedContents,
    generateFilename: PDFExporter.generateFilename,
  };
};
