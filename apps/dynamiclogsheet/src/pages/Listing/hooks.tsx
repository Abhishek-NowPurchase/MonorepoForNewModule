import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchLogSheetList, fetchTemplateList, fetchFieldConfigs } from "./api";
import { Template, LogSheet, FieldConfig } from "./types";
import { useCategoryFromRoute } from "../../utils/routeUtils";

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
  const location = useLocation();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [logSheets, setLogSheets] = useState<LogSheet[]>([]);
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Determine category from route
  const categoryRoute = useCategoryFromRoute();
  // Map route category to API category number: 1 = Master, 2 = Operational
  const categoryNumber = useMemo(() => {
    return categoryRoute === 'operational' ? 2 : 1;
  }, [categoryRoute]);

  // Filter templates by category number
  // Only show templates that have the matching category number
  // Exclude templates with category: null
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Only include templates that have a category and it matches the current route
      return template.category === categoryNumber;
    });
  }, [templates, categoryNumber]);

  // Fetch templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templateList = await fetchTemplateList();
        setTemplates(templateList);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    loadTemplates();
  }, []);

  // Update selected template when category or templates change
  useEffect(() => {
    if (filteredTemplates.length > 0) {
      const savedId = getSavedTemplateId();
      const templateToSelect = savedId
        ? filteredTemplates.find((t) => t.id === savedId) || filteredTemplates[0]
        : filteredTemplates[0];
      
      // Only update if the template is different or if no template is selected
      if (templateToSelect && (!selectedTemplate || templateToSelect.id !== selectedTemplate.id)) {
        setSelectedTemplate(templateToSelect);
      }
    } else {
      // If no templates match the category, clear selection
      if (selectedTemplate) {
        setSelectedTemplate(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTemplates, categoryRoute]);

  // Fetch field configs when selected template changes
  useEffect(() => {
    const loadFieldConfigs = async () => {
      if (!selectedTemplate) {
        setFieldConfigs([]);
        return;
      }

      try {
        const configs = await fetchFieldConfigs(selectedTemplate.id);
        setFieldConfigs(configs);
      } catch (error) {
        console.error("Error fetching field configs:", error);
        setFieldConfigs([]);
      }
    };

    loadFieldConfigs();
  }, [selectedTemplate]);

  // Fetch log sheets when selected template changes
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
          page: page,
          page_size: pageSize,
          category: categoryNumber,
        });

        setLogSheets(response.results || []);
        setTotalCount(response.count || 0);
      } catch (error) {
        console.error("Error fetching log sheets:", error);
        setLogSheets([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogSheets();
  }, [selectedTemplate, page, pageSize, categoryNumber]);

  const handleTemplateChange = (template: Template) => {
    setSelectedTemplate(template);
    saveTemplateId(template.id);
    setPage(1); // Reset to first page when template changes
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when page size changes
  };

  const handleRowClick = (logSheet: LogSheet) => {
    navigate(`/dynamic-log-sheet/${categoryRoute}/${logSheet.id}`);
  };

  return {
    templates: filteredTemplates,
    selectedTemplate,
    logSheets,
    fieldConfigs,
    isLoading,
    page,
    pageSize,
    totalCount,
    handleTemplateChange,
    handlePageChange,
    handlePageSizeChange,
    handleRowClick,
  };
};
