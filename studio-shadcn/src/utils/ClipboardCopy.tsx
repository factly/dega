import { useState } from "react";
import { useDispatch } from "react-redux";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addErrorNotification } from "../actions/notifications";

interface ClipboardCopyProps {
  text: string;
}

function ClipboardCopy({ text }: ClipboardCopyProps): React.ReactElement {
  const dispatch = useDispatch();
  const [isCopied, setIsCopied] = useState<boolean>(false);

  async function copyTextToClipboard(textToCopy: string): Promise<void> {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(textToCopy);
    } else {
      document.execCommand("copy", true, textToCopy);
      return Promise.resolve();
    }
  }

  const handleCopyClick = (): void => {
    copyTextToClipboard(text)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 5000);
      })
      .catch((err) => {
        dispatch(addErrorNotification("Could not copy token"));
      });
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-row">
        <Input
          readOnly
          placeholder="token"
          value={text}
          className="rounded-r-none"
        />
        <Button
          onClick={handleCopyClick}
          variant="default"
          className="rounded-l-none"
        >
          {isCopied ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" /> Copy
            </>
          )}
        </Button>
      </div>
      <Alert variant={isCopied ? "default" : "destructive"}>
        <AlertDescription>
          Make sure to copy your personal access token now. You won't be able to
          see it again!
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default ClipboardCopy;
