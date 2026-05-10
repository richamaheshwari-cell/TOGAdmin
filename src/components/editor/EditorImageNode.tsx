"use client";

import { useState } from "react";
import { Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TitleIcon from "@mui/icons-material/Title";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { NodeViewWrapper } from "@tiptap/react";
import type { ReactNodeViewProps } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { api } from "@/lib/api";

function isUploadPath(src: string | null): boolean {
  if (!src) return false;
  return src.includes("/uploads/images/") || (src.startsWith("/") && src.includes("uploads"));
}

function ImageNodeView({ node, updateAttributes, deleteNode }: ReactNodeViewProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [altDialogOpen, setAltDialogOpen] = useState(false);
  const [altInput, setAltInput] = useState(node.attrs.alt ?? "");
  const [deleting, setDeleting] = useState(false);

  const src = node.attrs.src;
  const alt = node.attrs.alt ?? "";

  const handleEditAlt = () => {
    setMenuAnchor(null);
    setAltInput(alt);
    setAltDialogOpen(true);
  };

  const handleAltConfirm = () => {
    updateAttributes({ alt: altInput.trim() || null });
    setAltDialogOpen(false);
  };

  const handleDelete = async () => {
    setMenuAnchor(null);
    setDeleting(true);
    try {
      if (src && isUploadPath(src)) {
        await api.deleteImage(src);
      }
    } catch {
      // ignore; still remove from doc
    } finally {
      setDeleting(false);
    }
    deleteNode();
  };

  return (
    <NodeViewWrapper as="div" style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
      <Box
        sx={{
          position: "relative",
          "&:hover .editor-image-actions": { opacity: 1 },
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ""}
          style={{ maxWidth: "100%", height: "auto", borderRadius: 4, display: "block", verticalAlign: "middle" }}
          draggable={false}
        />
        <Box
          className="editor-image-actions"
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            opacity: 0,
            transition: "opacity 0.15s",
            bgcolor: "rgba(0,0,0,0.6)",
            borderRadius: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ color: "white" }}
            aria-label="Image options"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleEditAlt}>
          <ListItemIcon><TitleIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit alt text</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} disabled={deleting}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{deleting ? "Removing…" : "Delete image"}</ListItemText>
        </MenuItem>
      </Menu>
      <Dialog open={altDialogOpen} onClose={() => setAltDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Alt text (for SEO)</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Alt text"
            value={altInput}
            onChange={(e) => setAltInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAltConfirm())}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAltDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAltConfirm}>OK</Button>
        </DialogActions>
      </Dialog>
    </NodeViewWrapper>
  );
}

export const ImageWithMenu = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
