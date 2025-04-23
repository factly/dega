import React from "react";
import { createFormat } from "../../actions/formats";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import useNavigation from "../../utils/useNavigation";
import FormatCreateForm from "./components/FormatForm";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { CreateFormatProps, FormatFormValues, Format } from "./types";

function CreateFormat({
  setReloadFlag,
  reloadFlag,
}: CreateFormatProps): React.ReactElement {
  const history = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: FormatFormValues): void => {
    const formatData = values as Format;

    dispatch(createFormat(formatData))
      .then(() => {
        history("/settings/advanced/formats");
        setReloadFlag(!reloadFlag);
        toast.success("Format created", {
          description: "The format has been successfully created.",
        });
      })
      .catch((error: Error) => {
        toast.error("Error", {
          description: `Failed to create format: ${error.message}`,
        });
      });
  };

  return (
    <>
      <Helmet title={"Create Format"} />
      <div className="space-y-6">
        <FormatCreateForm onCreate={onCreate} />
      </div>
    </>
  );
}

export default CreateFormat;
