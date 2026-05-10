export const ROLES = ["super_admin", "admin", "editor", "seo_editor"] as const;
export const CASINO_STATUSES = ["published", "draft", "pending"] as const;

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  seo_editor: "SEO Editor",
};

export const STATUS_LABELS: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  pending: "Pending",
};

export const BONUS_TYPES = [
  "welcome",
  "no_deposit",
  "free_spins",
  "reload",
  "cashback",
  "vip",
  "referral",
  "tournament",
  "other",
] as const;

/** Icon names from @mui/icons-material used in bonus icon picker. */
export const BONUS_ICON_KEYS = [
  "LocalFireDepartment",
  "HotelClass",
  "Whatshot",
  "Casino",
  "LocalOffer",
  "Redeem",
  "CardGiftcard",
  "TrendingUp",
  "Tag",
  "AccountBalanceWallet",
  "Sync",
  "Percent",
] as const;

export type BonusTypeKey = (typeof BONUS_TYPES)[number];

/** Dashboard content type display labels */
export const DASHBOARD_TYPE_LABELS: Record<string, string> = {
  pages: "Pages",
  casinos: "Casinos",
  casino_articles: "Casino Articles",
  games: "Games",
  game_articles: "Game Articles",
  blogs: "Blogs",
  news: "News",
  bonuses: "Bonuses",
  bonus_articles: "Bonus Articles",
};
