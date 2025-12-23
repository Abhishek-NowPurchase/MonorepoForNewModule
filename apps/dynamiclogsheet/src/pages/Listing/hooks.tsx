import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchTemplateList, fetchTemplateLogSheets } from "./api";
import { Template, TemplateLogSheetsResponse } from "./types";
import { useCategoryFromRoute } from "../../utils/routeUtils";

const STORAGE_KEY = "dynamicLogSheet_selectedTemplateId";

// Helper functions for localStorage operations
const getSavedTemplateId = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

const saveTemplateId = (templateId: string | number): void => {
  localStorage.setItem(STORAGE_KEY, String(templateId));
};

// Helper to get template identifier for matching (prefer template_id, fallback to id)
const getTemplateIdentifier = (template: Template): string => {
  return template.template_id || String(template.id);
};

// Helper to find and select the appropriate template
const getTemplateToSelect = (templates: Template[]): Template | null => {
  if (templates.length === 0) return null;

  const savedId = getSavedTemplateId();
  if (savedId) {
    // Try to match by template_id first, then by id
    return templates.find(
      (t) => t.template_id === savedId || String(t.id) === savedId
    ) || templates[0];
  }
  return templates[0];
};

export const useListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [logsheets, setLogsheets] = useState<TemplateLogSheetsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Pagination state
  const [pageNo, setPageNo] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [total, setTotal] = useState<number>(0);
  
  // Filter state
  const [status, setStatus] = useState<"pending" | "completed">("completed");
  const [platform, setPlatform] = useState<"web" | "kiosk">("web");

  // Determine category from route
  const categoryRoute = useCategoryFromRoute();
  // Map route category to API category number: 1 = Master, 2 = Operational
  const categoryNumber = useMemo(() => {
    return categoryRoute === 'operational' ? 2 : 1;
  }, [categoryRoute]);

  // Filter templates by category number
  // Show templates that match the category, or templates without category (null)
  // This handles cases where the new API doesn't provide category information
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // If template has no category, show it (allows backward compatibility)
      if (template.category === null || template.category === undefined) {
        return true;
      }
      // Otherwise, only show templates that match the current route category
      return template.category === categoryNumber;
    });
  }, [templates, categoryNumber]);

  // Fetch templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templateList = await fetchTemplateList({
          is_active: true, // Only get latest versions by default
        });
        
        // Map new API response to existing Template interface
        const mappedTemplates: Template[] = templateList.map((item) => {
          // Map category from API response ("master" or "operational") to category number
          // category: "master" -> 1, "operational" -> 2
          let category: number | null = null;
          let category_name: string | undefined = undefined;
          
          if (item.category) {
            const categoryLower = item.category.toLowerCase();
            if (categoryLower === 'master') {
              category = 1;
              category_name = 'Master';
            } else if (categoryLower === 'operational') {
              category = 2;
              category_name = 'Operational';
            }
          }
          
          // Store the template_id for API calls (this is what should be used for detail API)
          // Use template_id from API response (e.g., "f8904514-9d49-4c34-b939-7024ca467e9d")
          return {
            id: item.id, // Keep id for display/selection purposes
            template_id: item.template_id, // Store template_id for detail API calls
            name: item.template_name || '',
            version: item.version || '',
            template_name: item.template_name,
            description: item.description,
            platforms: item.platforms || [],
            category,
            category_name,
          };
        });
        
        setTemplates(mappedTemplates);
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
      let templateToSelect: Template | null = null;
      
      if (savedId) {
        // Try to match by template_id first, then by id
        templateToSelect = filteredTemplates.find(
          (t) => t.template_id === savedId || String(t.id) === savedId
        ) || filteredTemplates[0];
      } else {
        templateToSelect = filteredTemplates[0];
      }
      
      // Only update if the template is different or if no template is selected
      // Compare using template_id if available, otherwise use id
      if (templateToSelect && (!selectedTemplate || getTemplateIdentifier(templateToSelect) !== getTemplateIdentifier(selectedTemplate))) {
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

  // Fetch logsheets when selected template, pagination, or filters change
  useEffect(() => {
    const loadLogSheets = async () => {
      if (!selectedTemplate) {
        setLogsheets(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Use template_id for the logsheets API call (this is the correct field to use)
        // template_id is like "f8904514-9d49-4c34-b939-7024ca467e9d"
        // If template_id is not available, fall back to id
        const templateIdForApi = selectedTemplate.template_id || String(selectedTemplate.id);
        
        // Fetch logsheets using template_id with pagination and filters
        const response = await fetchTemplateLogSheets(templateIdForApi, {
          status,
          platform,
          page_no: pageNo,
          page_size: pageSize,
        });
        
        setLogsheets(response);
        setTotal(response.total);
      } catch (error) {
        console.error("Error fetching logsheets:", error);
        setLogsheets(null);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogSheets();
  }, [selectedTemplate, pageNo, pageSize, status, platform]);

  const handleTemplateChange = (template: Template) => {
    setSelectedTemplate(template);
    // Save the template_id if available, otherwise save the id
    saveTemplateId(template.template_id || String(template.id));
    // Reset pagination when template changes
    setPageNo(1);
  };

  const handlePageChange = (newPage: number) => {
    setPageNo(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageNo(1); // Reset to first page when page size changes
  };

  const handleStatusChange = (newStatus: "pending" | "completed") => {
    setStatus(newStatus);
    setPageNo(1); // Reset to first page when status changes
  };

  const handlePlatformChange = (newPlatform: "web" | "kiosk") => {
    setPlatform(newPlatform);
    setPageNo(1); // Reset to first page when platform changes
  };

  return {
    templates: filteredTemplates,
    selectedTemplate,
    logsheets,
    isLoading,
    handleTemplateChange,
    // Pagination
    pageNo,
    pageSize,
    total,
    handlePageChange,
    handlePageSizeChange,
    // Filters
    status,
    platform,
    handleStatusChange,
    handlePlatformChange,
  };
};
