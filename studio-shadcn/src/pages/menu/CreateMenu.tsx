import React from "react";
import MenuForm from "./components/MenuForm";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { createMenu } from "../../actions/menu";
import useNavigation from "../../utils/useNavigation";

// Define the menu values interface
interface MenuValues {
  name: string;
  items: Array<{
    title: string;
    url: string;
    id?: string;
    children?: Array<{
      title: string;
      url: string;
      id?: string;
    }>;
  }>;
  [key: string]: any; // For any additional properties
}

const CreateMenu: React.FC = () => {
  const navigate = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const onCreate = (values: MenuValues) => {
    dispatch(createMenu(values))
      .then(() => {
        // Navigate to the menu list after successful creation
        navigate("/settings/website/menus");
      })
      .catch((error) => {
        console.error("Error creating menu:", error);
      });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-6">
        <MenuForm onCreate={onCreate} />
      </div>
    </div>
  );
};

export default CreateMenu;
