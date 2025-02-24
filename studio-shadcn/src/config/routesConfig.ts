import { Microchip, ListCheck, Shield, LayoutDashboard } from "lucide-react";

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
  },
  analytics: {
    path: "/analytics",
    title: "Analytics",
    menuKey: "/analytics",
  },

  //Search route
  search: {
    path: "/search",
    title: "Search",
    menuKey: "/search",
  },

  // Core routes
  posts: {
    path: "/posts",
    title: "Posts",
    menuKey: "/posts",
    permission: {
      resource: "posts",
      action: ["get", "create"],
    },
  },
  pages: {
    path: "/pages",
    title: "Pages",
    menuKey: "/pages",
    permission: {
      resource: "pages",
      action: ["get", "create"],
    },
  },
  categories: {
    path: "/categories",
    title: "Categories",
    menuKey: "/categories",
    permission: {
      resource: "categories",
      action: "get",
    },
  },
  tags: {
    path: "/tags",
    title: "Tags",
    menuKey: "/tags",
    permission: {
      resource: "tags",
      action: "get",
    },
  },
  media: {
    path: "/media",
    title: "Media",
    menuKey: "/media",
    permission: {
      resource: "media",
      action: "get",
    },
  },

  // Fact checking routes
  factCheck: {
    path: "/fact-check",
    title: "Fact Checking",
    menuKey: "/fact-check",
    permission: {
      resource: "fact-checks",
      action: ["get", "create"],
    },
  },
  claims: {
    path: "/claims",
    title: "Claims",
    menuKey: "/claims",
    permission: {
      resource: "claims",
      action: ["get", "create"],
    },
  },
  claimants: {
    path: "/claimants",
    title: "Claimants",
    menuKey: "/claimants",
    permission: {
      resource: "claimants",
      action: "get",
    },
  },
  ratings: {
    path: "/ratings",
    title: "Ratings",
    menuKey: "/ratings",
    permission: {
      resource: "ratings",
      action: "get",
    },
  },
  googleFactCheck: {
    path: "/google-fact-check",
    title: "Google Fact Check",
    menuKey: "/google-fact-check",
  },
  sach: {
    path: "/sach",
    title: "SACH",
    menuKey: "/sach",
  },

  // Administration routes
  spaces: {
    path: "/spaces",
    title: "Spaces",
    menuKey: "/spaces",
    isAdmin: true,
  },
  requests: {
    path: "/requests",
    title: "Requests",
    menuKey: "/requests",
    isOwner: true,
  },
  permissions: {
    path: "/permissions",
    title: "Permissions",
    menuKey: "/permissions",
    isAdmin: true,
  },
  events: {
    path: "/events",
    title: "Events",
    menuKey: "/events",
    isAdmin: true,
  },
  settings: {
    path: "/settings",
    title: "Settings",
    menuKey: "/settings",
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
      routes.googleFactCheck,
      routes.sach,
    ],
    isService: true,
  },
  {
    title: "Administration",
    Icon: Shield,
    children: [
      routes.spaces,
      routes.requests,
      routes.permissions,
      routes.events,
    ],
    isService: false,
  },
];

export default routes;
