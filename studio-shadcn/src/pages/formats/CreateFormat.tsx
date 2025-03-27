import React from "react";
import { createFormat } from "../../actions/formats";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import useNavigation from "../../utils/useNavigation";
import FormatCreateForm from "./components/FormatForm";
import { useAppDispatch } from "@/hooks/reduxHooks";

interface CreateFormatProps {
  setReloadFlag: React.Dispatch<React.SetStateAction<boolean>>;
  reloadFlag: boolean;
}

function CreateFormat({
  setReloadFlag,
  reloadFlag,
}: CreateFormatProps): React.ReactElement {
  const history = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: any): void => {
    dispatch(createFormat(values))
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
