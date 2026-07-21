import React, { useCallback, useState } from "react"
import {
  Box,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from "@mui/material"
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  Link as LinkIcon,
  LinkOff,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  Image as ImageIcon,
  OndemandVideo,
  Code,
  FormatQuote,
  HorizontalRule as HRIcon,
  Subscript as SubIcon,
  Superscript as SuperIcon,
  TableChart,
  Undo,
  Redo,
  Title,
  TextFields,
  DataObject,
  TableRows,
  AddBox,
  DeleteOutline,
  ViewColumn,
} from "@mui/icons-material"

import ToolBtn from "./ToolBtn"

const Sep = () => <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

export default function CTiptapToolbar({ editor }) {
  const theme = useTheme()
  const [tableAnchor, setTableAnchor] = useState(null)

  const setLink = useCallback(() => {
    if (!editor) return
    const existing = editor.getAttributes("link").href
    const url = window.prompt("Enter URL", existing || "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  const insertImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt("Enter image URL")
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const insertVideo = useCallback(() => {
    if (!editor) return
    const url = window.prompt("Enter YouTube URL")
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }, [editor])

  const insertTable = useCallback(() => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    setTableAnchor(null)
  }, [editor])

  if (!editor) return null

  const isInTable = editor.isActive("table")

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.25,
        px: 1,
        py: 0.5,
        bgcolor: alpha(theme.palette.text.primary, 0.02),
        borderBottom: "1px solid",
        borderColor: "divider",
        flexWrap: "wrap",
      }}
    >
      {/* Text / Heading */}
      <ToolBtn
        icon={<TextFields fontSize="small" />}
        title="Normal Text"
        onClick={() => editor.chain().focus().setParagraph().run()}
        isActive={editor.isActive("paragraph") && !editor.isActive("heading")}
      />
      <ToolBtn
        icon={<Title fontSize="small" />}
        title="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
      />

      <Sep />

      {/* Inline formatting */}
      <ToolBtn
        icon={<FormatBold fontSize="small" />}
        title="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
      />
      <ToolBtn
        icon={<FormatItalic fontSize="small" />}
        title="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
      />
      <ToolBtn
        icon={<FormatUnderlined fontSize="small" />}
        title="Underline"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
      />
      <ToolBtn
        icon={<FormatStrikethrough fontSize="small" />}
        title="Strikethrough"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
      />

      <Sep />

      {/* Links */}
      <ToolBtn
        icon={<LinkIcon fontSize="small" />}
        title="Insert Link"
        onClick={setLink}
        isActive={editor.isActive("link")}
      />
      <ToolBtn
        icon={<LinkOff fontSize="small" />}
        title="Remove Link"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
      />

      <Sep />

      {/* Lists */}
      <ToolBtn
        icon={<FormatListNumbered fontSize="small" />}
        title="Ordered List"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
      />
      <ToolBtn
        icon={<FormatListBulleted fontSize="small" />}
        title="Bullet List"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
      />

      <Sep />

      {/* Alignment */}
      <ToolBtn
        icon={<FormatAlignLeft fontSize="small" />}
        title="Align Left"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
      />
      <ToolBtn
        icon={<FormatAlignCenter fontSize="small" />}
        title="Align Center"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
      />
      <ToolBtn
        icon={<FormatAlignRight fontSize="small" />}
        title="Align Right"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
      />

      <Sep />

      {/* Media */}
      <ToolBtn icon={<ImageIcon fontSize="small" />} title="Insert Image" onClick={insertImage} />
      <ToolBtn
        icon={<OndemandVideo fontSize="small" />}
        title="Embed YouTube Video"
        onClick={insertVideo}
      />

      <Sep />

      {/* Code & block elements */}
      <ToolBtn
        icon={<DataObject fontSize="small" />}
        title="Code Block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
      />
      <ToolBtn
        icon={<FormatQuote fontSize="small" />}
        title="Blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
      />
      <ToolBtn
        icon={<Code fontSize="small" />}
        title="Inline Code"
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
      />
      <ToolBtn
        icon={<HRIcon fontSize="small" />}
        title="Horizontal Rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      />

      <Sep />

      {/* Subscript / Superscript */}
      <ToolBtn
        icon={<SubIcon fontSize="small" />}
        title="Subscript"
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        isActive={editor.isActive("subscript")}
      />
      <ToolBtn
        icon={<SuperIcon fontSize="small" />}
        title="Superscript"
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        isActive={editor.isActive("superscript")}
      />

      <Sep />

      {/* Table dropdown */}
      <ToolBtn
        icon={<TableChart fontSize="small" />}
        title="Table"
        onClick={e => setTableAnchor(e.currentTarget)}
        isActive={isInTable}
      />
      <Menu
        anchorEl={tableAnchor}
        open={Boolean(tableAnchor)}
        onClose={() => setTableAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        {!isInTable && (
          <MenuItem onClick={insertTable}>
            <ListItemIcon>
              <AddBox fontSize="small" />
            </ListItemIcon>
            <ListItemText>Insert Table (3×3)</ListItemText>
          </MenuItem>
        )}
        {isInTable && [
          <MenuItem
            key="add-col"
            onClick={() => {
              editor.chain().focus().addColumnAfter().run()
              setTableAnchor(null)
            }}
          >
            <ListItemIcon>
              <ViewColumn fontSize="small" />
            </ListItemIcon>
            <ListItemText>Add Column After</ListItemText>
          </MenuItem>,
          <MenuItem
            key="add-row"
            onClick={() => {
              editor.chain().focus().addRowAfter().run()
              setTableAnchor(null)
            }}
          >
            <ListItemIcon>
              <TableRows fontSize="small" />
            </ListItemIcon>
            <ListItemText>Add Row After</ListItemText>
          </MenuItem>,
          <MenuItem
            key="del-col"
            onClick={() => {
              editor.chain().focus().deleteColumn().run()
              setTableAnchor(null)
            }}
          >
            <ListItemIcon>
              <DeleteOutline fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete Column</ListItemText>
          </MenuItem>,
          <MenuItem
            key="del-row"
            onClick={() => {
              editor.chain().focus().deleteRow().run()
              setTableAnchor(null)
            }}
          >
            <ListItemIcon>
              <DeleteOutline fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete Row</ListItemText>
          </MenuItem>,
          <MenuItem
            key="del-table"
            onClick={() => {
              editor.chain().focus().deleteTable().run()
              setTableAnchor(null)
            }}
          >
            <ListItemIcon>
              <DeleteOutline fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: "error.main" }}>Delete Table</ListItemText>
          </MenuItem>,
        ]}
      </Menu>

      <Sep />

      {/* Undo / Redo */}
      <ToolBtn
        icon={<Undo fontSize="small" />}
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      />
      <ToolBtn
        icon={<Redo fontSize="small" />}
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      />
    </Box>
  )
}
