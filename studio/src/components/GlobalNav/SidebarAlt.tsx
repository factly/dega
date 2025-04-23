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
      title: "Website",
      icon: Wrench,
      children: [
        {
          title: "General",
          path: "/settings/website/general",
          icon: Wrench,
        },
        {
          title: "Branding",
          path: "/settings/website/branding",
          icon: Tags,
        },
        {
          title: "Navigation",
          path: "/settings/website/menus",
          icon: SquareMenu,
        },
        {
          title: "Analytics",
          path: "/settings/website/analytics",
          icon: ChartPie,
        },
        {
          title: "Code Injection",
          path: "/settings/website/code-injection",
          icon: SquareDashedBottomCode,
        },
      ],
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
      <div className="flex items-center">
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
        {/* Menu items */}
        {settingsMenuItems.map((section) => (
          <div
            key={section.title}
            className="w-full"
            onMouseEnter={() => handleSectionMouseEnter(section.title)}
            onMouseLeave={handleSectionMouseLeave}
          >
            <div
              className={cn(
                "mt-3 rounded-md transition-colors",
                hoveredSection === section.title && "bg-[#F7FCFB]"
              )}
            >
              {/* Section Header */}
              <div className="px-3 py-2 text-sm font-medium text-[#4E6497]">
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
                      "flex items-center pl-4 py-2 text-base rounded-md",
                      "hover:bg-[#DCEFEB] transition-colors text-[#0D1D2D]",
                      location.pathname === item.path &&
                        "bg-[#DCEFEB] text-[#0D1D2D] font-medium"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span className="truncate">{item.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with Logout */}
      <div className="mt-auto pt-4">
        <Button
          variant="outline"
          className="flex items-center justify-start text-red-600 px-3 py-2 gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-white text-[#0D1D2D] w-[18rem] p-0 [&>button]:hidden fixed top-16 h-[calc(100vh-4rem)]"
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
