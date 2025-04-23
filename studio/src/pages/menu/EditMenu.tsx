import React, { useEffect } from "react";
import MenuForm from "./components/MenuForm";
import { useSelector } from "react-redux";
import { updateMenu, getMenu, Menu as ActionMenu } from "../../actions/menu";
import { useParams } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Menu, MenuFormValues, RootState } from "./types";

function EditMenu(): React.ReactElement {
  const navigate = useNavigation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { menu, loading } = useSelector((state: RootState) => {
    return {
      menu: id && state.menus.details[id] ? state.menus.details[id] : null,
      loading: state.menus.loading,
    };
  });

  useEffect(() => {
    if (id) {
      // Check if id is numeric and parse it, otherwise use as string
      const parsedId = /^\d+$/.test(id) ? parseInt(id, 10) : id;
      dispatch(getMenu(parsedId));
    }
  }, [dispatch, id]);

  if (loading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!menu) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: MenuFormValues) => {
    // Transform the menu to ensure it matches the ActionMenu type
    const transformedMenu = transformMenuForAction(menu, values);

    dispatch(updateMenu(transformedMenu))
      .then(() => {
        // Navigate to the menus list after successful update
        navigate("/settings/website/menus");
      })
      .catch((error) => {
        // Error is already handled in the action creator
        console.error("Update failed:", error);
      });
  };

  // Helper function to transform Menu to ActionMenu
  function transformMenuForAction(
    originalMenu: Menu,
    formValues: MenuFormValues
  ): ActionMenu {
    // Create a new object with both original menu data and form values
    const updatedMenu = {
      ...originalMenu,
      ...formValues,
      id: originalMenu.id,
    };

    // Process menu items recursively to ensure all items have required properties
    if (updatedMenu.menu && updatedMenu.menu.length > 0) {
      updatedMenu.menu = processMenuItems(updatedMenu.menu);
    }

    return updatedMenu as ActionMenu;
  }

  // Process menu items recursively to ensure all names are defined
  function processMenuItems(items: any[]): any[] {
    return items.map((item) => {
      const processedItem = {
        ...item,
        name: item.name || "",
      };

      // Process nested menu items recursively
      if (processedItem.menu && processedItem.menu.length > 0) {
        processedItem.menu = processMenuItems(processedItem.menu);
      }

      return processedItem;
    });
  }

  return (
    <>
      <Helmet title={`${menu?.name || "Unknown"} - Edit Menu`} />
      <div className="w-full max-w-4xl mx-auto">
        <MenuForm data={menu} onCreate={onUpdate} />
      </div>
    </>
  );
}

export default EditMenu;
