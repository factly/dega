import React from "react";
import Editor from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyIcon } from "lucide-react";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  width?: string;
  height?: string;
  title?: string;
  themes?: string[];
  languages?: string[];
  className?: string;
  borderless?: boolean;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  language,
  width = "100%",
  height = "240px",
  title = "Editor",
  themes = ["vs-dark", "light"],
  languages = [],
  className,
  borderless = false,
}) => {
  const [currentTheme, setCurrentTheme] = React.useState(themes[0]);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [currentLanguage, setCurrentLanguage] = React.useState(language);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  // Handle expand/collapse
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Update language if prop changes
  React.useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  return (
    <Card
      className={cn(
        borderless ? "border-0 shadow-none" : "border shadow-sm",
        "overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between p-3 border-b">
        <div className="font-medium">{title}</div>
        <div className="flex items-center gap-2">
          {languages.length > 0 && (
            <Select
              value={currentLanguage}
              onValueChange={(lang) => setCurrentLanguage(lang)}
            >
              <SelectTrigger className="h-8 w-32">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {themes.length > 1 && (
            <Tabs
              value={currentTheme}
              onValueChange={setCurrentTheme}
              className="w-24"
            >
              <TabsList className="h-8">
                <TabsTrigger value="vs-dark" className="text-xs">
                  Dark
                </TabsTrigger>
                <TabsTrigger value="light" className="text-xs">
                  Light
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            title="Copy code"
          >
            <CopyIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-0 rounded-b-lg overflow-hidden">
        <Editor
          height={isExpanded ? "500px" : height}
          width={width}
          theme={currentTheme}
          options={{
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            cursorBlinking: "smooth",
            folding: true,
            lineNumbersMinChars: 4,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            scrollbar: {
              alwaysConsumeMouseWheel: false,
            },
            padding: { top: 10 },
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            renderLineHighlight: "all",
          }}
          onChange={onChange}
          language={currentLanguage}
          value={value}
          className="border-none"
        />
      </CardContent>
    </Card>
  );
};

export default MonacoEditor;
