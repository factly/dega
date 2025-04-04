import * as React from "react";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  ListChecksIcon as ListCheck,
  type LucideIcon,
  Microchip,
  Search,
  Settings,
  Shield,
} from "lucide-react";
import degaLogoLetters from "@/assets/dega.png";
import degaLogoShort from "@/assets/dega-short.png";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, useLocation } from "react-router-dom";
import { AccountMenu } from "@/components/GlobalNav/AccountMenu";

interface NavSubItem {
  title: string;
  url: string;
}

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: NavSubItem[];
  children?: NavSubItem[];
}

const navMain: NavItem[] = [
  {
    title: "Dashboard",
    url: "#",
    icon: LayoutDashboard,
    items: [
      {
        title: "Home",
        url: "/",
      },
      {
        title: "Analytics",
        url: "/analytics",
      },
    ],
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Core",
    icon: Microchip,
    url: "#",
    items: [
      { title: "Posts", url: "/posts" },
      { title: "Pages", url: "/pages" },
      { title: "Categories", url: "/categories" },
      { title: "Tags", url: "/tags" },
      { title: "Media", url: "/media" },
    ],
  },
  {
    title: "Fact checking",
    icon: ListCheck,
    url: "#",
    children: [
      { title: "Fact-Checks", url: "/fact-checks" },
      { title: "Claims", url: "/claims" },
      { title: "Ratings", url: "/ratings" },
      { title: "Claimants", url: "/claimants" },
      { title: "Google", url: "/fact-checks/google" },
      { title: "Sach", url: "/fact-checks/sach" },
    ],
  },
  {
    title: "Administration",
    icon: Shield,
    url: "#",
    children: [
      { title: "Spaces", url: "/admin/spaces" },
      { title: "Organisations", url: "/organisations" },
    ],
  },
  {
    title: "Settings",
    url: "/settings/website/general",
    icon: Settings,
  },
];

export default function AppSidebar(): React.ReactNode {
  const { state, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();

  const isCollapsed = state === "collapsed" && !isMobile;

  const isItemActive = (path: string) => {
    if (path === location.pathname) return true;
    return false;
  };

  return (
    <Sidebar className={cn("border-r")} collapsible="icon">
      <SidebarContent
        className={cn("p-2 md:py-6", isCollapsed ? "items-center" : "")}
      >
        <div
          className={cn(
            "flex items-center w-full md:mb-4",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isMobile && (
            <img
              src={isCollapsed ? degaLogoShort : degaLogoLetters}
              alt="Dega"
              className="h-8 cursor-pointer"
            />
          )}
          {!isCollapsed && !isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              className="p-2 rounded-md"
              aria-label="Collapse sidebar"
            >
              <ArrowLeftToLine
                className="h-4 w-4"
                stroke="#4E6497"
                strokeWidth="1.5"
              />
            </Button>
          )}
        </div>
        <SidebarMenu>
          {navMain.map((item, index) => {
            const hasSubmenu = !!(item.items || item.children);
            const submenuItems = item.items || item.children || [];

            return (
              <React.Fragment key={index}>
                {hasSubmenu ? (
                  <CollapsibleOrPopoverMenuItem
                    title={item.title}
                    icon={item.icon}
                    isActive={submenuItems.some((subItem) =>
                      isItemActive(subItem.url)
                    )}
                    isItemActiveCallback={isItemActive}
                    submenuItems={submenuItems}
                  />
                ) : (
                  <SidebarMenuItem
                    className={isCollapsed ? "flex justify-center" : ""}
                  >
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      className={cn(
                        "flex items-center gap-3 rounded-md hover:bg-[#DCEFEB]",
                        isCollapsed
                          ? "justify-center px-2 py-2 w-10 h-10"
                          : "px-3 py-2",
                        isItemActive(item.url) &&
                          "bg-[#DCEFEB] text-[#0D1D2D] font-medium"
                      )}
                      tooltip={item.title}
                    >
                      <Link
                        to={item.url}
                        className="flex items-center gap-3"
                        aria-label={item.title}
                      >
                        <item.icon
                          className={isCollapsed ? "h-6 w-6" : "h-5 w-5"}
                        />
                        <IconModeAwareText>{item.title}</IconModeAwareText>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </React.Fragment>
            );
          })}
        </SidebarMenu>
        <SidebarFooter
          className={cn(
            "flex items-center mt-auto w-full",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed ? (
            <AccountMenu />
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              className="p-2 rounded-md"
              aria-label="Expand sidebar"
            >
              <ArrowRightToLine
                className="h-4 w-4"
                stroke="#4E6497"
                strokeWidth="1.5"
              />
            </Button>
          )}
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}

interface IconModeAwareTextProps {
  children: React.ReactNode;
  className?: string;
}

function IconModeAwareText({
  children,
  className,
}: IconModeAwareTextProps): React.ReactNode | null {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const isIconMode = state === "collapsed" && !isMobile;

  if (isIconMode) {
    return null;
  }

  return <span className={cn("truncate", className)}>{children}</span>;
}

interface CollapsibleOrPopoverMenuItemProps {
  title: string;
  icon: LucideIcon;
  isActive: boolean;
  submenuItems: NavSubItem[];
}

function CollapsibleOrPopoverMenuItem({
  title,
  icon: Icon,
  isActive,
  isItemActiveCallback,
  submenuItems,
}: CollapsibleOrPopoverMenuItemProps): React.ReactNode {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const isIconMode = state === "collapsed" && !isMobile;
  const [isOpen, setIsOpen] = React.useState(isActive);

  // When using the popover in icon mode
  if (isIconMode) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <SidebarMenuItem className="flex justify-center">
            <SidebarMenuButton
              className={cn(
                "flex items-center justify-center rounded-md hover:bg-[#DCEFEB]",
                "px-2 py-2 w-10 h-10",
                isActive && "bg-[#DCEFEB] text-[#0D1D2D] font-medium"
              )}
              size="lg"
              tooltip={title}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              <span className="sr-only">{title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="p-2 w-48">
          <div className="flex flex-col space-y-1">
            {submenuItems.map((subItem, idx) => (
              <Link
                key={idx}
                to={subItem.url}
                className="px-3 py-2 text-sm rounded-md hover:bg-[#DCEFEB] text-[#0D1D2D] "
              >
                {subItem.title}
              </Link>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Use collapsible when not in icon mode
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={cn(
              "flex items-center justify-between gap-3 px-3 py-2 w-full rounded-md hover:bg-[#DCEFEB]"
            )}
            size="lg"
            aria-expanded={isOpen}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="truncate">{title}</span>
            </div>
            <span className="sr-only">
              {isOpen ? "Collapse" : "Expand"} {title} menu
            </span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            ) : (
              <ChevronDown
                className="h-4 w-4 flex-shrink-0"
                aria-hidden="true"
              />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>
      <CollapsibleContent>
        <SidebarMenuSub className="border-none ml-0 px-0">
          {submenuItems.map((subItem, idx) => (
            <SidebarMenuItem key={idx}>
              <SidebarMenuButton
                asChild
                size="lg"
                className={`hover:bg-[#DCEFEB] text-[#0D1D2D]   pl-9
                  ${
                    isItemActiveCallback(subItem.url) &&
                    "bg-[#DCEFEB] text-[#0D1D2D] font-medium"
                  }
                  `}
              >
                <Link to={subItem.url} className="truncate">
                  {subItem.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
