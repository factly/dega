import { Microchip, ListCheck, LayoutDashboard } from "lucide-react";
import { Dashboard } from "../pages/dashboard";
import { Analytics } from "../pages/analytics";
import Posts from "../pages/posts";
import { Pages } from "../pages/pages/index";
import Categories from "../pages/categories";
import Tags from "../pages/tags";
import Media from "../pages/media";
import FactCheck from "../pages/fact-checks";
import Claims from "../pages/claims";
import Claimants from "../pages/claimants";
import Ratings from "../pages/ratings";
import Settings from "../pages/settings";
import CreateRating from "../pages/ratings/CreateRating";
import Login from "../utils/zitadel/login";
import RegistrationForm from "../utils/zitadel/registration";
import VerifyEmail from "../utils/zitadel/VerifyEmail";
import RecoveryPage from "../utils/zitadel/recovery";
import Callback from "../utils/zitadel/redirect";

//Spaces
import Spaces from "../pages/spaces";
import CreateSpace from "../pages/spaces/CreateSpace";
import EditSpace from "../pages/spaces/EditSpace";

//Organisations
import Organisations from "../pages/organisations/index";
import AddUsers from "../pages/organisations/AddUsers";

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

  // Core routes
  posts: {
    path: "/posts",
    title: "Posts",
    menuKey: "/posts",
    Component: Posts,
    permission: {
      resource: "posts",
      action: ["get", "create"],
    },
  },
  pages: {
    path: "/pages",
    title: "Pages",
    menuKey: "/pages",
    Component: Pages,
    permission: {
      resource: "pages",
      action: ["get", "create"],
    },
  },
  categories: {
    path: "/categories",
    title: "Categories",
    menuKey: "/categories",
    Component: Categories,
    permission: {
      resource: "categories",
      action: "get",
    },
  },
  tags: {
    path: "/tags",
    title: "Tags",
    menuKey: "/tags",
    Component: Tags,
    permission: {
      resource: "tags",
      action: "get",
    },
  },
  media: {
    path: "/media",
    title: "Media",
    menuKey: "/media",
    Component: Media,
    permission: {
      resource: "media",
      action: "get",
    },
  },

  organisations: {
    path: "/settings/organisations",
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

  // Fact checking routes
  factCheck: {
    path: "/fact-checks",
    title: "Fact Checking",
    menuKey: "/fact-checks",
    Component: FactCheck,
    permission: {
      resource: "fact-checks",
      action: ["get", "create"],
    },
  },
  claims: {
    path: "/claims",
    title: "Claims",
    menuKey: "/claims",
    Component: Claims,
    permission: {
      resource: "claims",
      action: ["get", "create"],
    },
  },
  claimants: {
    path: "/claimants",
    title: "Claimants",
    menuKey: "/claimants",
    Component: Claimants,
    permission: {
      resource: "claimants",
      action: "get",
    },
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
  settings: {
    path: "/settings",
    title: "Settings",
    menuKey: "/settings",
    Component: Settings,
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
