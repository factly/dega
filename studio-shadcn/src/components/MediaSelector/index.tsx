import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import MediaUploader from "./UploadMedium";
import MediaList from "./MediaList";
import { getMedium } from "../../actions/media";
import ImagePlaceholder from "../ErrorsAndImage/PlaceholderImage";
import { useAppDispatch } from "@/hooks/reduxHooks";

interface Medium {
  id: string;
  url: {
    proxy?: string;
    raw: string;
  };
  alt_text?: string;
}

interface MediaSelectorProps {
  value?: number | null;
  onChange: (value: string | null) => void;
  maxWidth?: string;
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

  const medium = useSelector((state: any) => {
    return state.media.details[value] || null;
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
      dispatch(getMedium(value, profile));
    }
  }, [value, dispatch, profile]);

  // Handle successful upload in the upload tab
  const onUpload = (_values: any, medium: Medium): void => {
    setSelected(medium);
  };

  return (
    <>
      <Dialog open={show} onOpenChange={(open) => setShow(open)}>
        <DialogContent className="sm:max-w-[800px]">
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setShow(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShow(false);
                selected ? onChange(selected.id) : onChange(null);
              }}
            >
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col space-y-4">
        <div
          className="flex flex-col justify-center items-center"
          style={containerStyles}
        >
          <div className="relative w-full max-w-xl mx-auto">
            <Button
              variant="outline"
              className="h-auto w-full py-4 px-8 block border-dashed bg-transparent hover:bg-gray-50"
              onClick={() => setShow(true)}
            >
              <div className="flex flex-col items-center space-y-3">
                {medium ? (
                  <div className="flex justify-center w-full">
                    <img
                      src={
                        medium.url?.[
                          import.meta.env.VITE_ENABLE_IMGPROXY ? "proxy" : "raw"
                        ]
                      }
                      alt={medium.alt_text || "Selected media"}
                      className="w-3/4 max-h-32 object-contain"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center w-full">
                      <ImagePlaceholder maxWidth={maxWidth || "120px"} />
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Upload className="h-4 w-4" />
                      <span>Choose from uploads or drag and drop</span>
                    </div>
                  </>
                )}
              </div>
            </Button>
            {medium && (
              <Button
                variant="outline"
                className="absolute bottom-0 left-0 max-w-[52px]"
                onClick={() => {
                  onChange(null);
                  setSelected(null);
                }}
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
