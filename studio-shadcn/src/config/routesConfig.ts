import { Microchip, ListCheck, LayoutDashboard } from "lucide-react";
import Dashboard from "../pages/dashboard";
import Analytics from "../pages/analytics";
import Search from "@/pages/search";

//Authentication
import Login from "../utils/zitadel/login";
import RegistrationForm from "../utils/zitadel/registration";
import VerifyEmail from "../utils/zitadel/VerifyEmail";
import RecoveryPage from "../utils/zitadel/recovery";
import Callback from "../utils/zitadel/redirect";

//Settings
import SecuritySettings from "../pages/website/TwoFactorAuthManagement";
import EditWebsite from "../pages/website/EditWebsite";
import Branding from "../pages/website/Branding";
import AnalyticsForm from "../pages/website/AnalyticsForm";
import CodeInjection from "../pages/website/CodeInjection";

//Tokens
import Tokens from "../pages/tokens";
import CreateSpaceTokenForm from "../pages/tokens/components/CreateToken";

//Formats
import Formats from "../pages/formats";
import CreateFormat from "../pages/formats/CreateFormat";
import EditFormat from "../pages/formats/EditFormat";

//Categories
import Categories from "../pages/categories";
import CreateCategory from "../pages/categories/CreateCategory";
import EditCategory from "../pages/categories/EditCategory";

//Post
import Posts from "../pages/posts";
import CreatePost from "../pages/posts/CreatePost";
import EditPost from "../pages/posts/EditPost";

//Fact Checks
import GoogleFactCheck from "../pages/fact-checks/GoogleFactCheck";
import Factly from "../pages/fact-checks/Factly";
import FactCheck from "../pages/fact-checks";
import CreateFactCheck from "../pages/fact-checks/CreateFactCheck";
import EditFactCheck from "../pages/fact-checks/EditFactCheck";

//Tags
import Tags from "../pages/tags";
import CreateTag from "../pages/tags/CreateTag";
import EditTag from "../pages/tags/EditTag";

//Claims
import Claims from "../pages/claims";
import CreateClaim from "../pages/claims/CreateClaim";
import EditClaim from "../pages/claims/EditClaim";

// Users & Permissions
import Users from "../pages/users";
import PermissionList from "../pages/users/PermissionList";

// Menu
import Menu from "../pages/menu";
import CreateMenu from "../pages/menu/CreateMenu";
import EditMenu from "../pages/menu/EditMenu";

//Ratings
import Ratings from "../pages/ratings/";
import CreateRating from "../pages/ratings/CreateRating";
import EditRating from "../pages/ratings/EditRating";

// //Claimants
import Claimants from "../pages/claimants";
import CreateClaimant from "../pages/claimants/CreateClaimant";
import EditClaimant from "../pages/claimants/EditClaimant";

//Spaces
import Spaces from "../pages/spaces";
import CreateSpace from "../pages/spaces/CreateSpace";
import EditSpace from "../pages/spaces/EditSpace";
import Reindex from "../pages/spaces/Reindex";

//Organisations
import Organisations from "../pages/organisations/index";
import AddUsers from "../pages/organisations/AddUsers";

//Media
import Media from "../pages/media";
import UploadMedium from "../pages/media/UploadMedium";
import EditMedium from "../pages/media/EditMedium";

//Policies
import Policies from "../pages/policies";
import CreatePolicy from "../pages/policies/CreatePolicy";
import EditPolicy from "../pages/policies/EditPolicy";
import ViewPolicy from "../pages/policies/components/ViewPolicy";

//Pages
import Pages from "../pages/pages";
import CreatePage from "../pages/pages/CreatePage";
import EditPage from "../pages/pages/EditPage";

//Webhooks
import Webhooks from "../pages/webhooks";
import CreateWebhook from "../pages/webhooks/CreateWebhook";
import EditWebhook from "../pages/webhooks/EditWebhook";

export interface Route {
  path: string;
  title: string;
  Component?: React.ComponentType<any>;
  permission?: {
    resource: string;
    action: string | string[];
    isSpace?: boolean;
  };
  isAdmin?: boolean;
  isOwner?: boolean;
  menuKey?: string;
}

export interface SidebarItem {
  title: string;
  Icon: React.ComponentType<any>;
  children: Route[];
  isService: boolean;
}

