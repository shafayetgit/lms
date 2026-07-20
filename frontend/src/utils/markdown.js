/**
 * Safely parses markdown strings into structured HTML.
 * Includes support for headers, lists (ordered/unordered), blockquotes, code blocks, links, and text formatting.
 */
export function parseMarkdown(markdown) {
  if (!markdown) return ""

  const lines = markdown.split(/\r?\n/)
  const result = []
  let inList = false
  let inOrderedList = false
  let inBlockquote = false
  let inCodeBlock = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()

    // Escape HTML tags to prevent XSS
    line = line
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

    // Handle code blocks (```)
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        result.push("</code></pre>")
        inCodeBlock = false
      } else {
        result.push("<pre><code>")
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      result.push(line)
      continue
    }

    // Strip bold/italic wrappers from the start/end of headings (e.g. "**## Heading**" or "**## **Heading")
    line = line.replace(/^\*\*+\s*(#{1,6}\s+)/, "$1")
    line = line.replace(/^__+\s*(#{1,6}\s+)/, "$1")
    line = line.replace(/^\*+\s*(#{1,6}\s+)/, "$1")
    line = line.replace(/^_\s*(#{1,6}\s+)/, "$1")

    if (/^#{1,6}\s+/.test(line)) {
      line = line.replace(/\*\*+$/, "")
      line = line.replace(/__+$/, "")
      line = line.replace(/\*+$/, "")
      line = line.replace(/_+$/, "")
    }

    // Inline code (`code`)
    line = line.replace(/`([^`]+)`/g, "<code>$1</code>")

    // Bold (**text** or __text__)
    line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    line = line.replace(/__(.*?)__/g, "<strong>$1</strong>")

    // Italic (*text* or _text_)
    line = line.replace(/\*(.*?)\*/g, "<em>$1</em>")
    line = line.replace(/_(.*?)_/g, "<em>$1</em>")

    // Links ([text](url))
    line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

    // Headings
    if (/^#{1,6}\s+(.*)$/.test(line)) {
      if (inList) { result.push("</ul>"); inList = false }
      if (inOrderedList) { result.push("</ol>"); inOrderedList = false }
      if (inBlockquote) { result.push("</blockquote>"); inBlockquote = false }

      const level = line.match(/^(#{1,6})/)[1].length
      const text = line.replace(/^#{1,6}\s+/, "")
      result.push(`<h${level}>${text}</h${level}>`)
      continue
    }

    // Unordered lists (- or * or +)
    if (/^[-*+]\s+(.*)$/.test(line)) {
      if (inOrderedList) { result.push("</ol>"); inOrderedList = false }
      if (inBlockquote) { result.push("</blockquote>"); inBlockquote = false }
      if (!inList) { result.push("<ul>"); inList = true }

      const text = line.replace(/^[-*+]\s+/, "")
      result.push(`<li>${text}</li>`)
      continue
    }

    // Ordered lists (1. or 2.)
    if (/^\d+\.\s+(.*)$/.test(line)) {
      if (inList) { result.push("</ul>"); inList = false }
      if (inBlockquote) { result.push("</blockquote>"); inBlockquote = false }
      if (!inOrderedList) { result.push("<ol>"); inOrderedList = true }

      const text = line.replace(/^\d+\.\s+/, "")
      result.push(`<li>${text}</li>`)
      continue
    }

    // Blockquotes (> text)
    if (/^&gt;\s+(.*)$/.test(line) || /^>\s+(.*)$/.test(line)) {
      if (inList) { result.push("</ul>"); inList = false }
      if (inOrderedList) { result.push("</ol>"); inOrderedList = false }
      if (!inBlockquote) { result.push("<blockquote>"); inBlockquote = true }

      const text = line.replace(/^&gt;\s+/, "").replace(/^>\s+/, "")
      result.push(text)
      continue
    }

    // Empty line - do NOT close lists immediately in case of spacing, but close blockquotes
    if (!line) {
      if (inBlockquote) { result.push("</blockquote>"); inBlockquote = false }
      continue
    }

    // Normal paragraph line - close any open lists or blockquotes
    if (inList) { result.push("</ul>"); inList = false }
    if (inOrderedList) { result.push("</ol>"); inOrderedList = false }
    if (inBlockquote) { result.push("</blockquote>"); inBlockquote = false }

    result.push(`<p>${line}</p>`)
  }

  if (inList) result.push("</ul>")
  if (inOrderedList) result.push("</ol>")
  if (inBlockquote) result.push("</blockquote>")
  if (inCodeBlock) result.push("</code></pre>")

  return result.join("\n")
}

/**
 * Checks if content is raw/serialized HTML or markdown/plain-text.
 * Renders it to HTML accordingly.
 */
export function renderMarkdownOrHTML(content) {
  if (!content) return ""

  let cleanText = content

  // Convert basic HTML wrappers back to markdown/plain text newlines
  const hasHTML = /<[a-z][\s\S]*>/i.test(content)
  if (hasHTML) {
    cleanText = cleanText
      .replace(/<p>/g, "")
      .replace(/<\/p>/g, "\n")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<strong>/g, "**")
      .replace(/<\/strong>/g, "**")
      .replace(/<em>/g, "*")
      .replace(/<\/em>/g, "*")
      .replace(/&nbsp;/g, " ")
      .replace(/&gt;/g, ">")
  }

  // Check if the resulting text has markdown patterns (headings, lists, bold/italic, etc.)
  const hasMarkdown = /^#{1,6}\s/m.test(cleanText) ||
                      /^[-*+]\s/m.test(cleanText) ||
                      /^\d+\.\s/m.test(cleanText) ||
                      /\*\*.*?\*\*/.test(cleanText) ||
                      /\*.*?\*/.test(cleanText) ||
                      /^\*\*+#{1,6}\s/m.test(cleanText) ||
                      /^\*+#{1,6}\s/m.test(cleanText)

  if (hasMarkdown) {
    return parseMarkdown(cleanText)
  }

  return content
}
