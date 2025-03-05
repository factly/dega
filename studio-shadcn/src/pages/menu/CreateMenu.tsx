import React from "react";
import MenuForm from "./components/MenuForm";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { createMenu } from "../../actions/menu";
import useNavigation from "../../utils/useNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

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
    dispatch(createMenu(values)).then(() =>
      navigate("/settings/website/menus")
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            <Plus className="h-6 w-6 inline mr-2" />
            Create Menu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MenuForm onCreate={onCreate} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMenu;
