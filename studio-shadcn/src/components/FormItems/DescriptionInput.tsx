import React from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { ScooterCore as Editor } from "@factly/scooter-core";
import { FactCheck } from "@factly/scooter-claim";
import { Image } from "@factly/scooter-image";
import { Embed } from "@factly/scooter-embed";
import { ScooterTable } from "@factly/scooter-table";
import { CodeBlock } from "@factly/scooter-code-block";
import { RATINGS_API } from "../../constants/ratings";
import { CLAIMANTS_API } from "../../constants/claimants";
import { CLAIMS_API } from "../../constants/claims";
import { MEDIA_API } from "../../constants/media";

interface DescriptionInputProps {
  name?: string;
  label?: string;
  noLabel?: boolean;
  onChange?: (value: any) => void;
  inputProps?: Record<string, any>;
  formItemProps?: Record<string, any>;
  initialValue?: any;
  rows?: number;
}

interface RootState {
  spaces: {
    selected: number;
    details: Record<number, { slug: string }>;
  };
}

const DescriptionInput: React.FC<DescriptionInputProps> = ({
  name = "description",
  label = "Description",
  noLabel = false,
  onChange = () => {},
  inputProps = {},
  formItemProps = {},
  initialValue,
  rows,
}) => {
  const space_slug = useSelector((state: RootState) => {
    return state.spaces.details[state.spaces.selected]?.slug;
  });

  const mergedInputProps = { ...inputProps, onChange };
  const mergedFormItemProps = noLabel
    ? formItemProps
    : { ...formItemProps, label };

  return (
    <FormItem {...mergedFormItemProps}>
      {!noLabel && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <FormControl>
        <Editor
          id={name}
          extensions={[FactCheck, Image, Embed, ScooterTable, CodeBlock]}
          menuType="bubble"
          heightStrategy="flexible"
          rows={rows ? rows : 10}
          {...mergedInputProps}
          initialValue={initialValue}
          uploadEndpoint={import.meta.env.VITE_COMPANION_URL}
          iframelyEndpoint={import.meta.env.VITE_IFRAMELY_URL}
          meta={{
            claims: {
              1: { id: 1, claim: "Claim 1", fact: "Fact 1" },
              2: { id: 2, claim: "Claim 2", fact: "Fact 2" },
              3: { id: 3, claim: "Claim 3", fact: "Fact 3" },
              4: { id: 4, claim: "Claim 4", fact: "Fact 4" },
            },
          }}
          claimConfig={{
            ratingsFetcher: (page = 1) => {
              return axios
                .get(RATINGS_API, {
                  params: { page: page, limit: 10 },
                })
                .then((res) => {
                  return res.data;
                });
            },
            claimantsFetcher: (page = 1) => {
              return axios
                .get(CLAIMANTS_API, {
                  params: { page: page, limit: 10 },
                })
                .then((res) => {
                  return res.data;
                });
            },
            claimsFetcher: (
              searchTerm: string,
              page = 1,
              limit = 10,
              sort = "desc"
            ) => {
              const params = new URLSearchParams();
              params.append("q", searchTerm);
              params.append("page", page.toString());
              params.append("limit", limit.toString());
              params.append("sort", sort);
              return axios.get(CLAIMS_API, { params: params }).then((res) => {
                return res.data;
              });
            },
            addClaim: (values: Record<string, any>) => {
              function convertIdsToNumbers(
                obj: Record<string, any>
              ): Record<string, any> {
                for (const key in obj) {
                  if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if (!isNaN(Number(obj[key]))) {
                      obj[key] = Number(obj[key]);
                    }
                  }
                }
                return obj;
              }
              return axios
                .post(CLAIMS_API, convertIdsToNumbers(values))
                .then((res) => {
                  return res.data;
                });
            },
          }}
          imagesFetcher={(currentPage: number) =>
            axios
              .get(MEDIA_API, {
                params: { page: currentPage, limit: 12 },
              })
              .then((res) => res.data)
          }
          onFileAdded={(file: any) => {
            const data = file.data;
            const url = data.thumbnail
              ? data.thumbnail
              : URL.createObjectURL(data);
            const image = document.createElement("img");
            image.src = url;
            image.onload = () => {
              URL.revokeObjectURL(url);
            };
            image.onerror = () => {
              URL.revokeObjectURL(url);
            };
          }}
          onUploadComplete={(result: any) => {
            const successful = result.successful[0];
            const { meta } = successful;
            const upload: Record<string, any> = {};
            upload["alt_text"] = meta.caption;
            upload["caption"] = meta.caption;
            upload["description"] = meta.caption;
            upload["dimensions"] = `${meta.width}x${meta.height}`;
            upload["file_size"] = successful.size;
            upload["name"] = successful.fileName;
            upload["slug"] = successful.response.body.key;
            upload["title"] = meta.caption ? meta.caption : " ";
            upload["type"] = successful.meta.type;
            upload["url"] = {};
            upload["url"]["raw"] = successful.uploadURL;

            axios.post(MEDIA_API, [upload]).catch((error) => {
              console.error(error);
            });
          }}
          uploadConfig={{
            restrictions: {
              maxFileSize: 5242880,
              allowedFileTypes: [".jpg", ".jpeg", ".png", ".gif"],
            },
            onBeforeUpload: (files: Record<string, any>) => {
              const updatedFiles: Record<string, any> = {};

              Object.keys(files).forEach((fileID) => {
                updatedFiles[fileID] = {
                  ...files[fileID],
                  fileName: files[fileID].meta.name,
                  meta: {
                    ...files[fileID].meta,
                    name:
                      space_slug +
                      "/" +
                      new Date().getFullYear() +
                      "/" +
                      new Date().getMonth() +
                      "/" +
                      Date.now().toString() +
                      "_" +
                      files[fileID].meta.name,
                  },
                };
              });
              return updatedFiles;
            },
          }}
        />
      </FormControl>
    </FormItem>
  );
};

export default DescriptionInput;
