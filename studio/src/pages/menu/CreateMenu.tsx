import React from "react";
import MenuForm from "./components/MenuForm";
import { createMenu } from "../../actions/menu";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { MenuFormValues } from "./types";
import { Helmet } from "react-helmet";

const CreateMenu: React.FC = () => {
  const navigate = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: MenuFormValues) => {
    dispatch(createMenu(values))
      .then(() => {
        // Navigate to the menu list after successful creation
        navigate("/settings/website/menus");
      })
      .catch((error) => {
        // Error is already handled in the action creator
        console.error("Error creating menu:", error);
      });
  };

  return (
    <>
      <Helmet title={"Create Menu"} />
      <div className="w-full max-w-4xl mx-auto">
        <MenuForm onCreate={onCreate} />
      </div>
    </>
  );
};

export default CreateMenu;
