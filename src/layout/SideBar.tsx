'use client';
import React, { useState, useEffect } from "react";
import {
    SideNavigation,
    Select,
    FormField,
    SpaceBetween,
    SelectProps,
}   from "@cloudscape-design/components";

interface SideBarProps {
  selectedModel: SelectProps.Option | null;
  setSelectedModel: (model: SelectProps.Option | null) => void;
}

type LoadingStatus = 'pending' | 'loading' | 'error' | 'finished';

export default function SideBar({
  selectedModel,
  setSelectedModel,
}: SideBarProps) {
  const [activeHref, setActiveHref] = useState("#/page1");
  const [modelOptions, setModelOptions] = useState<SelectProps.Option[]>([]);
  const [modelsLoadingStatus, setModelsLoadingStatus] = useState<LoadingStatus>('pending');
  const [modelErrorText, setModelErrorText] = useState('');

  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoadingStatus('loading');
      try {
        const response = await fetch('/api/models');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.foundationModels && Array.isArray(data.foundationModels)) {
          const formattedOptions = data.foundationModels.map((model: any) => ({
            label: model.modelName,
            value: model.modelId,
          }));
          setModelOptions(formattedOptions);
          setModelsLoadingStatus('finished');
        } else {
          console.error('Fetched data does not contain foundationModels array:', data);
          throw new Error('Invalid data structure received from API.');
        }

      } catch (error) {
        console.error("Failed to fetch models:", error);
        setModelErrorText((error as Error).message || 'Failed to fetch models. Please try again.');
        setModelsLoadingStatus('error');
      }
    };

    fetchModels();
  }, []);

  return (
    <SpaceBetween direction="vertical" size="m">
      <SideNavigation
        activeHref={activeHref}
        header={{ href: "#/", text: "Model Settings" }}
        onFollow={event => {
        if (!event.detail.external) {
          event.preventDefault();
          setActiveHref(event.detail.href);
        }
      }}
        itemsControl={
          <FormField label="Select Model" stretch={true}>
            <Select
              selectedOption={selectedModel}
              onChange={({ detail }) => setSelectedModel(detail.selectedOption)}
              options={modelOptions}
              statusType={modelsLoadingStatus === 'error' ? 'error' : modelsLoadingStatus === 'loading' ? 'loading' : 'finished'}
              loadingText="Loading foundation models..."
              errorText={modelErrorText}
              placeholder={modelsLoadingStatus === 'loading' ? "Loading..." : "Choose a foundation model"}
              filteringType="auto"
              ariaLabel="Foundation model selection"
              disabled={modelsLoadingStatus === 'loading' || modelsLoadingStatus === 'error'}
            />
          </FormField>
        }
      items={[]}
    />
    </SpaceBetween>
  );
}