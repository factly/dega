import Uppy, { UppyFile } from "@uppy/core";
import AwsS3 from "@uppy/aws-s3";
import GoogleDrive from "@uppy/google-drive";
import ImageEditor from "@uppy/image-editor";
import Url from "@uppy/url";
import { Dashboard } from "@uppy/react";
import { useSelector } from "react-redux";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import "@uppy/url/dist/style.css";
import "@uppy/image-editor/dist/style.css";
import { checker, maker } from "../../utils/sluger";

// Type definitions
interface UppyUploaderProps {
  onUpload: (uploadList: UploadItem[]) => void;
  allowedFileTypes?: string[];
  profile?: boolean;
}

interface UploadItem {
  alt_text: string;
  caption?: string;
  description?: string;
  dimensions: string;
  file_size: number;
  name: string;
  slug: string;
  title: string;
  type: string;
  url: {
    raw: string;
  };
}

interface SpaceState {
  spaces: {
    selected: number | string;
    details: {
      [key: string]: {
        slug: string;
      };
    };
    orgs: Array<{
      slug: string;
      spaces: (number | string)[];
    }>;
  };
}

interface UppyFileExtended extends UppyFile {
  file_name: string;
  meta: {
    name: string;
    alt_text?: string;
    caption?: string;
    width?: number;
    height?: number;
    type: string;
  };
  uploadURL?: string;
}

function UppyUploader({
  onUpload,
  allowedFileTypes = ["image/*"],
  profile = false,
}: UppyUploaderProps) {
  const space_slug = useSelector((state: SpaceState) => {
    const selectedSpace = state.spaces.selected;
    const details = state.spaces.details;
    return details && selectedSpace !== undefined && details[selectedSpace]
      ? details[selectedSpace].slug
      : "";
  });

  const org_slug = useSelector((state: SpaceState) => {
    const selectedSpace = state.spaces.selected;
    const orgs = state.spaces.orgs || [];
    const org = orgs.find(
      (org) => org && org.spaces && org.spaces.includes(selectedSpace)
    );
    return org ? org.slug : "";
  });
  const slug = profile ? org_slug : space_slug;

  const uppy = new Uppy({
    id: "uppy-media",
    meta: { type: "avatar" },
    restrictions: {
      allowedFileTypes: allowedFileTypes,
    },
    autoProceed: false,
    onBeforeUpload: (files: Record<string, UppyFileExtended>) => {
      const updatedFiles: Record<string, UppyFileExtended> = {};

      Object.keys(files).forEach((fileID) => {
        const fileName = files[fileID].meta.name.replace(/\.[^/.]+$/, "");
        const name = checker.test(fileName)
          ? files[fileID].meta.name
          : maker(fileName);
        updatedFiles[fileID] = {
          ...files[fileID],
          file_name: name,
          meta: {
            ...files[fileID].meta,
            name:
              slug +
              "/" +
              new Date().getFullYear() +
              "/" +
              new Date().getMonth() +
              "/" +
              Date.now().toString() +
              "_" +
              name,
          },
        };
      });
      return updatedFiles;
    },
  })
    .use(AwsS3, {
      companionUrl:
        import.meta.env.VITE_COMPANION_URL || window.REACT_APP_COMPANION_URL,
    })
    .use(Url, {
      companionUrl:
        import.meta.env.VITE_COMPANION_URL || window.REACT_APP_COMPANION_URL,
    })
    .use(GoogleDrive, {
      companionUrl:
        import.meta.env.VITE_COMPANION_URL || window.REACT_APP_COMPANION_URL,
    })
    .use(ImageEditor, {
      id: "ImageEditor",
      cropperOptions: {
        viewMode: 1,
        background: true,
        autoCropArea: 1,
        responsive: true,
      },
      companionUrl:
        import.meta.env.VITE_COMPANION_URL || window.REACT_APP_COMPANION_URL,
    });

  uppy.on("file-added", (file: UppyFileExtended) => {
    const data = file.data;
    const url = data.thumbnail ? data.thumbnail : URL.createObjectURL(data);
    const image = new Image();
    image.src = url;
    image.onload = () => {
      uppy.setFileMeta(file.id, { width: image.width, height: image.height });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
    };
  });

  uppy.on("complete", (result) => {
    const uploadList: UploadItem[] = result.successful.map(
      (successful: UppyFileExtended) => {
        const upload: UploadItem = {
          alt_text: successful.meta.alt_text
            ? successful.meta.alt_text
            : successful.file_name,
          caption: successful.meta.caption,
          description: successful.meta.caption,
          dimensions: `${successful.meta.width}x${successful.meta.height}`,
          file_size: successful.size,
          name: successful.file_name,
          slug: successful.file_name,
          title: successful.meta.caption ? successful.meta.caption : "",
          type: successful.meta.type,
          url: {
            raw: successful.uploadURL || "",
          },
        };
        return upload;
      }
    );
    onUpload(uploadList);
  });

  return (
    <div className="w-full">
      <Dashboard
        uppy={uppy}
        plugins={["GoogleDrive", "Url", "ImageEditor"]}
        metaFields={[
          { id: "name", name: "Name", placeholder: "file name" },
          {
            id: "caption",
            name: "Caption",
            placeholder: "describe what the image is about",
          },
          {
            id: "alt_text",
            name: "Alt Text",
            placeholder: "describe what the image is content",
          },
        ]}
      />
    </div>
  );
}

export default UppyUploader;
