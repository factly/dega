import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tabsItems } from "@/components/statusBadge/index";

export interface StatusTabsProps<T = any> {
  status: string;
  handleStatusChange: (value: string) => void;
  isMobile: boolean;
  form: any;
  onSave: (values: T) => void;
  children: React.ReactNode;
}

const StatusTabs = <T extends Record<string, any>>({
  status,
  handleStatusChange,
  children,
  isMobile,
}: StatusTabsProps<T>) => {
  // Responsive handling for different screen sizes
  const [useCompactTabs, setUseCompactTabs] = React.useState(false);

  // Effect to detect medium screen sizes and switch to compact mode
  React.useEffect(() => {
    const checkScreenSize = () => {
      // Check if width is in the problematic range (768px-1045px)
      const isIntermediateSize =
        window.innerWidth > 768 && window.innerWidth < 1045;
      setUseCompactTabs(isIntermediateSize);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Render dropdown for mobile or compact view
  if (isMobile || useCompactTabs) {
    return (
      <Tabs
        defaultValue={status}
        onValueChange={handleStatusChange}
        value={status}
      >
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
              {tabsItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={status} className="mt-0">
          {children}
        </TabsContent>
      </Tabs>
    );
  }

  // Desktop view with full tabs
  return (
    <Tabs
      defaultValue={status}
      onValueChange={handleStatusChange}
      value={status}
    >
      <div className="flex items-center">
        <TabsList className="flex w-full">
          {tabsItems.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="flex-1 text-sm whitespace-nowrap px-1"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value={status} className="mt-0">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default StatusTabs;
