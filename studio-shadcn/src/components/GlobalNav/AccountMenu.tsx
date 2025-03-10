import { useNavigate } from "react-router-dom";
import { User, LogOut, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Profile {
  medium?: {
    url?: {
      proxy?: string;
      raw?: string;
    };
  };
}

interface SessionState {
  loading: boolean;
}

interface ProfileState {
  details: Profile | null;
  loading: boolean;
}

interface RootState {
  profile: ProfileState;
  session: SessionState;
}

interface AccountMenuProps {
  isCollapsed?: boolean;
}

export const AccountMenu = ({ isCollapsed = false }: AccountMenuProps) => {
  const navigate = useNavigate();

  // These would come from your Redux store
  const profile: Profile | null = null; // Replace with actual Redux selector
  const loading: boolean = false; // Replace with actual Redux selector

  const handleLogout = async (): Promise<void> => {
    const sessionId = localStorage.getItem("sessionId");
    const sessionToken = localStorage.getItem("sessionToken");

    if (sessionId && sessionToken) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/sessions/${sessionId}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionToken}`,
            },
            body: JSON.stringify({ sessionToken }),
          }
        );

        if (!response.ok) {
          console.error("Logout failed:", await response.text());
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }

    window.localStorage.clear();

    const postLogoutRedirectUri = import.meta.env
      .VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI;
    if (postLogoutRedirectUri) {
      window.location.href = postLogoutRedirectUri;
    } else {
      window.location.reload();
    }
  };

  if (isCollapsed) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full">
        {!loading && profile?.medium ? (
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                profile.medium.url?.[
                  import.meta.env.VITE_ENABLE_IMGPROXY ? "proxy" : "raw"
                ]
              }
              alt="Profile"
            />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <User className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
        >
          {!loading && profile?.medium ? (
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  profile.medium.url?.[
                    import.meta.env.VITE_ENABLE_IMGPROXY ? "proxy" : "raw"
                  ]
                }
                alt="Profile"
              />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <User className="h-4 w-4" />
          )}
          <span>Profile</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <Edit className="h-4 w-4 mr-2" />
          <span>My Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
