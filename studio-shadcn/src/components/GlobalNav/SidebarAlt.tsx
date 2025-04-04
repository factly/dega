import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../utils/zitadel/logout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  LogOut,
  Users,
  Key,
  Wrench,
  SquareMenu,
  ChartPie,
  SquareDashedBottomCode,
  Webhook,
  ScrollText,
  Lock,
  Unplug,
  Tags,
  Settings,
  LetterText,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  type?: string;
  children?: Array<{
    title: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

export function SidebarAlt() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { openMobile, setOpenMobile } = useSidebar();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const handleBack = () => {
    // Navigate to main dashboard
    navigate("/");
  };

  const handleLogout = async () => {
    await logout();
  };

  // Handlers for section hover
  const handleSectionMouseEnter = (title: string) => {
    setHoveredSection(title);
  };

  const handleSectionMouseLeave = () => {
    setHoveredSection(null);
  };

  const settingsMenuItems: MenuItem[] = [
    {
      title: "General",
      icon: Wrench,
      path: "/settings/website/general",
      type: "link",
    },
    {
      title: "Branding",
      icon: Tags,
      path: "/settings/website/branding",
      type: "link",
    },
    {
      title: "Navigation",
      icon: SquareMenu,
      path: "/settings/website/menus",
      type: "link",
    },
    {
      title: "Analytics",
      icon: ChartPie,
      path: "/settings/website/analytics",
      type: "link",
    },
    {
      title: "Code Injection",
      icon: SquareDashedBottomCode,
      path: "/settings/website/code-injection",
      type: "link",
    },
    {
      title: "User Settings",
      icon: Users,
      children: [
        { title: "Members", path: "/settings/members", icon: Users },
        {
          title: "Policies",
          path: "/settings/members/policies",
          icon: ScrollText,
        },
      ],
    },
    {
      title: "Security",
      icon: Key,
      children: [
        {
          title: "Password & Auth",
          path: "/settings/website/authentication",
          icon: Lock,
        },
      ],
    },
    {
      title: "Advanced",
      icon: Settings,
      children: [
        { title: "Tokens", path: "/settings/advanced/tokens", icon: Unplug },
        {
          title: "Webhooks",
          path: "/settings/advanced/webhooks",
          icon: Webhook,
        },
        {
          title: "Formats",
          path: "/settings/advanced/formats",
          icon: LetterText,
        },
      ],
    },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col p-4">
      {/* Header with Back button */}
      <div className="flex items-center mb-4">
        <Button
          variant="outline"
          onClick={handleBack}
          size="sm"
          className="flex items-center gap-2 py-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-base font-normal">Back</span>
        </Button>
      </div>

      {/* Settings Navigation */}
      <div className="flex flex-col gap-1 h-[calc(100vh-12rem)] overflow-y-auto">
        <div className="font-medium text-gray-500 mb-2 ml-2">Website</div>

        {/* Menu items */}
        {settingsMenuItems.map((section) => (
          <div
            key={section.title}
            className="w-full"
            onMouseEnter={() => handleSectionMouseEnter(section.title)}
            onMouseLeave={handleSectionMouseLeave}
          >
            {section.type === "link" ? (
              <Link
                to={section.path!}
                onClick={() => isMobile && setOpenMobile(false)} // Close mobile sidebar on navigation
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center px-[12.5px] py-2 rounded-md justify-start",
                    location.pathname === section.path &&
                      "bg-[#DCEFEB] font-medium",
                    hoveredSection === section.title && "bg-gray-100" // Highlight when hovered
                  )}
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    <span className="text-base font-normal">
                      {section.title}
                    </span>
                  </div>
                </Button>
              </Link>
            ) : (
              <div
                className={cn(
                  "mt-3 rounded-md transition-colors",
                  hoveredSection === section.title && "bg-[#F7FCFB]"
                )}
              >
                {/* Section Header */}
                <div className="px-[12.5px] py-2 text-sm font-medium text-gray-600">
                  <span>{section.title}</span>
                </div>

                {/* Section Children */}
                <div className="space-y-1">
                  {section.children?.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => isMobile && setOpenMobile(false)} // Close mobile sidebar on navigation
                      className={cn(
                        "flex items-center px-2 py-1.5 text-base rounded-md",
                        "hover:bg-[#DCEFEB] transition-colors",
                        location.pathname === item.path &&
                          "bg-[#DCEFEB] font-medium"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer with Logout */}
      <div className="mt-auto pt-4">
        <Button
          variant="outline"
          className="w-1/2 flex items-center justify-start text-red-600 px-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-1" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  // For mobile view, use Sheet component
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-[18rem] p-0 [&>button]:hidden fixed top-16 h-[calc(100vh-4rem)]"
          side="left"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Settings Sidebar</SheetTitle>
            <SheetDescription>Displays the settings sidebar.</SheetDescription>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[265px] bg-white border-r border-gray-200">
      <SidebarContent />
    </aside>
  );
}
