"use client";

import { useParams } from "next/navigation";
import { Box, Typography, Paper, Button, Chip, Skeleton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import Link from "next/link";
import { useCasinoBySlug } from "@/hooks/useCasinos";
import { useAuth } from "@/contexts/AuthContext";
import { STATUS_LABELS } from "@/lib/constants";
import type { CreatedBy } from "@/lib/types";

function AuthorLine({ label, author }: { label: string; author: CreatedBy | null | undefined }) {
  if (!author) return null;
  return (
    <Typography variant="body2" color="text.secondary">
      {label}: {author.name ?? author.email}
    </Typography>
  );
}

export default function CasinoViewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: casino, isLoading } = useCasinoBySlug(slug);
  const { user } = useAuth();

  const canEdit =
    user?.role === "super_admin" ||
    user?.role === "admin" ||
    casino?.createdBy?.id === user?.id;

  if (isLoading || !casino) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/casinos" sx={{ mb: 2 }}>Back</Button>
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "flex-start" }, mb: 2, gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/casinos">Back to Casinos</Button>
        {canEdit && (
          <Button component={Link} href={`/casinos/${casino.slug}/edit`} variant="contained" color="primary" startIcon={<EditIcon />}>
            Edit
          </Button>
        )}
      </Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>{casino.casinoName}</Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>{casino.slug}</Typography>
      <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
        <AuthorLine label="Created by" author={casino.createdBy ?? undefined} />
        <AuthorLine label="Updated by" author={casino.updatedBy ?? undefined} />
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: "hidden" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
          {casino.featureImg && (
            <Box component="img" src={casino.featureImg} alt="" sx={{ width: 120, height: 120, borderRadius: 2, objectFit: "cover" }} />
          )}
          <Box>
            <Chip label={STATUS_LABELS[casino.status] ?? casino.status} color={casino.status === "published" ? "success" : "default"} size="small" sx={{ mb: 1 }} />
            <Typography variant="body2">Rating: ★ {casino.rating ?? "—"} ({casino.reviewCount} reviews)</Typography>
            {casino.bonusAmt && <Typography variant="body2">Bonus: {casino.bonusAmt}</Typography>}
            {casino.totalGames != null && <Typography variant="body2">Games: {casino.totalGames.toLocaleString("en-US")}</Typography>}
          </Box>
        </Box>
        {casino.bonusDetails?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Bonus details</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {casino.bonusDetails.map((d, i) => <Chip key={i} label={d} size="small" />)}
            </Box>
          </Box>
        )}
        {casino.tags?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Tags</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {casino.tags.map((t, i) => <Chip key={i} label={t} size="small" variant="outlined" />)}
            </Box>
          </Box>
        )}
        {casino.payoutSpeed && <Typography variant="body2" sx={{ mb: 1 }}>Payout speed: {casino.payoutSpeed}</Typography>}
        {casino.clientLink && (
          <Typography variant="body2">
            Client link: <a href={casino.clientLink} target="_blank" rel="noopener noreferrer">{casino.clientLink}</a>
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          Last updated: {new Date(casino.updatedAt).toLocaleString("en-US", { timeZone: "UTC" })}
        </Typography>
      </Paper>
    </Box>
  );
}
