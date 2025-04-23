import { useState, useRef, useEffect, useCallback } from "react";
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
      { title: "Categories", path: "/categories" },
      { title: "Tags", path: "/tags" },
      { title: "Media", path: "/media" },
    ],
  },
  {
    title: "Fact Checking",
    icon: ListCheck,
    children: [
      { title: "Fact-Checks", path: "/fact-checks" },
      { title: "Claims", path: "/claims" },
      { title: "Claimants", path: "/claimants" },
      { title: "Ratings", path: "/ratings" },
      { title: "Google", path: "/fact-checks/google" },
      { title: "Sach", path: "/fact-checks/sach" },
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
  const location = useLocation();
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  // Reference for timeout to avoid memory leaks
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const popoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Find active section and item based on current route
  useEffect(() => {
    const currentPath = location.pathname;

    // Find which section should be open based on current path
    const sectionsToOpen = menuItems
      .filter((section) => {
        // Direct link match
        if (section.path === currentPath) return true;

        // Check if any children match the current path
        if (section.children) {
          return section.children.some((item) => {
            // Direct path match or path is a prefix of the current path
            return (
              item.path === currentPath || currentPath.startsWith(item.path)
            );
          });
        }
        return false;
      })
      .map((section) => section.title);

    if (sectionsToOpen.length > 0) {
      setOpenSections(sectionsToOpen);
    }
  }, [location.pathname]);

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

  // Function to check if an item is active based on the current path
  const isItemActive = (path: string) => {
    if (path === location.pathname) return true;
    return false;
  };

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

  const updatePopoverPosition = useCallback(() => {
    if (hoveredItem && isCollapsed) {
      const element = document.querySelector(`[data-section="${hoveredItem}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Position the popover adjacent to the button
        document.querySelector(`[data-popover="${hoveredItem}"]`)?.setAttribute(
          "style",
          `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
           transform-origin: left center; 
           position: fixed;
           left: ${rect.right + 8}px; 
           top: ${rect.top}px;
           max-height: 80vh;
           overflow-y: auto;`
        );
      }
    }
  }, [hoveredItem, isCollapsed]);

  useEffect(() => {
    if (hoveredItem) {
      setTimeout(updatePopoverPosition, 0);

      // Also listen for scroll events to reposition if needed
      window.addEventListener("scroll", updatePopoverPosition);
      window.addEventListener("resize", updatePopoverPosition);

      // Update position periodically while popover is visible
      const positionInterval = setInterval(updatePopoverPosition, 100);

      return () => {
        window.removeEventListener("scroll", updatePopoverPosition);
        window.removeEventListener("resize", updatePopoverPosition);
        clearInterval(positionInterval);
      };
    }
  }, [hoveredItem, isPopoverVisible, updatePopoverPosition]);

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

  const handleSectionMouseEnter = (title: string) => {
    setHoveredSection(title);
  };

  const handleSectionMouseLeave = () => {
    setHoveredSection(null);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white transition-all duration-300 py-6 px-[10px]",
        isCollapsed ? "w-[89px]" : "w-[265px]",
        "border-r border-gray-200",
        "flex flex-col"
      )}
    >
      {/* Logo Section */}
      <div className="flex h-14 items-center justify-between pb-8 pt-2">
        {isCollapsed ? (
          <Link to="/" className="ml-5">
            <img
              src={degaShort}
              alt="Dega"
              className="h-8 w-8 cursor-pointer"
            />
          </Link>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Link to="/">
              <img src={degaLogo} alt="Dega" className="h-8 cursor-pointer" />
            </Link>
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
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[6px]">
          {menuItems.map((section) => (
            <div
              key={section.title}
              className="w-full"
              onMouseEnter={() => handleSectionMouseEnter(section.title)}
              onMouseLeave={handleSectionMouseLeave}
            >
              {section.type === "link" ? (
                <Link to={section.path!}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      isCollapsed
                        ? "px-6 justify-center ml-2 flex items-center py-2 rounded-md"
                        : "px-4 justify-start w-full flex items-center py-2 rounded-md",
                      hoveredSection === section.title,
                      isItemActive(section.path!)
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
                  data-section={section.title}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      isCollapsed
                        ? "flex ml-2 items-center justify-center py-2 rounded-md px-6"
                        : "w-full flex items-center justify-center py-2 rounded-md px-6",
                      hoveredSection === section.title // Highlight when hovered
                      // Removed the highlighting of parent tab when child is active
                    )}
                    onClick={() => handleMouseEnter(section.title)}
                  >
                    <section.icon className="h-4 w-4" />
                    <span className="sr-only">{section.title}</span>
                  </Button>

                  {/* Animated Popover Menu */}
                  {hoveredItem === section.title && section.children && (
                    <div
                      key={`popover-${section.title}`}
                      data-popover={section.title}
                      className={cn(
                        "p-2 w-48 bg-white shadow-lg rounded-md z-[100]",
                        "transform transition-all duration-300 ease-in-out",
                        isPopoverVisible
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-3"
                      )}
                      onMouseEnter={() => handleMouseEnter(section.title)}
                      onMouseLeave={handleMouseLeave}
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
                              isItemActive(item.path) && "bg-[#DCEFEB]" // Apply background only to active child
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
                <div
                  className={cn(
                    "rounded-md transition-colors",
                    hoveredSection === section.title && "bg-[#F7FCFB]"
                  )}
                >
                  <Collapsible
                    open={openSections.includes(section.title)}
                    onOpenChange={() => toggleSection(section.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2 rounded-md"
                        )}
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
                    <CollapsibleContent className="mt-[6px] space-y-[6px]">
                      {section.children?.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={cn(
                            "flex items-center px-4 py-2 text-base rounded-md w-full",
                            "hover:bg-[#DCEFEB] transition-colors",
                            isItemActive(item.path) && "bg-[#DCEFEB]"
                          )}
                        >
                          <div className="pl-6 w-full">{item.title}</div>{" "}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AccountMenu */}
      <div className="mt-auto">
        <div className="flex flex-col gap-2">
          {!isCollapsed ? (
            <AccountMenu />
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleCollapse(false)}
                className="ml-4"
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
    </aside>
  );
}
