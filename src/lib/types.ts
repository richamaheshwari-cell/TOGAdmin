/**
 * Shared types for TOG Admin API (matches backend docs).
 */

export type AdminRole = "super_admin" | "admin" | "editor" | "seo_editor";

export type CasinoStatus = "published" | "draft" | "pending";

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  isActive?: boolean;
  isSystem?: boolean;
  mustChangePassword?: boolean;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  /** Last successful login time (set on login). */
  lastLoginAt?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  mustChangePassword: boolean;
  isSystem: boolean;
  bio: string | null;
  avatarUrl: string | null;
}

/** Editor/author content counts (GET /me and public editor profile). */
export interface EditorStats {
  pagesCreated: number;
  casinosCreated: number;
  casinoArticlesCreated: number;
  gamesCreated?: number;
  gameArticlesCreated?: number;
  blogsCreated?: number;
  newsCreated?: number;
  bonusesCreated?: number;
  bonusArticlesCreated?: number;
}

/** Full current user profile from GET /api/v1/admin/me. */
export interface MeProfile {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  isActive: boolean;
  bio: string | null;
  avatarUrl: string | null;
  profilePublic: boolean;
  showEmailPublicly: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
  /** Set on successful login. */
  lastLoginAt?: string | null;
  /** Who created this admin (POST .../admin-users). */
  createdBy?: CreatedBy | null;
  /** May be omitted by backend; use defaults when rendering. */
  stats?: EditorStats;
}

