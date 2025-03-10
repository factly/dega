import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AccountMenu } from "./AccountMenu";
import degaShort from "@/assets/dega-short.png";
import degaLogo from "@/assets/dega.jpg";
import {
  ChevronDown,
  LayoutDashboard,
  Settings,
  Microchip,
  Shield,
  ListCheck,
  Search,
  ArrowLeftToLine,
  ArrowRightToLine,
} from "lucide-react";

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  type?: string;
  children?: Array<{
    title: string;
    path: string;
  }>;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    children: [
      { title: "Home", path: "/" },
      { title: "Analytics", path: "/analytics" },
    ],
  },
  {
    title: "Search",
    icon: Search,
    path: "/search",
    type: "link",
  },
  {
    title: "Core",
    icon: Microchip,
    children: [
      { title: "Posts", path: "/posts" },
      { title: "Pages", path: "/pages" },
      { title: "Media", path: "/media" },
    ],
  },
  {
    title: "Fact checking",
    icon: ListCheck,
    children: [
      { title: "Claims", path: "/claims" },
      { title: "Ratings", path: "/ratings" },
    ],
  },
  {
    title: "Administration",
    icon: Shield,
    children: [
      { title: "Users", path: "/users" },
      { title: "Roles", path: "/roles" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
    type: "link",
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState<string[]>(["Dashboard"]);
  const location = useLocation();

  const toggleSection = (title: string): void => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white transition-all duration-300 p-6",
        isCollapsed ? "w-20" : "w-64",
        "border-r border-gray-200"
      )}
    >
      {/* Logo Section with Collapse Button */}
      <div className="flex h-14 items-center justify-between pb-8">
        {isCollapsed ? (
          <img src={degaShort} alt="Dega" className="h-8 w-8" />
        ) : (
          <div className="flex items-center justify-between w-full">
            <img src={degaLogo} alt="Dega" className="h-8" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="p-2"
            >
              <ArrowLeftToLine
                className="h-4 w-4"
                stroke="#4E6497"
                strokeWidth="1.25"
              />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-[6px] h-[calc(100vh-8rem)]">
        {menuItems.map((section) => (
          <div key={section.title} className="w-full">
            {section.type === "link" ? (
              <Link to={section.path!}>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center px-[12.5px] py-2 rounded-md",
                    isCollapsed && "justify-center",
                    !isCollapsed && "justify-start"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    {!isCollapsed && (
                      <span className="text-base font-normal">
                        {section.title}
                      </span>
                    )}
                  </div>
                </Button>
              </Link>
            ) : (
              <Collapsible
                open={!isCollapsed && openSections.includes(section.title)}
                onOpenChange={() => toggleSection(section.title)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "w-full flex items-center justify-between px-[12.5px] py-2 rounded-md",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <section.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <span className="text-base font-normal">
                          {section.title}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          openSections.includes(section.title) && "rotate-180"
                        )}
                      />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 mt-[6px] space-y-[6px]">
                  {section.children?.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center px-2 py-1.5 text-base rounded-md",
                        "hover:bg-emerald-50 transition-colors",
                        location.pathname === item.path &&
                          "bg-emerald-50 font-medium",
                        isCollapsed && "justify-center"
                      )}
                    >
                      {!isCollapsed ? (
                        item.title
                      ) : (
                        <span className="sr-only">{item.title}</span>
                      )}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        ))}
      </div>

      {/* Footer with AccountMenu */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="p-6">
          <div className="flex flex-col gap-2">
            {!isCollapsed ? (
              <AccountMenu />
            ) : (
              <div className="flex flex-col gap-2">
                <AccountMenu isCollapsed />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsCollapsed(false)}
                >
                  <ArrowRightToLine
                    className="h-4 w-4"
                    stroke="#4E6497"
                    strokeWidth="1.25"
                  />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
