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

  const handleBack = () => {
    // Navigate to main dashboard
    navigate("/");
  };

  const handleLogout = async () => {
    await logout();
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

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white p-6 w-[265px]",
        "border-r border-gray-200"
      )}
    >
      {/* Back button */}
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={handleBack}
          size="sm"
          className="flex items-center gap-2 py-2 pr-4"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-base font-normal">Back</span>
        </Button>
      </div>

      {/* Settings Navigation */}
      <div className="flex flex-col gap-1 h-[calc(100vh-12rem)] overflow-y-auto">
        <div className="font-medium text-gray-500 mb-2 ml-2">Website</div>

        {/* Direct Links */}
        {settingsMenuItems.map((section) => (
          <div key={section.title} className="w-full">
            {section.type === "link" ? (
              <Link to={section.path!}>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center px-[12.5px] py-2 rounded-md justify-start",
                    location.pathname === section.path &&
                      "bg-[#DCEFEB] font-medium"
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
              <div className="mt-3">
                {/* Section Header */}
                <div className="px-[12.5px] py-2 text-sm font-medium text-gray-600">
                  <span>{section.title}</span>
                </div>

                {/* Section Children */}
                <div className="space-y-1 ml-4">
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

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                className="flex items-center justify-start text-red-600 px-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
