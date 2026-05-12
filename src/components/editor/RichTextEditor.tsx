"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import HighlightIcon from "@mui/icons-material/Highlight";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import ImageIcon from "@mui/icons-material/Image";
import LinkIcon from "@mui/icons-material/Link";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import TableChartIcon from "@mui/icons-material/TableChart";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatParagraphIcon from "@mui/icons-material/FormatAlignLeft";
import TitleIcon from "@mui/icons-material/Title";
import {
  useEditor,
  EditorContent,
  type Content,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { api } from "@/lib/api";
import { ImageWithMenu } from "./EditorImageNode";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

export type RichTextEditorOutput = "html" | "json";

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  output?: RichTextEditorOutput;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
  "aria-label"?: string;
}

const emptyHtml = "<p></p>";
const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };

const TEXT_COLORS = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#b7b7b7",
  "#cccccc",
  "#d9d9d9",
  "#efefef",
  "#f3f3f3",
  "#ffffff",
  "#980000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
];

const HIGHLIGHT_COLORS = [
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#ff00ff",
  "#ff9900",
  "#4a86e8",
  "#efefef",
];

function getInitialContent(
  value: string,
  output: RichTextEditorOutput,
): Content {
  if (!value || value.trim() === "") {
    return output === "html" ? emptyHtml : emptyDoc;
  }
  if (output === "html") {
    return value;
  }
  try {
    return JSON.parse(value) as Content;
  } catch {
    return emptyDoc;
  }
}

/** Heading levels available in the editor (no H1 — page title is the H1). */
const HEADING_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** Apply block format only to the current block (Word-like: one paragraph/heading at a time). */
function applyBlockFormatToCurrentBlock(
  editor: Editor,
  format: "paragraph" | (typeof HEADING_LEVELS)[number],
): void {
  const { state } = editor;
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type.name === "paragraph" || node.type.name === "heading") {
      const from = $from.before(d);
      const to = $from.after(d);
      const chain = editor.chain().focus().setTextSelection({ from, to });
      if (format === "paragraph") {
        chain.setParagraph().run();
      } else {
        // @tiptap Level type is 1–6; extension runtime supports 7–8 (renders <h7>, <h8>).
        chain.toggleHeading({ level: format as never }).run();
      }
      editor
        .chain()
        .focus()
        .setTextSelection(to - 1)
        .run();
      return;
    }
  }
}

function getBlockFormatLabel(editor: Editor): string {
  if (editor.isActive("paragraph") || !editor.isActive("heading")) {
    return "Paragraph";
  }
  for (const level of HEADING_LEVELS) {
    if (editor.isActive("heading", { level })) {
      return `Heading ${level}`;
    }
  }
  return "Paragraph";
}

