import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-4xl font-bold mb-4">404</h1>
    <p className="text-gray-600 mb-6">Sorry, page not found</p>
    <Link to="/">
      <Button variant="default">Back Home</Button>
    </Link>
  </div>
);

export default NotFound;
