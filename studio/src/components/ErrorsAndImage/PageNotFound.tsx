import React from "react";
import RecordNotFound from "./RecordNotFound";

const NotFoundPage: React.FC = () => {
  return (
    <RecordNotFound
      status="404"
      title="Sorry, the page you're looking for doesn't exist."
      link="/"
      entity="Home"
      isReturnHome={true}
    />
  );
};

export default NotFoundPage;
