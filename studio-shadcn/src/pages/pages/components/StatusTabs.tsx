// components/StatusTabs.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusTabsProps } from "../types";
import FiltersPopover from "./FiltersPopover";

const StatusTabs = ({ status, handleStatusChange, isMobile, form, onSave, children }: StatusTabsProps) => {
  const pageStatusItems = [
    { value: "all", label: "All" },
    { value: "publish", label: "Published" },
    { value: "future", label: "Future Publish" },
    { value: "ready", label: "Ready to Publish" },
    { value: "draft", label: "Drafts" },
  ];

  return (
    <Tabs defaultValue={status} onValueChange={handleStatusChange} value={status}>
      {!isMobile ? (
        <TabsList className="grid grid-cols-5">
          {pageStatusItems.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      ) : (
        <div className="space-y-4 flex justify-between items-center">
          <Select defaultValue={status} value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={status} />
            </SelectTrigger>
            <SelectContent>
              {pageStatusItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isMobile && <FiltersPopover form={form} onSave={onSave} />}
        </div>

      )}

      <TabsContent value={status} className="mt-0">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default StatusTabs;
