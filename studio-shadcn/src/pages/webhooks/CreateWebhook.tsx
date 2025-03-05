import WebhookCreateForm from "./components/WebhookForm";
import { addWebhook } from "../../actions/webhooks";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Define the type for webhook values
interface WebhookValues {
  // Add webhook properties based on your application's needs
  // Common webhook properties might include:
  url: string;
  events: string[];
  name?: string;
  description?: string;
  headers?: Record<string, string>;
  active?: boolean;
}

function CreateWebhook(): React.ReactElement {
  const history = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: WebhookValues): void => {
    dispatch(addWebhook(values)).then(() =>
      history("/settings/advanced/webhooks")
    );
  };

  return (
    <>
      <Helmet title={"Create Webhook"} />
      <WebhookCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateWebhook;
