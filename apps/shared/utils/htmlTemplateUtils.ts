/**
 * Renders HTML template by replacing placeholders with form data values
 * 
 * @param htmlTemplate - HTML template string with placeholders like {{key}}
 * @param formData - Form data object with sections containing data
 * @returns Rendered HTML string
 * 
 * @example
 * ```typescript
 * const template = "<div>{{name}}</div>";
 * const data = { section_1: { data: { name: "John" } } };
 * const rendered = renderHtmlTemplate(template, data);
 * // Returns: "<div>John</div>"
 * ```
 */
export const renderHtmlTemplate = (
  htmlTemplate: string,
  formData: Record<string, any>
): string => {
  if (!htmlTemplate || !formData) return htmlTemplate;

  // Flatten all form data from all sections into a single object
  const flattenedData: Record<string, string | number> = {};

  Object.values(formData).forEach((section: any) => {
    if (section?.data) {
      Object.entries(section.data).forEach(([key, value]) => {
        flattenedData[key] = value as string | number;
      });
    }
  });

  // Replace all {{key}} placeholders with actual values
  let renderedHtml = htmlTemplate;
  Object.entries(flattenedData).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    // Escape special regex characters in placeholder
    const regex = new RegExp(
      placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "g"
    );
    renderedHtml = renderedHtml.replace(regex, String(value || ""));
  });

  // Replace any remaining placeholders with empty string
  renderedHtml = renderedHtml.replace(/\{\{[\w-]+\}\}/g, "");

  return renderedHtml;
};

/**
 * Replaces relative resource URLs with CDN base URL
 * 
 * @param html - HTML string containing relative resource URLs
 * @param cdnBaseUrl - Base URL for CDN (default: "https://cdn.nowpurchase.com/foundary")
 * @returns HTML string with CDN URLs
 * 
 * @example
 * ```typescript
 * const html = '<img src="resources/image.jpg" />';
 * const processed = replaceResourceUrls(html);
 * // Returns: '<img src="https://cdn.nowpurchase.com/foundary/resources/image.jpg" />'
 * ```
 */
export const replaceResourceUrls = (
  html: string,
  cdnBaseUrl: string = "https://cdn.nowpurchase.com/foundary"
): string => {
  if (!html) return html;
  
  // Replace href="resources/..." or href='resources/...' with CDN URL (preserve quote style)
  html = html.replace(/href=(["'])resources\//g, (match, quote) => `href=${quote}${cdnBaseUrl}/resources/`);
  
  // Replace src="resources/..." or src='resources/...' with CDN URL (preserve quote style)
  html = html.replace(/src=(["'])resources\//g, (match, quote) => `src=${quote}${cdnBaseUrl}/resources/`);
  
  return html;
};

