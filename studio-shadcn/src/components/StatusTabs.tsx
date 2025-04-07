import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pageStatusItems } from "@/components/statusBadge/index";
import { FilterParams } from "@/pages/pages/types";

export interface StatusTabsProps {
  status: string;
  handleStatusChange: (value: string) => void;
  isMobile: boolean;
  form: any;
  onSave: (values: FilterParams) => void;
  children: React.ReactNode;
}

const StatusTabs: React.FC<StatusTabsProps> = ({
  status,
  handleStatusChange,
  children,
  isMobile,
  form,
  onSave,
}) => {
  return (
    <Tabs
      defaultValue={status}
      onValueChange={handleStatusChange}
      value={status}
    >
      {!isMobile ? (
        <div className="flex items-center">
          <TabsList className="grid grid-cols-5 flex-1">
            {pageStatusItems.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      ) : (
        <div className="space-y-4 flex justify-between items-center">
          <Select
            defaultValue={status}
            value={status}
            onValueChange={handleStatusChange}
          >
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
        </div>
      )}

      <TabsContent value={status} className="mt-0">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default StatusTabs;
