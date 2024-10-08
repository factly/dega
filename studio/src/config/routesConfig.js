import React from 'react';
import {
  HomeOutlined,
  InfoCircleOutlined,
  AudioOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
//Pages
import Dashboard from '../pages/dashboard';
import Analytics from '../pages/analytics';

//Spaces
import Spaces from '../pages/spaces';
import CreateSpace from '../pages/spaces/CreateSpace';
import EditSpace from '../pages/spaces/EditSpace';

//Media
import Media from '../pages/media';
import UploadMedium from '../pages/media/UploadMedium';
import EditMedium from '../pages/media/EditMedium';

//Categories
import Categories from '../pages/categories';
import CreateCategory from '../pages/categories/CreateCategory';
import EditCategory from '../pages/categories/EditCategory';

//Tags
import Tags from '../pages/tags';
import CreateTag from '../pages/tags/CreateTag';
import EditTag from '../pages/tags/EditTag';

//Episodes
import Episodes from '../pages/episodes';
import CreateEpisode from '../pages/episodes/CreateEpisode';
import EditEpisode from '../pages/episodes/EditEpisode';

//Podcasts
import Podcasts from '../pages/podcasts';
import CreatePodcast from '../pages/podcasts/CreatePodcast';
import EditPodcast from '../pages/podcasts/EditPodcast';

//Formats
import Formats from '../pages/formats';
import CreateFormat from '../pages/formats/CreateFormat';
import EditFormat from '../pages/formats/EditFormat';

//Post
import Posts from '../pages/posts';
import CreatePost from '../pages/posts/CreatePost';
import EditPost from '../pages/posts/EditPost';

//Ratings
import Ratings from '../pages/ratings';
import CreateRating from '../pages/ratings/CreateRating';
import EditRating from '../pages/ratings/EditRating';

//Claimants
import Claimants from '../pages/claimants';
import CreateClaimant from '../pages/claimants/CreateClaimant';
import EditClaimant from '../pages/claimants/EditClaimant';

//Claims
import Claims from '../pages/claims';
import CreateClaim from '../pages/claims/CreateClaim';
import EditClaim from '../pages/claims/EditClaim';

//Policies
import Policies from '../pages/policies';
import CreatePolicy from '../pages/policies/CreatePolicy';
import EditPolicy from '../pages/policies/EditPolicy';

//Fact Checks
import GoogleFactCheck from '../pages/fact-checks/GoogleFactCheck';
import Factly from '../pages/fact-checks/Factly';
import FactCheck from '../pages/fact-checks';
import CreateFactCheck from '../pages/fact-checks/CreateFactCheck';
import EditFactCheck from '../pages/fact-checks/EditFactCheck';

// Users & Permissions
import Users from '../pages/users';
import PermissionList from '../pages/users/PermissionList';

// Menu
import Menu from '../pages/menu';
import CreateMenu from '../pages/menu/CreateMenu';
import EditMenu from '../pages/menu/EditMenu';

//Events
import Events from '../pages/events';
import CreateEvent from '../pages/events/CreateEvent';
import EditEvent from '../pages/events/EditEvent';

//Pages
import Pages from '../pages/pages';
import CreatePage from '../pages/pages/CreatePage';
import EditPage from '../pages/pages/EditPage';

//Webhooks
import Webhooks from '../pages/webhooks';
import CreateWebhook from '../pages/webhooks/CreateWebhook';
import EditWebhook from '../pages/webhooks/EditWebhook';

//profile
import Profile from '../pages/profile';

// Settings
import Settings from '../pages/settings';
// Website
import Website from '../pages/website';
import EditWebsite from '../pages/website/EditWebsite';
import CodeInjection from '../pages/website/CodeInjection';
import Branding from '../pages/website/Branding';
import AnalyticsForm from '../pages/website/AnalyticsForm';
import SecuritySettings from '../pages/website/TwoFactorAuthManagement';

// Advanced
import Advanced from '../pages/advanced';
// Members
import Members from '../pages/members';

//Reindex
import Reindex from '../pages/spaces/Reindex';
import ViewPolicy from '../pages/policies/components/ViewPolicy';
import BasicLayout from '../layouts/basic';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import Callback from '../pages/redirect';
import Tokens from '../pages/tokens';
import CreateSpaceTokenForm from '../pages/tokens/components/CreateToken';

//Login
import RegistrationForm from '../utils/zitadel/registration.js';
import LoginEmail from '../utils/zitadel/login';

export function extractV6RouteObject(formats, setReloadFlag, reloadFlag) {
  const extractedRoutes = [];

  // Loop through the original routes object and convert each route to v6 format
  for (const routeKey in routes) {
    const route = routes[routeKey];
    const { path, Component, title, permission, isAdmin, isOwner, menuKey } = route;

    // Create the v6 route element based on the original route data
    let v6RouteElement;

    if (permission) {
      v6RouteElement = (
        <BasicLayout>
          <ProtectedRoute
            key={path}
            permission={permission}
            exact
            path={path}
            component={Component}
            formats={formats}
            setReloadFlag={setReloadFlag}
            reloadFlag={reloadFlag}
          />
        </BasicLayout>
      );
    } else if (isAdmin) {
      v6RouteElement = (
        <BasicLayout>
          <AdminRoute key={path} exact path={path} component={Component} formats={formats} />
        </BasicLayout>
      );
    } else {
      v6RouteElement = (
        <BasicLayout>
          <Component formats={formats} />
        </BasicLayout>
      );
    }

    // Create the v6 route object based on the original route data
    const v6Route = {
      path,
      element: v6RouteElement,
      title,
      ...(permission && { permission }),
      ...(isAdmin && { isAdmin }),
      ...(isOwner && { isOwner }),
    };

    // Check if menuKey exists and add it to the v6 route object
    if (menuKey) {
      v6Route.menuKey = menuKey;
    }

    // Push the v6 route object to the extractedRoutes array
    extractedRoutes.push(v6Route);
  }

  return extractedRoutes;
}
const routes = {
  dashboard: {
    path: '/dashboard',
    menuKey: '/',
    Component: Dashboard,
    title: 'Dashboard',
  },
  home: {
    path: '/',
    menuKey: '/',
    Component: Dashboard, // component is empty for now
    title: 'Home',
  },
  analytics: {
    path: '/analytics',
    menuKey: '/analytics',
    Component: Analytics,
    title: 'Analytics',
  },
  spaces: {
    path: '/admin/spaces',
    menuKey: '/admin/spaces',
    Component: Spaces,
    title: 'Spaces',
  },
  createSpace: {
    path: '/spaces/create',
    menuKey: '/admin/spaces',
    Component: CreateSpace,
    title: 'New Space',
    permission: {
      resource: 'spaces',
      action: 'create',
      isSpace: true,
    },
  },
  editSpace: {
    path: '/admin/spaces/:id/edit',
    menuKey: '/admin/spaces',
    Component: EditSpace,
    title: 'Edit',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  editWebsite: {
    path: '/settings/website/general',
    menuKey: '/website',
    Component: EditWebsite,
    title: 'General',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  codeInjection: {
    path: '/settings/website/code-injection',
    menuKey: '/website',
    Component: CodeInjection,
    title: 'Code Injection',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  SecuritySettings: {
    path: '/settings/website/authentication',
    menuKey: '/website',
    Component: SecuritySettings,
    title: 'Authentication',
  },
  branding: {
    path: '/settings/website/branding',
    menuKey: '/website',
    Component: Branding,
    title: 'Branding',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  analyticsForm: {
    path: '/settings/website/analytics',
    menuKey: '/website',
    Component: AnalyticsForm,
    title: 'Analytics',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  reindex: {
    path: '/settings/advanced/reindex',
    menuKey: '/advanced',
    Component: Reindex,
    title: 'Reindex',
  },
  episodes: {
    path: '/episodes',
    menuKey: '/episodes',
    Component: Episodes,
    title: 'Episodes',
  },
  createEpisode: {
    path: '/episodes/create',
    menuKey: '/episodes',
    Component: CreateEpisode,
    title: 'New Episode',
    permission: {
      resource: 'episodes',
      action: 'create',
    },
  },
  editEpisode: {
    path: '/episodes/:id/edit',
    menuKey: '/episodes',
    Component: EditEpisode,
    title: 'Edit',
    permission: {
      resource: 'episodes',
      action: 'update',
    },
  },
  podcasts: {
    path: '/podcasts',
    menuKey: '/podcasts',
    Component: Podcasts,
    title: 'Podcasts',
  },
  createPodcast: {
    path: '/podcasts/create',
    menuKey: '/podcasts',
    Component: CreatePodcast,
    title: 'New Podcast',
    permission: {
      resource: 'podcasts',
      action: 'create',
    },
  },
  editPodcast: {
    path: '/podcasts/:id/edit',
    menuKey: '/podcasts',
    Component: EditPodcast,
    title: 'Edit',
    permission: {
      resource: 'podcasts',
      action: 'update',
    },
  },
  categories: {
    path: '/categories',
    menuKey: '/categories',
    Component: Categories,
    title: 'Categories',
    permission: {
      resource: 'categories',
      action: 'get',
    },
  },
  createCategory: {
    path: '/categories/create',
    menuKey: '/categories',
    Component: CreateCategory,
    title: 'New Category',
    permission: {
      resource: 'categories',
      action: 'create',
    },
  },
  editCategory: {
    path: '/categories/:id/edit',
    menuKey: '/categories',
    Component: EditCategory,
    title: 'Edit',
    permission: {
      resource: 'categories',
      action: 'update',
    },
  },
  policies: {
    path: '/settings/members/policies',
    menuKey: '/members',
    Component: Policies,
    title: 'Policies',
  },
  createPolicy: {
    path: '/settings/members/policies/create',
    menuKey: '/members',
    Component: CreatePolicy,
    title: 'New Policy',
    permission: {
      resource: 'policies',
      action: 'create',
    },
  },
  ViewPolicy: {
    path: '/settings/members/policies/:policyID/view',
    menuKey: '/members',
    Component: ViewPolicy,
    title: 'Policy',
  },
  editPolicy: {
    path: '/settings/members/policies/:id/edit',
    menuKey: '/members',
    Component: EditPolicy,
    title: 'Edit',
    permission: {
      resource: 'policies',
      action: 'update',
    },
  },
  formats: {
    path: '/settings/advanced/formats',
    menuKey: '/advanced',
    Component: Formats,
    title: 'Formats',
    permission: {
      resource: 'formats',
      action: 'get',
    },
  },
  createFormat: {
    path: '/settings/advanced/formats/create',
    menuKey: '/advanced',
    Component: CreateFormat,
    title: 'New Format',
    permission: {
      resource: 'formats',
      action: 'create',
    },
  },
  editFormat: {
    path: '/settings/advanced/formats/:id/edit',
    menuKey: '/advanced',
    Component: EditFormat,
    title: 'Edit',
    permission: {
      resource: 'formats',
      action: 'update',
    },
  },
  tags: {
    path: '/tags',
    menuKey: '/tags',
    Component: Tags,
    title: 'Tags',
    permission: {
      resource: 'tags',
      action: 'get',
    },
  },
  createTag: {
    path: '/tags/create',
    menuKey: '/tags',
    Component: CreateTag,
    title: 'New Tag',
    permission: {
      resource: 'tags',
      action: 'create',
    },
  },
  editTag: {
    path: '/tags/:id/edit',
    menuKey: '/tags',
    Component: EditTag,
    title: 'Edit',
    permission: {
      resource: 'tags',
      action: 'update',
    },
  },
  media: {
    path: '/media',
    menuKey: '/media',
    Component: Media,
    title: 'Media',
    permission: {
      resource: 'media',
      action: 'get',
    },
  },
  createMedia: {
    path: '/media/upload',
    menuKey: '/media',
    Component: UploadMedium,
    title: 'Upload',
    permission: {
      resource: 'media',
      action: 'create',
    },
  },
  editMedium: {
    path: '/media/:id/edit',
    menuKey: '/media',
    Component: EditMedium,
    title: 'Edit',
    permission: {
      resource: 'media',
      action: 'update',
    },
  },
  posts: {
    path: '/posts',
    menuKey: '/posts',
    Component: Posts,
    title: 'Posts',
  },
  createPost: {
    path: '/posts/create',
    menuKey: '/posts',
    Component: CreatePost,
    title: 'New Post',
    permission: {
      resource: 'posts',
      action: 'create',
    },
  },
  editPost: {
    path: '/posts/:id/edit',
    menuKey: '/posts',
    Component: EditPost,
    title: 'Edit',
    permission: {
      resource: 'posts',
      action: 'update',
    },
  },
  ratings: {
    path: '/ratings',
    menuKey: '/ratings',
    Component: Ratings,
    title: 'Ratings',
    permission: {
      resource: 'ratings',
      action: 'get',
    },
  },
  createRating: {
    path: '/ratings/create',
    menuKey: '/ratings',
    Component: CreateRating,
    title: 'New Rating',
    permission: {
      resource: 'ratings',
      action: 'create',
    },
  },
  editRating: {
    path: '/ratings/:id/edit',
    menuKey: '/ratings',
    Component: EditRating,
    title: 'Edit',
    permission: {
      resource: 'ratings',
      action: 'update',
    },
  },
  claimants: {
    path: '/claimants',
    menuKey: '/claimants',
    Component: Claimants,
    title: 'Claimants',
    permission: {
      resource: 'claimants',
      action: 'get',
    },
  },
  createClaimant: {
    path: '/claimants/create',
    menuKey: '/claimants',
    Component: CreateClaimant,
    title: 'New Claimant',
    permission: {
      resource: 'claimants',
      action: 'create',
    },
  },
  editClaimant: {
    path: '/claimants/:id/edit',
    menuKey: '/claimants',
    Component: EditClaimant,
    title: 'Edit',
    permission: {
      resource: 'claimants',
      action: 'update',
    },
  },
  claims: {
    path: '/claims',
    menuKey: '/claims',
    Component: Claims,
    title: 'Claims',
    permission: {
      resource: 'claims',
      action: 'get',
    },
  },
  createClaim: {
    path: '/claims/create',
    menuKey: '/claims',
    Component: CreateClaim,
    title: 'New Claim',
    permission: {
      resource: 'claims',
      action: 'create',
    },
  },
  editClaim: {
    path: '/claims/:id/edit',
    menuKey: '/claims',
    Component: EditClaim,
    title: 'Edit',
    permission: {
      action: 'update',
      resource: 'claims',
    },
  },
  factCheck: {
    path: '/fact-checks',
    menuKey: '/fact-checks',
    Component: FactCheck,
    title: 'Fact-Checks',
  },
  createFactCheck: {
    path: '/fact-checks/create',
    menuKey: '/fact-checks',
    Component: CreateFactCheck,
    title: 'Create',
    permission: {
      resource: 'fact-checks',
      action: 'create',
    },
  },
  editFactCheck: {
    path: '/fact-checks/:id/edit',
    menuKey: '/fact-checks',
    Component: EditFactCheck,
    title: 'Edit',
    permission: {
      action: 'update',
      resource: 'fact-checks',
    },
  },
  googleFactCheck: {
    path: '/fact-checks/google',
    menuKey: '/fact-checks/google',
    Component: GoogleFactCheck,
    title: 'Google',
  },
  sach: {
    path: '/fact-checks/sach',
    menuKey: '/fact-checks/sach',
    Component: Factly,
    title: 'Sach',
  },
  users: {
    path: '/settings/members',
    menuKey: '/members',
    Component: Users,
    title: 'Users',
  },
  usersPermission: {
    path: '/settings/members/:id/permissions',
    menuKey: '/members',
    Component: PermissionList,
    title: 'Users Permission ',
    permission: {
      resource: 'users',
      action: 'get',
    },
  },
  menu: {
    path: '/settings/website/menus',
    menuKey: '/website',
    Component: Menu,
    title: 'Menus',
  },
  createMenu: {
    path: '/settings/website/menus/create',
    menuKey: '/website',
    Component: CreateMenu,
    title: 'New Menu',
    permission: {
      resource: 'menus',
      action: 'create',
    },
  },
  editMenu: {
    path: '/settings/website/menus/:id/edit',
    menuKey: '/website',
    Component: EditMenu,
    title: 'Edit',
    permission: {
      resource: 'menus',
      action: 'update',
    },
  },
  pages: {
    path: '/pages',
    menuKey: '/pages',
    Component: Pages,
    title: 'Pages',
  },
  createPage: {
    path: '/pages/create',
    menuKey: '/pages',
    Component: CreatePage,
    title: 'New Page',
    permission: {
      resource: 'pages',
      action: 'create',
    },
  },
  editPage: {
    path: '/pages/:id/edit',
    menuKey: '/pages',
    Component: EditPage,
    title: 'Edit',
    permission: {
      resource: 'pages',
      action: 'update',
    },
  },
  events: {
    path: '/admin/events',
    menuKey: '/admin/events',
    Component: Events,
    title: 'Events',
    isAdmin: true,
  },
  createEvent: {
    path: '/admin/events/create',
    menuKey: '/admin/events',
    Component: CreateEvent,
    title: 'New Event',
    isAdmin: true,
  },
  editEvent: {
    path: '/admin/events/:id/edit',
    menuKey: '/admin/events',
    Component: EditEvent,
    title: 'Edit',
    isAdmin: true,
  },
  tokens: {
    path: '/settings/advanced/tokens',
    menuKey: '/tokens',
    Component: Tokens,
    title: 'Tokens',
  },
  createTokens: {
    path: '/settings/advanced/tokens/create',
    menuKey: '/tokens',
    Component: CreateSpaceTokenForm,
    title: 'New Token',
  },
  webhooks: {
    path: '/settings/advanced/webhooks',
    menuKey: '/advanced',
    Component: Webhooks,
    title: 'Webhooks',
    permission: {
      resource: 'webhooks',
      action: 'get',
    },
  },
  createWebhook: {
    path: '/settings/advanced/webhooks/create',
    menuKey: '/advanced',
    Component: CreateWebhook,
    title: 'New Webhook',
    permission: {
      resource: 'webhooks',
      action: 'create',
    },
  },
  editWebhook: {
    path: '/settings/advanced/webhooks/:id/edit',
    menuKey: '/advanced',
    Component: EditWebhook,
    title: 'Edit',
    permission: {
      resource: 'webhooks',
      action: 'update',
    },
  },
  profile: {
    path: '/profile',
    menuKey: '/profile',
    Component: Profile,
    title: 'Edit Profile',
  },
  settings: {
    path: '/settings',
    menuKey: '/settings',
    title: 'Settings',
    Component: Settings,
  },
  website: {
    path: '/website',
    menuKey: '/website',
    Component: Website,
    title: 'Website',
  },
  members: {
    path: '/members',
    menuKey: '/members',
    Component: Members,
    title: 'Members',
  },
  advanced: {
    path: '/advanced',
    menuKey: '/advanced',
    Component: Advanced,
    title: 'Advanced',
  },
  registration: {
    path: 'auth/registration',
    menuKey: 'auth/registration',
    Component: RegistrationForm,
    title: 'Registration Form', 
  },
  login: {
    path: '/auth/login',
    menuKey: '/auth/login',
    Component: LoginEmail,
    title: 'Login Email',
  },
  redirect: {
    path: '/redirect',
    menuKey: '/redirect',
    Component: Callback,
  },
  noMatch: {
    path: '*',
    menuKey: '*',
    Component: () => (
      <Result
        status="403"
        title="404"
        subTitle="Sorry, page not found"
        extra={
          <Link to="/">
            <Button type="primary">Back Home</Button>
          </Link>
        }
      />
    ),
  },
};
export const sidebarMenu = [
  {
    title: 'Dashboard',
    Icon: (props) => <HomeOutlined {...props} />,
    children: [routes.home, routes.analytics],
  },
  {
    title: 'Core',
    Icon: (props) => <InfoCircleOutlined {...props} />,
    children: [routes.posts, routes.pages, routes.categories, routes.tags, routes.media],
  },
  {
    title: 'Fact Checking',
    Icon: (props) => <SecurityScanOutlined {...props} />,
    children: [
      routes.factCheck,
      routes.claims,
      routes.claimants,
      routes.ratings,
      routes.googleFactCheck,
      routes.sach,
    ],
  },
  {
    title: 'Podcast',
    Icon: (props) => <AudioOutlined {...props} />,
    children: [routes.episodes, routes.podcasts],
  },
  {
    title: 'Administration',
    Icon: (props) => <GlobalOutlined {...props} />,
    children: [routes.spaces, routes.events],
    isService: false,
  },
];

export default routes;
