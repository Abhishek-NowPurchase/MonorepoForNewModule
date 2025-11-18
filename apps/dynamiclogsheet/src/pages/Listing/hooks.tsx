import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLogSheetList, fetchTemplateList } from './api';
import { Template, LogSheet } from './types';

export const useListing = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [logSheets, setLogSheets] = useState<LogSheet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>('');

  // Fetch templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templateList = await fetchTemplateList();
        setTemplates(templateList);

        // Set the first template as selected by default
        if (templateList.length > 0) {
          setSelectedTemplate(templateList[0]);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
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
          search: searchValue || undefined
        });

        setLogSheets(response.results || []);
      } catch (error) {
        console.error('Error fetching log sheets:', error);
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
    handleRowClick
  };
};

