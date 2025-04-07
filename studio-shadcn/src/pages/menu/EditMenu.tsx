import { useEffect } from "react";
import MenuForm from "./components/MenuForm";
import { useDispatch, useSelector } from "react-redux";
import { updateMenu, getMenu } from "../../actions/menu";
import { useParams } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "lucide-react";
import { AppDispatch } from "../../store";

interface Menu {
  id: string;
  name: string;
  [key: string]: any;
}

interface RootState {
  menus: {
    details: {
      [key: string]: Menu | null;
    };
    loading: boolean;
  };
}

function EditMenu(): React.ReactElement {
  const navigate = useNavigation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { menu, loading } = useSelector((state: RootState) => {
    return {
      menu: id && state.menus.details[id] ? state.menus.details[id] : null,
      loading: state.menus.loading,
    };
  });

  useEffect(() => {
    if (id) {
      dispatch(getMenu(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-center items-center mt-4">
          <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!menu) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: Partial<Menu>) => {
    if (id) {
      dispatch(updateMenu({ ...menu, ...values })).then(() => {
        // Navigate to the list view instead of back to the edit page
        navigate("/settings/website/menus");
      });
    }
  };

  return (
    <>
      <Helmet title={`${menu?.name || "Menu"} - Edit Menu`} />
      <div className="w-full max-w-4xl mx-auto">
        <div>
          <MenuForm data={menu} onCreate={onUpdate} />
        </div>
      </div>
    </>
  );
}

export default EditMenu;
