import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import MediaUploader from "./UploadMedium";
import MediaList from "./MediaList";
import { getMedium } from "../../actions/media";
import ImagePlaceholder from "../ErrorsAndImage/PlaceholderImage";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useIsMobile } from "@/hooks/use-mobile";

interface Medium {
  id: string;
  url: {
    proxy?: string;
    raw: string;
  };
  alt_text?: string;
}

interface MediaSelectorProps {
  value?: string | number | null;
  onChange: (value: string | null) => void;
  maxWidth?: number | string;
  containerStyles?: React.CSSProperties;
  profile?: boolean;
}

function MediaSelector({
  value = null,
  onChange,
  maxWidth,
  containerStyles = {},
  profile = false,
}: MediaSelectorProps) {
  const [show, setShow] = useState<boolean>(false);
  const [selected, setSelected] = useState<Medium | null>(null);
  const [tab, setTab] = useState<"upload" | "library">("upload");
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();

  const medium = useSelector((state: any) => {
    // Convert number to string if needed for lookup
    const lookupId = value !== null ? String(value) : null;
    return lookupId ? state.media.details[lookupId] || null : null;
  });

  const setValue = (): void => {
    // This function is passed to MediaList to help clear selection
    setSelected(null);
  };

  // Set selected medium when it's loaded or value changes
  useEffect(() => {
    if (!selected && value && medium) {
      setSelected(medium);
    }
  }, [selected, value, medium]);

  // Load medium details when value is provided
  useEffect(() => {
    if (value) {
      dispatch(getMedium(String(value), profile));
    }
  }, [value, dispatch, profile]);

  // Handle successful upload in the upload tab
  const onUpload = (_values: any, medium: Medium): void => {
    setSelected(medium);
  };

  // Calculate responsive container styles
  const responsiveContainerStyles = {
    ...containerStyles,
    width: isMobile ? "100%" : containerStyles.width || "100%",
    height: isMobile ? "160px" : containerStyles.height || "220px",
  };

  // Handle button click to prevent form submission
  const handleMediaButtonClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ): void => {
    e.preventDefault(); // Prevent form submission
    setShow(true);
  };

  // Handle trash button click to prevent form submission
  const handleTrashButtonClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ): void => {
    e.preventDefault(); // Prevent form submission
    onChange(null);
    setSelected(null);
  };

  return (
    <>
      <Dialog open={show} onOpenChange={(open) => setShow(open)}>
        <DialogContent
          className={`${
            isMobile ? "w-[95vw] max-w-[95vw] p-4" : "sm:max-w-[800px]"
          }`}
        >
          <DialogTitle className="text-lg font-medium">
            Select Media
          </DialogTitle>

          <div className="flex flex-col space-y-4">
            <RadioGroup
              defaultValue={tab}
              onValueChange={(value) => setTab(value as "upload" | "library")}
              className="flex space-x-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload" />
                <Label htmlFor="upload">Upload</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="library" id="library" />
                <Label htmlFor="library">Library</Label>
              </div>
            </RadioGroup>

            {tab === "library" ? (
              <MediaList
                onSelect={setSelected}
                selected={selected}
                onUnselect={setValue}
                profile={profile}
              />
            ) : (
              <MediaUploader onMediaUpload={onUpload} profile={profile} />
            )}
          </div>

          <DialogFooter className={isMobile ? "flex-col space-y-2 mt-4" : ""}>
            <Button
              variant="outline"
              onClick={() => setShow(false)}
              className={isMobile ? "w-full" : ""}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShow(false);
                if (selected) {
                  onChange(selected.id);
                } else {
                  onChange(null);
                }
              }}
              className={isMobile ? "w-full" : ""}
              type="button"
            >
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col space-y-4 w-full">
        <div
          className="flex flex-col justify-center items-center"
          style={responsiveContainerStyles}
        >
          <div className="relative w-full h-full mx-auto">
            <Button
              type="button"
              variant="outline"
              className="h-full w-full py-4 px-4 block border-dashed bg-transparent hover:bg-gray-50"
              onClick={handleMediaButtonClick}
            >
              <div className="flex flex-col items-center space-y-3">
                {medium ? (
                  <div className="flex justify-center w-full">
                    <img
                      src={
                        medium.url?.[
                          import.meta.env.VITE_ENABLE_IMGPROXY === "true"
                            ? "proxy"
                            : "raw"
                        ]
                      }
                      alt={medium.alt_text || "Selected media"}
                      className="max-w-full max-h-32 object-contain"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center w-full">
                      <ImagePlaceholder
                        maxWidth={isMobile ? "80px" : maxWidth || "120px"}
                      />
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 text-center">
                      <Upload className="h-4 w-4" />
                      <span className={isMobile ? "text-sm" : ""}>
                        {isMobile
                          ? "Choose media"
                          : "Choose from uploads or drag and drop"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Button>
            {medium && (
              <Button
                type="button"
                variant="outline"
                className="absolute bottom-2 left-2 max-w-[42px] h-8 p-0"
                onClick={handleTrashButtonClick}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MediaSelector;
