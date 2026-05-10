"use client";

import type { SvgIconProps } from "@mui/material";
import LocalFireDepartment from "@mui/icons-material/LocalFireDepartment";
import Whatshot from "@mui/icons-material/Whatshot";
import Casino from "@mui/icons-material/Casino";
import LocalOffer from "@mui/icons-material/LocalOffer";
import Redeem from "@mui/icons-material/Redeem";
import CardGiftcard from "@mui/icons-material/CardGiftcard";
import TrendingUp from "@mui/icons-material/TrendingUp";
import Tag from "@mui/icons-material/Tag";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import Sync from "@mui/icons-material/Sync";
import Percent from "@mui/icons-material/Percent";

/** Explicit map so bundler includes icons (dynamic MuiIcons[key] is tree-shaken). */
export const BONUS_ICON_MAP: Record<string, React.ComponentType<SvgIconProps>> = {
  LocalFireDepartment,
  Whatshot,
  Casino,
  LocalOffer,
  Redeem,
  CardGiftcard,
  TrendingUp,
  Tag,
  AccountBalanceWallet,
  Sync,
  Percent,
};