export function RichTextEditor({
  value,
  onChange,
  output = "html",
  placeholder = "Write your content here…",
  minHeight = 320,
  disabled = false,
  "aria-label": ariaLabel = "Rich text content",
}: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const outputRef = useRef(output);
  outputRef.current = output;

  const [blockFormatAnchor, setBlockFormatAnchor] =
    useState<null | HTMLElement>(null);
  const [colorAnchor, setColorAnchor] = useState<null | HTMLElement>(null);
  const [highlightAnchor, setHighlightAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [imageUploading, setImageUploading] = useState(false);
  const [imageMenuAnchor, setImageMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const imageInputRef = useRef<HTMLInputElement>(null);
  /** After upload: show alt dialog once; on confirm/cancel insert and clear. */
  const [pendingImageInsert, setPendingImageInsert] = useState<{
    url: string;
    pos?: number;
  } | null>(null);
  const [pendingImageAlt, setPendingImageAlt] = useState("");
  /** From URL dialog */
  const [imageUrlDialogOpen, setImageUrlDialogOpen] = useState(false);
  const [imageUrlValue, setImageUrlValue] = useState("");
  const [imageUrlAltValue, setImageUrlAltValue] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        /** No H1 in body — title fields are H1; content uses paragraph + H2–H8. */
        //adding comment to test
        heading: { levels: [...HEADING_LEVELS] as never },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      ImageWithMenu.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          style: "max-width: 100%; height: auto; border-radius: 4px;",
        },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: getInitialContent(value, output),
    editable: !disabled,
    onUpdate: useCallback(({ editor: ed }: { editor: Editor }) => {
      const out = outputRef.current;
      const next = out === "html" ? ed.getHTML() : JSON.stringify(ed.getJSON());
      onChangeRef.current(next);
    }, []),
    editorProps: {
      attributes: {
        "aria-label": ariaLabel,
        class: "rich-text-editor-content",
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf("image") !== -1) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file && editor) {
              setImageUploading(true);
              api
                .uploadImage(file)
                .then((url) => {
                  setPendingImageInsert({ url });
                  setPendingImageAlt("");
                })
                .catch(() => {})
                .finally(() => setImageUploading(false));
            }
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (moved) return false;
        const files = event.dataTransfer?.files;
        if (!files?.length || !editor) return false;
        const file = Array.from(files).find((f) => f.type.startsWith("image/"));
        if (!file) return false;
        event.preventDefault();
        setImageUploading(true);
        const pos =
          view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ??
          editor.state.selection.from;
        api
          .uploadImage(file)
          .then((url) => {
            setPendingImageInsert({ url, pos });
            setPendingImageAlt("");
          })
          .catch(() => {})
          .finally(() => setImageUploading(false));
        return true;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current =
      output === "html" ? editor.getHTML() : JSON.stringify(editor.getJSON());
    const next =
      value || (output === "html" ? emptyHtml : JSON.stringify(emptyDoc));
    if (current !== next) {
      editor.commands.setContent(getInitialContent(value, output), false);
    }
  }, [editor, value, output]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const insertImageFromUrl = () => {
    setImageUrlValue("");
    setImageUrlAltValue("");
    setImageUrlDialogOpen(true);
  };

  const triggerImageUpload = () => {
    imageInputRef.current?.click();
  };

  const commitPendingImageInsert = useCallback(
    (alt: string) => {
      if (!editor || !pendingImageInsert) return;
      const { url, pos } = pendingImageInsert;
      const altVal = alt?.trim() || undefined;
      if (typeof pos === "number") {
        editor
          .chain()
          .focus()
          .insertContentAt(pos, {
            type: "image",
            attrs: { src: url, alt: altVal },
          })
          .run();
      } else {
        editor.chain().focus().setImage({ src: url, alt: altVal }).run();
      }
      setPendingImageInsert(null);
      setPendingImageAlt("");
    },
    [editor, pendingImageInsert],
  );

  const onImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) return;
    setImageUploading(true);
    try {
      const url = await api.uploadImage(file);
      setPendingImageInsert({ url });
      setPendingImageAlt("");
    } catch {
      // upload error
    } finally {
      setImageUploading(false);
    }
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href ?? "";
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  const insertTable = () => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  if (!editor) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          minHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
        }}
      >
        Loading editor…
      </Paper>
    );
  }

  const blockLabel = getBlockFormatLabel(editor);

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 0.25,
          px: 0.5,
          py: 0.5,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "grey.50",
          minHeight: 48,
        }}
      >
        {/* Undo / Redo */}
        <Tooltip title="Undo">
          <span>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              aria-label="Undo"
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo">
          <span>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              aria-label="Redo"
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Block format */}
        <ToggleButton
          size="small"
          value="block"
          onClick={(e) => setBlockFormatAnchor(e.currentTarget)}
          sx={{
            minWidth: 112,
            justifyContent: "space-between",
            textTransform: "none",
          }}
          aria-label="Block format"
        >
          {blockLabel}
          <Box component="span" sx={{ ml: 0.5, fontSize: "0.75rem" }}>
            ▼
          </Box>
        </ToggleButton>
        <Menu
          anchorEl={blockFormatAnchor}
          open={!!blockFormatAnchor}
          onClose={() => setBlockFormatAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <MenuItem
            onClick={() => {
              applyBlockFormatToCurrentBlock(editor, "paragraph");
              setBlockFormatAnchor(null);
            }}
          >
            <ListItemIcon>
              <FormatParagraphIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Paragraph</ListItemText>
          </MenuItem>
          {HEADING_LEVELS.map((level) => (
            <MenuItem
              key={level}
              onClick={() => {
                applyBlockFormatToCurrentBlock(editor, level);
                setBlockFormatAnchor(null);
              }}
            >
              <ListItemIcon>
                <TitleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{`Heading ${level}`}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Text formatting */}
        <ToggleButtonGroup
          size="small"
          sx={{ "& .MuiToggleButton-root": { px: 0.75 } }}
        >
          <ToggleButton
            value="bold"
            selected={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            <Tooltip title="Bold">
              <FormatBoldIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="italic"
            selected={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            <Tooltip title="Italic">
              <FormatItalicIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="underline"
            selected={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Underline"
          >
            <Tooltip title="Underline">
              <FormatUnderlinedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="strike"
            selected={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Strikethrough"
          >
            <Tooltip title="Strikethrough">
              <StrikethroughSIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Text color */}
        <Tooltip title="Text color">
          <IconButton
            size="small"
            onClick={(e) => setColorAnchor(e.currentTarget)}
            aria-label="Text color"
          >
            <FormatColorTextIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={colorAnchor}
          open={!!colorAnchor}
          onClose={() => setColorAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <Box
            sx={{
              p: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              width: 200,
            }}
          >
            {TEXT_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => {
                  editor.chain().focus().setColor(c).run();
                  setColorAnchor(null);
                }}
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: c,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 0.5,
                  cursor: "pointer",
                  "&:hover": { opacity: 0.9 },
                }}
                aria-label={`Color ${c}`}
              />
            ))}
          </Box>
        </Menu>

        {/* Highlight */}
        <Tooltip title="Highlight">
          <IconButton
            size="small"
            onClick={(e) => setHighlightAnchor(e.currentTarget)}
            aria-label="Highlight"
          >
            <HighlightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={highlightAnchor}
          open={!!highlightAnchor}
          onClose={() => setHighlightAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <Box
            sx={{
              p: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              width: 180,
            }}
          >
            {HIGHLIGHT_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => {
                  editor.chain().focus().toggleHighlight({ color: c }).run();
                  setHighlightAnchor(null);
                }}
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: c,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 0.5,
                  cursor: "pointer",
                  "&:hover": { opacity: 0.9 },
                }}
                aria-label={`Highlight ${c}`}
              />
            ))}
          </Box>
        </Menu>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Link & Image */}
        <Tooltip title="Insert link">
          <IconButton
            size="small"
            onClick={setLink}
            aria-label="Insert link"
            color={editor.isActive("link") ? "primary" : "inherit"}
          >
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Insert image">
          <span>
            <IconButton
              size="small"
              onClick={(e) => setImageMenuAnchor(e.currentTarget)}
              disabled={imageUploading}
              aria-label="Insert image"
              aria-haspopup="true"
              aria-expanded={!!imageMenuAnchor}
            >
              <ImageIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Menu
          anchorEl={imageMenuAnchor}
          open={!!imageMenuAnchor}
          onClose={() => setImageMenuAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <MenuItem
            onClick={() => {
              setImageMenuAnchor(null);
              triggerImageUpload();
            }}
            disabled={imageUploading}
          >
            <ListItemIcon>
              <CloudUploadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={imageUploading ? "Uploading…" : "Upload image"}
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setImageMenuAnchor(null);
              insertImageFromUrl();
            }}
          >
            <ListItemIcon>
              <LinkIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="From URL" />
          </MenuItem>
        </Menu>
        <input
          type="file"
          ref={imageInputRef}
          accept="image/jpeg,image/png,image/gif,image/webp"
          style={{ display: "none" }}
          onChange={onImageFileSelect}
        />
        <Tooltip title="Insert table">
          <IconButton
            size="small"
            onClick={insertTable}
            aria-label="Insert table"
          >
            <TableChartIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Alignment */}
        <ToggleButtonGroup
          size="small"
          sx={{ "& .MuiToggleButton-root": { px: 0.5 } }}
        >
          <ToggleButton
            value="left"
            selected={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            aria-label="Align left"
          >
            <Tooltip title="Align left">
              <FormatAlignLeftIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="center"
            selected={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            aria-label="Align center"
          >
            <Tooltip title="Align center">
              <FormatAlignCenterIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="right"
            selected={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            aria-label="Align right"
          >
            <Tooltip title="Align right">
              <FormatAlignRightIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="justify"
            selected={editor.isActive({ textAlign: "justify" })}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            aria-label="Justify"
          >
            <Tooltip title="Justify">
              <FormatAlignJustifyIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Lists & block */}
        <ToggleButtonGroup
          size="small"
          sx={{ "& .MuiToggleButton-root": { px: 0.5 } }}
        >
          <ToggleButton
            value="bullet"
            selected={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Bullet list"
          >
            <Tooltip title="Bullet list">
              <FormatListBulletedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="ordered"
            selected={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Numbered list"
          >
            <Tooltip title="Numbered list">
              <FormatListNumberedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="blockquote"
            selected={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            aria-label="Quote"
          >
            <Tooltip title="Quote">
              <FormatQuoteIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="hr"
            selected={false}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            aria-label="Horizontal rule"
          >
            <Tooltip title="Horizontal rule">
              <HorizontalRuleIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Content area */}
      <Box
        sx={{
          minHeight,
          maxHeight: 560,
          overflow: "auto",
          "& .rich-text-editor-content": {
            outline: "none",
            minHeight: minHeight - 24,
            px: 2.5,
            py: 2,
            lineHeight: 1.6,
            fontSize: "1rem",
            "& p": {
              margin: "0 0 0.75em 0",
              minHeight: "1.6em",
            },
            "& h2": {
              fontSize: "1.5rem",
              fontWeight: 600,
              lineHeight: 1.35,
              margin: "1.1em 0 0.45em 0",
              "&:first-of-type": { marginTop: 0 },
            },
            "& h3": {
              fontSize: "1.35rem",
              fontWeight: 600,
              lineHeight: 1.38,
              margin: "1.05em 0 0.42em 0",
              "&:first-of-type": { marginTop: 0 },
            },
            "& h4": {
              fontSize: "1.25rem",
              fontWeight: 600,
              lineHeight: 1.4,
              margin: "1em 0 0.4em 0",
              "&:first-of-type": { marginTop: 0 },
            },
            "& h5": {
              fontSize: "1.125rem",
              fontWeight: 600,
              lineHeight: 1.42,
              margin: "0.95em 0 0.38em 0",
              "&:first-of-type": { marginTop: 0 },
            },
            "& h6": {
              fontSize: "1.0625rem",
              fontWeight: 600,
              lineHeight: 1.45,
              margin: "0.9em 0 0.35em 0",
              "&:first-of-type": { marginTop: 0 },
            },
            "& h7": {
              fontSize: "1rem",
              fontWeight: 600,
              lineHeight: 1.45,
              margin: "0.85em 0 0.32em 0",
              "&:first-of-type": { marginTop: 0 },
            },
            "& h8": {
              fontSize: "0.9375rem",
              fontWeight: 600,
              lineHeight: 1.45,
              margin: "0.8em 0 0.3em 0",
              "&:first-of-type": { marginTop: 0 },
            },
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 1,
              display: "block",
            },
            "& blockquote": {
              borderLeft: "4px solid",
              borderColor: "divider",
              pl: 2,
              py: 0.5,
              my: 1,
              color: "text.secondary",
              marginLeft: 0,
            },
            "& ul, & ol": {
              pl: 2.5,
              my: "0.75em",
              "& li": { marginBottom: "0.25em" },
            },
            "& table": { borderCollapse: "collapse", width: "100%", my: 2 },
            "& th, & td": {
              border: "1px solid",
              borderColor: "divider",
              px: 1.5,
              py: 1,
              textAlign: "left",
            },
            "& th": { bgcolor: "action.hover", fontWeight: 600 },
          },
          "& .tiptap p.is-editor-empty:first-child::before": {
            color: "text.disabled",
            content: `attr(data-placeholder)`,
            float: "left",
            height: 0,
            pointerEvents: "none",
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Alt text dialog after image upload (shown once; cancel = insert without alt) */}
      <Dialog
        open={!!pendingImageInsert}
        onClose={() => commitPendingImageInsert("")}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Alt text (for SEO)</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Alt text"
            value={pendingImageAlt}
            onChange={(e) => setPendingImageAlt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitPendingImageInsert(pendingImageAlt);
              }
            }}
            margin="dense"
            helperText="Optional. You can edit this later via the image menu."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => commitPendingImageInsert("")}>Skip</Button>
          <Button
            variant="contained"
            onClick={() => commitPendingImageInsert(pendingImageAlt)}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* From URL dialog */}
      <Dialog
        open={imageUrlDialogOpen}
        onClose={() => setImageUrlDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Insert image from URL</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Image URL"
            value={imageUrlValue}
            onChange={(e) => setImageUrlValue(e.target.value)}
            margin="dense"
            placeholder="https://..."
          />
          <TextField
            fullWidth
            label="Alt text (for SEO)"
            value={imageUrlAltValue}
            onChange={(e) => setImageUrlAltValue(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageUrlDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              const url = imageUrlValue.trim();
              if (url && editor) {
                editor
                  .chain()
                  .focus()
                  .setImage({
                    src: url,
                    alt: imageUrlAltValue.trim() || undefined,
                  })
                  .run();
                setImageUrlDialogOpen(false);
              }
            }}
            disabled={!imageUrlValue.trim()}
          >
            Insert
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
