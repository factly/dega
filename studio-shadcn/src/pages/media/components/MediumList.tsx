// components/MediumList.tsx
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Download, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { MediaListProps, MediaItem } from "../types";

function MediumList({ data, actions = [], isMobile = false }: MediaListProps) {
  // Function to handle download
  const handleDownload = (item: MediaItem) => {
    if (item.url?.raw) {
      const link = document.createElement("a");
      link.href = item.url.raw;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Check if there are any media items to display
  const hasMediaData = data.media && data.media.length > 0;

  return (
    <div className="flex flex-col space-y-6">
      {hasMediaData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.media.map((item) => (
            <div key={item.id} className="relative group">
              <Card className="overflow-hidden hover:shadow-md transition-all border border-gray-200">
                <CardContent className="p-0">
                  <div className="relative w-full">
                    <Link to={`/media/${item.id}/edit`} className={"block"}>
                      {item.url && (
                        <img
                          src={item.url.proxy || item.url.raw}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          style={{
                            width: isMobile ? "100%" : "468px",
                            height: isMobile ? "100%" : "468px",
                          }}
                        />
                      )}
                    </Link>

                    {/* Media actions dropdown (visible on hover) */}
                    <div
                      className={`absolute top-2 right-2 ${
                        isMobile
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      } transition-opacity`}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="p-1 rounded-md bg-white/90 hover:bg-white">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link
                              to={`/media/${item.id}/edit`}
                              className="flex items-center w-full cursor-pointer"
                            >
                              <span>Edit</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center cursor-pointer"
                            onClick={() => handleDownload(item)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            <span>Download</span>
                          </DropdownMenuItem>
                          {actions.includes("admin") && (
                            <DropdownMenuItem className="flex items-center text-red-500 cursor-pointer">
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          contentType="media"
          title="No media items found"
          description="Your media library is empty"
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

export default MediumList;