/** Newsletter subscription (GET /api/v1/admin/newsletter). */
export interface NewsletterSubscription {
  id?: string;
  email: string;
  subscribed: boolean;
  subscribedAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterListResponse {
  items: NewsletterSubscription[];
  total: number;
  page?: number;
  limit?: number;
}

/** Public editor profile from GET /api/v1/public/editors/:id (for "View profile" on frontend). */
export interface PublicEditorProfile {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  email?: string;
  stats: EditorStats;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface CreatedBy {
  id: string;
  name: string | null;
  email: string;
}

export interface Casino {
  id: string;
  casinoName: string;
  slug: string;
  featureImg: string | null;
  rating: number | null;
  status: CasinoStatus;
  reviewCount: number;
  bonusAmt: string | null;
  bonusDetails: string[];
  totalGames: number;
  tags: string[];
  payoutSpeed: string | null;
  clientLink: string | null;
  /** SEO and TipTap body (GET /admin/casino/:slug returns these) */
  seoTitle?: string | null;
  seoDesc?: string | null;
  content?: unknown; // TipTap JSON
  createdById?: string | null;
  updatedById?: string | null;
  createdBy?: CreatedBy | null;
  updatedBy?: CreatedBy | null;
  createdAt: string;
  updatedAt: string;
}

export interface CasinosListResponse {
  items: Casino[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Linked casino on a game (many-to-many). */
export interface GameCasinoLink {
  id: string;
  casinoName: string;
  slug: string;
}

// Games
export interface Game {
  id: string;
  title: string;
  slug: string;
  featureImg: string | null;
  tag: string | null;
  gameProvider: string[];
  gameDetails: string[];
  clientLink: string | null;
  status: CasinoStatus;
  /** Linked casinos (list + GET /admin/game/:slug). */
  casinos?: GameCasinoLink[];
  seoTitle?: string | null;
  seoDesc?: string | null;
  focusKeywords?: string[];
  content?: unknown;
  createdById?: string | null;
  updatedById?: string | null;
  createdBy?: CreatedBy | null;
  updatedBy?: CreatedBy | null;
  createdAt: string;
  updatedAt: string;
}

export interface GamesListResponse {
  items: Game[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Game articles (same shape as casino articles)
export interface GameArticle {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  publishDate: string;
  readTime: string;
  featureImg: string | null;
  content: object | null;
  tags: string[];
  gameSlugs: string[];
  seoTitle: string | null;
  seoDesc: string | null;
  focusKeywords?: string[];
  showInBlog?: boolean;
  showInGameArticle?: boolean;
  showInBonusArticle?: boolean;
  showInCasinoArticle?: boolean;
  status: CasinoStatus;
  createdById?: string | null;
  updatedById?: string | null;
  createdBy?: CreatedBy | null;
  updatedBy?: CreatedBy | null;
  createdAt: string;
  updatedAt: string;
}

export interface GameArticlesListResponse {
  items: GameArticle[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Pages (CMS)
export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  contentHtml: string;
  seoTitle: string | null;
  seoDesc: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdById?: string | null;
  updatedById?: string | null;
  createdBy?: CreatedBy | null;
  updatedBy?: CreatedBy | null;
  createdAt: string;
  updatedAt: string;
}

// Settings (singleton)
export interface Settings {
  id: number;
  siteName: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  supportEmail: string | null;
  socials: Record<string, unknown> | null;
  maintenanceMode: boolean;
  createdAt: string;
  updatedAt: string;
}

// Casino articles
export interface CasinoArticle {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  publishDate: string;
  readTime: string;
  featureImg: string | null;
  content: object | null;
  tags: string[];
  gameSlugs: string[];
  seoTitle: string | null;
  seoDesc: string | null;
  /** SEO focus keywords (array of strings). May be omitted in older API responses. */
  focusKeywords?: string[];
  showInBlog?: boolean;
  showInGameArticle?: boolean;
  showInBonusArticle?: boolean;
  showInCasinoArticle?: boolean;
  status: CasinoStatus;
  createdById?: string | null;
  updatedById?: string | null;
  createdBy?: CreatedBy | null;
  updatedBy?: CreatedBy | null;
  createdAt: string;
  updatedAt: string;
}

export interface CasinoArticlesListResponse {
  items: CasinoArticle[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Blogs (same shape as articles, no gameSlugs; has isFeatured)
export interface Blog {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  publishDate: string;
  readTime: string;
  featureImg: string | null;
  content: object | null;
  tags: string[];
  seoTitle: string | null;
  seoDesc: string | null;
  focusKeywords?: string[];
  showInBlog?: boolean;
  showInGameArticle?: boolean;
  showInBonusArticle?: boolean;
  showInCasinoArticle?: boolean;
  isFeatured: boolean;
  status: CasinoStatus;
  createdById?: string | null;
  updatedById?: string | null;
  createdBy?: CreatedBy | null;
  updatedBy?: CreatedBy | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsListResponse {
  items: Blog[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// News (same shape as articles, no gameSlugs; has isTrending)
export interface News {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  publishDate: string;
  readTime: string;
  featureImg: string | null;
  content: object | null;
  tags: string[];
  seoTitle: string | null;
  seoDesc: string | null;
  focusKeywords?: string[];
  isTrending: boolean;
  status: CasinoStatus;
  createdById?: string | null;
  updatedById?: string | null;
  createdBy?: CreatedBy | null;
  updatedBy?: CreatedBy | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsListResponse {
  items: News[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Bonus
export interface Bonus {
  id: string;
  title: string;
  slug: string;
  featureImg: string | null;
  description: string[];
  clientLink: string | null;
  highlight: string;
  bonusType: string;
  iconKey: string;
  status: CasinoStatus;
  createdById?: string | null;
  updatedById?: string | null;
  createdBy?: CreatedBy | null;
  updatedBy?: CreatedBy | null;
  createdAt: string;
  updatedAt: string;
}

export interface BonusesListResponse {
  items: Bonus[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Bonus article (same shape as casino article; optional bonusId when linked)
export interface BonusArticle {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  publishDate: string;
  readTime: string;
  featureImg: string | null;
  content: object | null;
  tags: string[];
  gameSlugs: string[];
  seoTitle: string | null;
  seoDesc: string | null;
  focusKeywords?: string[];
  showInBlog?: boolean;
  showInGameArticle?: boolean;
  showInBonusArticle?: boolean;
  showInCasinoArticle?: boolean;
  status: CasinoStatus;
  bonusId?: string | null;
  bonus?: { id: string; title: string; slug: string };
  createdById?: string | null;
  updatedById?: string | null;
  createdBy?: CreatedBy | null;
  updatedBy?: CreatedBy | null;
  createdAt: string;
  updatedAt: string;
}

export interface BonusArticlesListResponse {
  items: BonusArticle[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Role editors (for reassign dropdown)
export interface RoleEditor {
  id: string;
  name: string | null;
  email: string;
  role: AdminRole;
}

// Reassign response (show data.message in UI so admin sees target user has edit/delete rights)
export interface ReassignSummary {
  fromUser: CreatedBy;
  toUser: CreatedBy;
  casinosUpdated: number;
  pagesUpdated: number;
  casinoArticlesUpdated: number;
  totalReassigned: number;
}

export interface ReassignResponse {
  reassigned: true;
  message?: string;
  summary?: ReassignSummary;
  fromUserId: string;
  toUserId: string;
  casinosUpdated: number;
  pagesUpdated: number;
  casinoArticlesUpdated: number;
}

// Role assignment history (who assigned / role_updated / revoked)
export type RoleHistoryAction = "assigned" | "role_updated" | "revoked";

export interface RoleHistoryItem {
  id: string;
  action: RoleHistoryAction;
  previousRole: string | null;
  newRole: string | null;
  createdAt: string;
  performedBy: CreatedBy;
  targetUser: CreatedBy;
  reassignedTo?: CreatedBy | null;
}

export interface RoleHistoryListResponse {
  items: RoleHistoryItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Revoke user response
export interface RevokeUserResponse {
  revoked: boolean;
  message?: string;
  casinosReassigned?: number;
  pagesReassigned?: number;
  casinoArticlesReassigned?: number;
}

// Dashboard API types (GET /api/v1/admin/dashboard)
export type DashboardContentType =
  | "pages"
  | "casinos"
  | "casino_articles"
  | "games"
  | "game_articles"
  | "blogs"
  | "news"
  | "bonuses"
  | "bonus_articles";

export interface DashboardStatusSummary {
  type: DashboardContentType;
  label: string;
  draft: number;
  pending: number;
  published: number;
}

export interface DashboardRecentItem {
  id: string;
  type: DashboardContentType;
  title: string;
  status: CasinoStatus;
  updatedAt: string;
  updatedBy?: { id: string; name: string | null; email: string };
}

export interface DashboardEditor {
  id: string;
  name: string | null;
  email: string;
  role: string;
  postCount?: number;
}

export interface DashboardLogin {
  id: string;
  name: string | null;
  email: string;
  role: string;
  lastLoginAt: string;
}

export interface DashboardAdminResponse {
  role: "super_admin" | "admin";
  globalTotals: {
    pages: number;
    casinos: number;
    casinoArticles: number;
    games: number;
    gameArticles: number;
    blogs: number;
    news: number;
    bonuses: number;
    bonusArticles: number;
    subscribers: number;
  };
  globalStatusSummary: DashboardStatusSummary[];
  myStatusSummary: DashboardStatusSummary[];
  recentUpdated: DashboardRecentItem[];
  recentLogins: DashboardLogin[];
  editorsDirectory: DashboardEditor[];
  subscribersCount: number;
}

export interface DashboardEditorResponse {
  role: "editor" | "seo_editor";
  myStatusSummary: DashboardStatusSummary[];
  recentUpdated: DashboardRecentItem[];
  editorsDirectory: DashboardEditor[];
}

export type DashboardResponse = DashboardAdminResponse | DashboardEditorResponse;

export function isAdminDashboard(d: DashboardResponse | undefined | null): d is DashboardAdminResponse {
  return d != null && (d.role === "super_admin" || d.role === "admin");
}
