import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLogSheetList, fetchTemplateList } from "./api";
import { Template, LogSheet } from "./types";

const STORAGE_KEY = "dynamicLogSheet_selectedTemplateId";

// Helper functions for localStorage operations
const getSavedTemplateId = (): number | null => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? Number(saved) : null;
};

const saveTemplateId = (templateId: number): void => {
  localStorage.setItem(STORAGE_KEY, templateId.toString());
};

// Helper to find and select the appropriate template
const getTemplateToSelect = (templates: Template[]): Template | null => {
  if (templates.length === 0) return null;

  const savedId = getSavedTemplateId();
  return savedId
    ? templates.find((t) => t.id === savedId) || templates[0]
    : templates[0];
};

export const useListing = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [logSheets, setLogSheets] = useState<LogSheet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>("");

  // Fetch templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templateList = await fetchTemplateList();
        setTemplates(templateList);

        const templateToSelect = getTemplateToSelect(templateList);
        if (templateToSelect) {
          setSelectedTemplate(templateToSelect);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    loadTemplates();
  }, []);

  // Fetch log sheets when selected template changes or search value changes
  useEffect(() => {
    const loadLogSheets = async () => {
      if (!selectedTemplate) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetchLogSheetList({
          template: selectedTemplate.id,
          search: searchValue || undefined,
        });

        setLogSheets(response.results || []);
      } catch (error) {
        console.error("Error fetching log sheets:", error);
        setLogSheets([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      loadLogSheets();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedTemplate, searchValue]);

  const handleTemplateChange = (template: Template) => {
    setSelectedTemplate(template);
    saveTemplateId(template.id);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleRowClick = (logSheet: LogSheet) => {
    navigate(`/dynamic-log-sheet/${logSheet.id}`);
  };

  return {
    templates,
    selectedTemplate,
    logSheets,
    isLoading,
    searchValue,
    handleTemplateChange,
    handleSearchChange,
    handleRowClick,
  };
};
