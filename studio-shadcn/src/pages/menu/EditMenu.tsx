import React, { useEffect } from "react";
import MenuForm from "./components/MenuForm";
import { useSelector } from "react-redux";
import { updateMenu, getMenu } from "../../actions/menu";
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
    const updatedMenu: Menu = {
      ...menu,
      ...values,
      id: menu.id,
    };

    dispatch(updateMenu(updatedMenu))
      .then(() => {
        // Navigate to the menus list after successful update
        navigate("/settings/website/menus");
      })
      .catch((error) => {
        // Error is already handled in the action creator
        console.error("Update failed:", error);
      });
  };

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
