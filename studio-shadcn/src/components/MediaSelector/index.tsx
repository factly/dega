import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import MediaUploader from './UploadMedium.tsx';
import MediaList from './MediaList.tsx';
import { getMedium } from '../../actions/media';
import ImagePlaceholder from '../ErrorsAndImage/PlaceholderImage.tsx';

interface Medium {
  id: string;
  url: {
    proxy?: string;
    raw: string;
  };
  alt_text: string;
}

interface MediaSelectorProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  maxWidth?: number;
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
  const [show, setShow] = React.useState(false);
  const [selected, setSelected] = React.useState<Medium | null>(null);
  const [tab, setTab] = React.useState<'upload' | 'library'>('upload');
  const dispatch = useDispatch();

  const medium = useSelector((state: any) => {
    return state.media.details[value] || null;
  });

  const setValue = () => {
    value = null;
  };

  if (!selected && value && medium) {
    setSelected(medium);
  }

  React.useEffect(() => {
    if (value) {
      dispatch(getMedium(value, profile));
      setSelected(medium);
    }
  }, [value, dispatch, medium, profile]);

  const onUpload = (_values: any, medium: Medium) => {
    value = medium.id;
    setSelected(medium);
  };

  return (
    <>
      <Dialog open={show} onOpenChange={(open) => setShow(open)}>
        <DialogContent className="sm:max-w-[800px]">
          <div className="flex flex-col space-y-4">
            <RadioGroup
              defaultValue={tab}
              onValueChange={(value) => setTab(value as 'upload' | 'library')}
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

            {tab === 'library' ? (
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
          className="flex justify-center items-center"
          style={containerStyles}
        >
          <div className="relative">
            <Button
              variant="outline"
              className="h-auto block border-dashed bg-transparent"
              onClick={() => setShow(true)}
            >
              {medium ? (
                <img
                  src={medium.url?.[window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw']}
                  alt={medium.alt_text}
                  className="w-full"
                />
              ) : (
                <ImagePlaceholder maxWidth={maxWidth} />
              )}
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