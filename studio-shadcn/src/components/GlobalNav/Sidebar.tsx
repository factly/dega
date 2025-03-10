import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AccountMenu } from "./AccountMenu";
import degaShort from "../../assets/dega-short.png";
import degaLogo from "../../assets/dega.png";
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
import { RootState } from "@/types";
import { setCollapse } from "@/actions/sidebar";
import { useAppDispatch } from "@/hooks/reduxHooks";

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
      { title: "Claimants", path: "/claimants" },
    ],
  },
  {
    title: "Administration",
    icon: Shield,
    children: [
      { title: "Spaces", path: "/admin/spaces" },
      { title: "Organisations", path: "/organisations" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings/website/general",
    type: "link",
  },
];

export function Sidebar() {
  const dispatch = useAppDispatch();
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );
  const [openSections, setOpenSections] = useState<string[]>(["Dashboard"]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const location = useLocation();
  // Reference for timeout to avoid memory leaks
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const popoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleCollapse = (value: boolean) => {
    dispatch(setCollapse(value));
  };

  const toggleSection = (title: string): void => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  // Clear timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
    };
  }, []);

  // Handler for mouse enter
  const handleMouseEnter = (title: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (popoverTimeoutRef.current) {
      clearTimeout(popoverTimeoutRef.current);
    }

    // If we're switching between items, briefly hide the popover to trigger animation
    if (hoveredItem !== null && hoveredItem !== title) {
      setIsPopoverVisible(false);

      // Wait a brief moment before showing the new popover
      setTimeout(() => {
        setHoveredItem(title);

        // Short delay before showing popover for a smoother effect
        popoverTimeoutRef.current = setTimeout(() => {
          setIsPopoverVisible(true);
        }, 80);
      }, 150);
    } else {
      setHoveredItem(title);

      // Slight delay before showing popover for a smoother effect
      popoverTimeoutRef.current = setTimeout(() => {
        setIsPopoverVisible(true);
      }, 50);
    }
  };

  // Handler for mouse leave
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Add a slight delay before hiding the popover
    hoverTimeoutRef.current = setTimeout(() => {
      setIsPopoverVisible(false);

      // Wait for fade-out animation to complete before clearing hovered item
      setTimeout(() => {
        setHoveredItem(null);
      }, 300);
    }, 200); // Delay before starting to hide
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white transition-all duration-300 p-6",
        isCollapsed ? "w-[89px]" : "w-[265px]",
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
              onClick={() => toggleCollapse(true)}
              className="p-2 rounded-md"
            >
              <ArrowLeftToLine
                className="h-4 w-4"
                stroke="#4E6497"
                strokeWidth="1.5"
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
            ) : isCollapsed ? (
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter(section.title)}
                onMouseLeave={handleMouseLeave}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-full flex items-center justify-center px-[12.5px] py-2 rounded-md"
                  onClick={() => handleMouseEnter(section.title)}
                >
                  <section.icon className="h-4 w-4" />
                  <span className="sr-only">{section.title}</span>
                </Button>

                {/* Animated Popover Menu */}
                {hoveredItem === section.title && section.children && (
                  <div
                    key={`popover-${section.title}`}
                    className={cn(
                      "absolute left-full top-0 ml-2 p-2 w-48 bg-white shadow-lg rounded-md z-50",
                      "transform transition-all duration-300 ease-in-out",
                      isPopoverVisible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-3"
                    )}
                    onMouseEnter={() => handleMouseEnter(section.title)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      transformOrigin: "left center",
                    }}
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="px-2 py-1.5 font-medium text-sm text-gray-500">
                        {section.title}
                      </div>
                      {section.children?.map((item, index) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={cn(
                            "flex items-center px-2 py-1.5 text-sm rounded-md",
                            "hover:bg-[#DCEFEB] transition-colors",
                            "transition-all duration-250",
                            isPopoverVisible
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 -translate-x-2",
                            location.pathname === item.path &&
                              "bg-[#DCEFEB] font-medium"
                          )}
                          style={{
                            transitionDelay: `${50 + index * 30}ms`,
                          }}
                          onClick={() => {
                            setHoveredItem(null);
                            setIsPopoverVisible(false);
                          }}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Collapsible
                open={openSections.includes(section.title)}
                onOpenChange={() => toggleSection(section.title)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-full flex items-center justify-between px-[12.5px] py-2 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <section.icon className="h-4 w-4" />
                      <span className="text-base font-normal">
                        {section.title}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openSections.includes(section.title) && "rotate-180"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 mt-[6px] space-y-[6px]">
                  {section.children?.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center px-2 py-1.5 text-base rounded-md",
                        "hover:bg-[#DCEFEB] transition-colors",
                        location.pathname === item.path &&
                          "bg-[#DCEFEB] font-medium"
                      )}
                    >
                      {item.title}
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleCollapse(false)}
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
