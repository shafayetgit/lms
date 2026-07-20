import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"
import TextAlign from "@tiptap/extension-text-align"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Placeholder from "@tiptap/extension-placeholder"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import { all, createLowlight } from "lowlight"

const lowlight = createLowlight(all)

// Returns configured Tiptap extensions array
export function getExtensions(placeholder = "Type here...") {
  return [
    StarterKit.configure({ codeBlock: false, horizontalRule: false }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    }),
    Image.configure({ inline: false, allowBase64: true }),
    Youtube.configure({ width: 640, height: 360 }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    CodeBlockLowlight.configure({ lowlight }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    Placeholder.configure({ placeholder }),
    HorizontalRule,
    Subscript,
    Superscript,
  ]
}