export const routes = {
  // Dashboard routes
  home: {
    path: "/",
    title: "Home",
    menuKey: "/",
    Component: Dashboard,
  },
  analytics: {
    path: "/analytics",
    title: "Analytics",
    menuKey: "/analytics",
    Component: Analytics,
  },
  search: {
    path: "/search",
    title: "Search",
    menuKey: "/search",
    Component: Search,
  },
  login: {
    path: "/auth/login",
    title: "Login",
    menuKey: "/login",
    Component: Login,
  },
  registration: {
    path: "/auth/registration",
    title: "Registration",
    menuKey: "/registration",
    Component: RegistrationForm,
  },
  emailverification: {
    path: "/auth/verify",
    menuKey: "/auth/verify",
    Component: VerifyEmail,
    title: "Verify Email",
  },
  recovery: {
    path: "/auth/login/recovery",
    menuKey: "/auth/login/recovery",
    Component: RecoveryPage,
    title: "Recovery Page",
  },
  redirect: {
    path: "/redirect",
    menuKey: "/redirect",
    Component: Callback,
  },
  SecuritySettings: {
    path: "/settings/website/authentication",
    menuKey: "/website",
    Component: SecuritySettings,
    title: "Authentication",
  },
  tokens: {
    path: "/settings/advanced/tokens",
    menuKey: "/tokens",
    Component: Tokens,
    title: "Tokens",
  },
  createTokens: {
    path: "/settings/advanced/tokens/create",
    menuKey: "/tokens",
    Component: CreateSpaceTokenForm,
    title: "New Token",
  },
  pages: {
    path: "/pages",
    menuKey: "/pages",
    Component: Pages,
    title: "Pages",
  },
  createPage: {
    path: "/pages/create",
    menuKey: "/pages",
    Component: CreatePage,
    title: "New Page",
    permission: {
      resource: "pages",
      action: "create",
    },
  },
  editPage: {
    path: "/pages/:id/edit",
    menuKey: "/pages",
    Component: EditPage,
    title: "Edit",
    permission: {
      resource: "pages",
      action: "update",
    },
  },
  categories: {
    path: "/categories",
    menuKey: "/categories",
    Component: Categories,
    title: "Categories",
    permission: {
      resource: "categories",
      action: "get",
    },
  },
  createCategory: {
    path: "/categories/create",
    menuKey: "/categories",
    Component: CreateCategory,
    title: "New Category",
    permission: {
      resource: "categories",
      action: "create",
    },
  },
  editCategory: {
    path: "/categories/:id/edit",
    menuKey: "/categories",
    Component: EditCategory,
    title: "Edit",
    permission: {
      resource: "categories",
      action: "update",
    },
  },
  tags: {
    path: "/tags",
    menuKey: "/tags",
    Component: Tags,
    title: "Tags",
    permission: {
      resource: "tags",
      action: "get",
    },
  },
  createTag: {
    path: "/tags/create",
    menuKey: "/tags",
    Component: CreateTag,
    title: "New Tag",
    permission: {
      resource: "tags",
      action: "create",
    },
  },
  editTag: {
    path: "/tags/:id/edit",
    menuKey: "/tags",
    Component: EditTag,
    title: "Edit",
    permission: {
      resource: "tags",
      action: "update",
    },
  },
  media: {
    path: "/media",
    menuKey: "/media",
    Component: Media,
    title: "Media",
    permission: {
      resource: "media",
      action: "get",
    },
  },
  createMedia: {
    path: "/media/upload",
    menuKey: "/media",
    Component: UploadMedium,
    title: "Upload",
    permission: {
      resource: "media",
      action: "create",
    },
  },
  editMedium: {
    path: "/media/:id/edit",
    menuKey: "/media",
    Component: EditMedium,
    title: "Edit",
    permission: {
      resource: "media",
      action: "update",
    },
  },
  policies: {
    path: "/settings/members/policies",
    menuKey: "/members",
    Component: Policies,
    title: "Policies",
  },
  createPolicy: {
    path: "/settings/members/policies/create",
    menuKey: "/members",
    Component: CreatePolicy,
    title: "New Policy",
    permission: {
      resource: "policies",
      action: "create",
    },
  },
  ViewPolicy: {
    path: "/settings/members/policies/:policyID/view",
    menuKey: "/members",
    Component: ViewPolicy,
    title: "Policy",
  },
  editPolicy: {
    path: "/settings/members/policies/:id/edit",
    menuKey: "/members",
    Component: EditPolicy,
    title: "Edit",
    permission: {
      resource: "policies",
      action: "update",
    },
  },
  branding: {
    path: "/settings/website/branding",
    menuKey: "/website",
    Component: Branding,
    title: "Branding",
    permission: {
      resource: "spaces",
      action: "update",
    },
  },
  menu: {
    path: "/settings/website/menus",
    menuKey: "/website",
    Component: Menu,
    title: "Menus",
  },
  createMenu: {
    path: "/settings/website/menus/create",
    menuKey: "/website",
    Component: CreateMenu,
    title: "New Menu",
    permission: {
      resource: "menus",
      action: "create",
    },
  },
  editMenu: {
    path: "/settings/website/menus/:id/edit",
    menuKey: "/website",
    Component: EditMenu,
    title: "Edit",
    permission: {
      resource: "menus",
      action: "update",
    },
  },
  organisations: {
    path: "/organisations",
    menuKey: "/organisations",
    Component: Organisations,
    title: "Organisations",
  },
  addusers: {
    path: "/settings/organisations/addusers",
    menuKey: "/organisations",
    Component: AddUsers,
    title: "Add Users",
  },
  analyticsForm: {
    path: "/settings/website/analytics",
    menuKey: "/website",
    Component: AnalyticsForm,
    title: "Analytics",
    permission: {
      resource: "spaces",
      action: "update",
    },
  },
  codeInjection: {
    path: "/settings/website/code-injection",
    menuKey: "/website",
    Component: CodeInjection,
    title: "Code Injection",
    permission: {
      resource: "spaces",
      action: "update",
    },
  },

  formats: {
    path: "/settings/advanced/formats",
    menuKey: "/advanced",
    Component: Formats,
    title: "Formats",
    permission: {
      resource: "formats",
      action: "get",
    },
  },
  createFormat: {
    path: "/settings/advanced/formats/create",
    menuKey: "/advanced",
    Component: CreateFormat,
    title: "New Format",
    permission: {
      resource: "formats",
      action: "create",
    },
  },
  editFormat: {
    path: "/settings/advanced/formats/:id/edit",
    menuKey: "/advanced",
    Component: EditFormat,
    title: "Edit",
    permission: {
      resource: "formats",
      action: "update",
    },
  },

  webhooks: {
    path: "/settings/advanced/webhooks",
    menuKey: "/advanced",
    Component: Webhooks,
    title: "Webhooks",
    permission: {
      resource: "webhooks",
      action: "get",
    },
  },
  createWebhook: {
    path: "/settings/advanced/webhooks/create",
    menuKey: "/advanced",
    Component: CreateWebhook,
    title: "New Webhook",
    permission: {
      resource: "webhooks",
      action: "create",
    },
  },
  editWebhook: {
    path: "/settings/advanced/webhooks/:id/edit",
    menuKey: "/advanced",
    Component: EditWebhook,
    title: "Edit",
    permission: {
      resource: "webhooks",
      action: "update",
    },
  },
  claimants: {
    path: "/claimants",
    menuKey: "/claimants",
    Component: Claimants,
    title: "Claimants",
    permission: {
      resource: "claimants",
      action: "get",
    },
  },
  createClaimant: {
    path: "/claimants/create",
    menuKey: "/claimants",
    Component: CreateClaimant,
    title: "New Claimant",
    permission: {
      resource: "claimants",
      action: "create",
    },
  },
  editClaimant: {
    path: "/claimants/:id/edit",
    menuKey: "/claimants",
    Component: EditClaimant,
    title: "Edit",
    permission: {
      resource: "claimants",
      action: "update",
    },
  },
  claims: {
    path: "/claims",
    menuKey: "/claims",
    Component: Claims,
    title: "Claims",
    permission: {
      resource: "claims",
      action: "get",
    },
  },
  createClaim: {
    path: "/claims/create",
    menuKey: "/claims",
    Component: CreateClaim,
    title: "New Claim",
    permission: {
      resource: "claims",
      action: "create",
    },
  },
  editClaim: {
    path: "/claims/:id/edit",
    menuKey: "/claims",
    Component: EditClaim,
    title: "Edit",
    permission: {
      action: "update",
      resource: "claims",
    },
  },
  posts: {
    path: "/posts",
    menuKey: "/posts",
    Component: Posts,
    title: "Posts",
  },
  createPost: {
    path: "/posts/create",
    menuKey: "/posts",
    Component: CreatePost,
    title: "New Post",
    permission: {
      resource: "posts",
      action: "create",
    },
  },
  editPost: {
    path: "/posts/:id/edit",
    menuKey: "/posts",
    Component: EditPost,
    title: "Edit",
    permission: {
      resource: "posts",
      action: "update",
    },
  },
  factCheck: {
    path: "/fact-checks",
    menuKey: "/fact-checks",
    Component: FactCheck,
    title: "Fact-Checks",
  },
  createFactCheck: {
    path: "/fact-checks/create",
    menuKey: "/fact-checks",
    Component: CreateFactCheck,
    title: "Create",
    permission: {
      resource: "fact-checks",
      action: "create",
    },
  },
  editFactCheck: {
    path: "/fact-checks/:id/edit",
    menuKey: "/fact-checks",
    Component: EditFactCheck,
    title: "Edit",
    permission: {
      action: "update",
      resource: "fact-checks",
    },
  },
  googleFactCheck: {
    path: "/fact-checks/google",
    menuKey: "/fact-checks/google",
    Component: GoogleFactCheck,
    title: "Google",
  },
  sach: {
    path: "/fact-checks/sach",
    menuKey: "/fact-checks/sach",
    Component: Factly,
    title: "Sach",
  },
  ratings: {
    path: "/ratings",
    title: "Ratings",
    menuKey: "/ratings",
    Component: Ratings,
    permission: {
      resource: "ratings",
      action: "get",
    },
  },
  createRating: {
    path: "/ratings/create",
    menuKey: "/ratings",
    Component: CreateRating,
    title: "New Rating",
    permission: {
      resource: "ratings",
      action: "create",
    },
  },
  editRating: {
    path: "/ratings/:id/edit",
    menuKey: "/ratings",
    Component: EditRating,
    title: "Edit",
    permission: {
      resource: "ratings",
      action: "update",
    },
  },
  spaces: {
    path: "/admin/spaces",
    menuKey: "/admin/spaces",
    Component: Spaces,
    title: "Spaces",
  },
  createSpace: {
    path: "/spaces/create",
    menuKey: "/admin/spaces",
    Component: CreateSpace,
    title: "New Space",
    permission: {
      resource: "spaces",
      action: "create",
      isSpace: true,
    },
  },
  editSpace: {
    path: "/admin/spaces/:id/edit",
    menuKey: "/admin/spaces",
    Component: EditSpace,
    title: "Edit",
    permission: {
      resource: "spaces",
      action: "update",
    },
  },
  reindex: {
    path: "/settings/advanced/reindex",
    menuKey: "/advanced",
    Component: Reindex,
    title: "Reindex",
  },
  editWebsite: {
    path: "/settings/website/general",
    menuKey: "/website",
    Component: EditWebsite,
    title: "General",
    permission: {
      resource: "spaces",
      action: "update",
    },
  },
  users: {
    path: "/settings/members",
    menuKey: "/members",
    Component: Users,
    title: "Users",
  },
  usersPermission: {
    path: "/settings/members/:id/permissions",
    menuKey: "/members",
    Component: PermissionList,
    title: "Users Permission ",
    permission: {
      resource: "users",
      action: "get",
    },
  },
};

export const sidebarMenu: SidebarItem[] = [
  {
    title: "Dashboard",
    Icon: LayoutDashboard,
    children: [routes.home, routes.analytics],
    isService: false,
  },
  {
    title: "Core",
    Icon: Microchip,
    children: [
      routes.posts,
      routes.pages,
      routes.categories,
      routes.tags,
      routes.media,
    ],
    isService: true,
  },
  {
    title: "Fact Checking",
    Icon: ListCheck,
    children: [
      routes.factCheck,
      routes.claims,
      routes.claimants,
      routes.ratings,
    ],
    isService: true,
  },
];

export default routes;
