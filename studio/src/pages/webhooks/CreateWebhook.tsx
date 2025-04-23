import WebhookCreateForm from "./components/WebhookForm";
import { addWebhook } from "../../actions/webhooks";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Define the type for webhook values
interface WebhookFormData {
  id?: string;
  name?: string;
  url?: string;
  enabled?: boolean;
  events?: string[];
  event_ids?: string[];
}

function CreateWebhook(): React.ReactElement {
  const history = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: WebhookFormData): void => {
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
