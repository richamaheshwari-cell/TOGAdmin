"use client";

import { useParams } from "next/navigation";
import { Box, Typography, Paper, Button, Chip, Skeleton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import Link from "next/link";
import { useGameBySlug } from "@/hooks/useGames";
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

export default function GameViewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: game, isLoading } = useGameBySlug(slug);
  const { user } = useAuth();

  const canEdit =
    user?.role === "super_admin" ||
    user?.role === "admin" ||
    game?.createdBy?.id === user?.id;

  if (isLoading || !game) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/games" sx={{ mb: 2 }}>Back</Button>
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "flex-start" }, mb: 2, gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/games">Back to Games</Button>
        {canEdit && (
          <Button component={Link} href={`/games/${game.slug}/edit`} variant="contained" color="primary" startIcon={<EditIcon />}>
            Edit
          </Button>
        )}
      </Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>{game.title}</Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>{game.slug}</Typography>
      <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
        <AuthorLine label="Created by" author={game.createdBy ?? undefined} />
        <AuthorLine label="Updated by" author={game.updatedBy ?? undefined} />
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: "hidden" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
          {game.featureImg && (
            <Box component="img" src={game.featureImg} alt="" sx={{ width: 120, height: 120, borderRadius: 2, objectFit: "cover" }} />
          )}
          <Box>
            <Chip label={STATUS_LABELS[game.status] ?? game.status} color={game.status === "published" ? "success" : "default"} size="small" sx={{ mb: 1 }} />
            {game.tag && <Typography variant="body2">Tag: {game.tag}</Typography>}
          </Box>
        </Box>
        {game.casinos && game.casinos.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Linked casinos
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {game.casinos.map((c) => (
                <Chip key={c.id} label={c.casinoName} size="small" component={Link} href={`/casinos/${c.slug}`} clickable />
              ))}
            </Box>
          </Box>
        )}
        {game.gameProvider?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Providers</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {game.gameProvider.map((p, i) => <Chip key={i} label={p} size="small" />)}
            </Box>
          </Box>
        )}
        {game.gameDetails?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Details</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {game.gameDetails.map((d, i) => <Chip key={i} label={d} size="small" variant="outlined" />)}
            </Box>
          </Box>
        )}
        {game.clientLink && (
          <Typography variant="body2">
            Client link: <a href={game.clientLink} target="_blank" rel="noopener noreferrer">{game.clientLink}</a>
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          Last updated: {new Date(game.updatedAt).toLocaleString("en-US", { timeZone: "UTC" })}
        </Typography>
      </Paper>
    </Box>
  );
}
