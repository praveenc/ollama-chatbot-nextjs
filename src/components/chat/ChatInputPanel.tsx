'use client';
import React, { useState, useRef } from 'react';
import {
  Box,
  FormField,
  PromptInput,
  FileInput,
  FileDropzone,
  FileTokenGroup,
  SpaceBetween,
  Icon,
  SelectProps,
  Modal,
  Button,
  Slider
} from '@cloudscape-design/components';

import useFilesDragging from '../../hooks/useFilesDragging';
import { fileTokenGroupI18nStrings } from '../../utils/i18nStrings';

interface ChatInputPanelProps {
  inputValue: string;
  onInputValueChange: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  selectedModel: SelectProps.Option | null;
  onFilesChange?: (files: File[]) => void;
  maxTokens: number;
  setMaxTokens: (tokens: number) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  topP: number;
  setTopP: (topP: number) => void;
}

const ChatInputPanel = ({
  inputValue,
  onInputValueChange,
  onSendMessage,
  isLoading,
  selectedModel,
  onFilesChange = () => {},
  maxTokens,
  setMaxTokens,
  temperature,
  setTemperature,
  topP,
  setTopP,
}: ChatInputPanelProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const { areFilesDragging } = useFilesDragging();
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);

  const handleFileChange = (newFiles: File[]) => {
    setFiles(prev => {
      const updatedFiles = [...prev, ...newFiles];
      onFilesChange(updatedFiles);
      return updatedFiles;
    });
  };

  const handleFileDismiss = (fileIndex: number) => {
    setFiles(files => {
      const updatedFiles = files.filter((_, index) => index !== fileIndex);
      onFilesChange(updatedFiles);
      return updatedFiles;
    });

    if (files.length === 1) {
      promptInputRef.current?.focus();
    }
  };

  return (
    <>
    <FormField
      stretch={true}
      label={selectedModel ? `Chatting with: ${selectedModel.label}` : "Select a model to chat"}
      constraintText={
        <>Character count: {inputValue.length} / 1024</>
      }
      errorText={
        inputValue.length > 1024 &&
        "The prompt exceeds character limit."
      }
    >
      <PromptInput
        ref={promptInputRef}
        value={inputValue}
        onChange={({ detail }) => onInputValueChange(detail.value)}
        onAction={onSendMessage}
        placeholder="Send a message"
        disabled={isLoading || !selectedModel}
        actionButtonAriaLabel={isLoading ? 'Send message button - suppressed' : 'Send message'}
        actionButtonIconName="send"
        ariaLabel={isLoading ? 'Prompt input - suppressed' : 'Chat input'}
        maxRows={8}
        minRows={3}
        disableSecondaryActionsPaddings
        secondaryActions={
          <SpaceBetween direction="horizontal" size="xs">
            <Box padding={{ left: 'xxs', top: 'xs' }}>
              <FileInput
                ariaLabel="Chat file input"
                variant="icon"
                multiple={true}
                value={files}
                onChange={({ detail }) => handleFileChange(detail.value)}
                disabled={isLoading}
              />
            </Box>
            <Box padding={{ top: 'xs' }}>
              <Button
                variant="icon"
                iconName="settings"
                ariaLabel="Model settings"
                onClick={() => setSettingsVisible(true)}
              />
            </Box>
          </SpaceBetween>
        }
        secondaryContent={
          areFilesDragging ? (
            <FileDropzone onChange={({ detail }) => handleFileChange(detail.value)}>
              <SpaceBetween size="xs" alignItems="center">
                <Icon name="upload" />
                <Box>Drop files here</Box>
              </SpaceBetween>
            </FileDropzone>
          ) : (
            files.length > 0 && (
              <FileTokenGroup
                items={files.map(file => ({ file }))}
                onDismiss={({ detail }) => handleFileDismiss(detail.fileIndex)}
                limit={3}
                alignment="horizontal"
                showFileThumbnail={true}
                i18nStrings={fileTokenGroupI18nStrings}
              />
            )
          )
        }
      />
    </FormField>

    <Modal
      onDismiss={() => setSettingsVisible(false)}
      visible={settingsVisible}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={() => setSettingsVisible(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setSettingsVisible(false)}>OK</Button>
          </SpaceBetween>
        </Box>
      }
      header="Model Parameters"
    >
      <SpaceBetween size="l">
        <FormField label={`Max Tokens: ${maxTokens}`}>
          <Slider
            onChange={({ detail }) => setMaxTokens(detail.value)}
            value={maxTokens}
            min={1024}
            max={10240}
            step={1024}
            ariaLabel="Max Tokens Slider"
          />
        </FormField>
        <FormField label={`Temperature: ${temperature.toFixed(1)}`}>
          <Slider
            onChange={({ detail }) => setTemperature(detail.value)}
            value={temperature}
            min={0}
            max={1.0}
            step={0.1}
            ariaLabel="Temperature Slider"
          />
        </FormField>
        <FormField label={`Top P: ${topP.toFixed(1)}`}>
          <Slider
            onChange={({ detail }) => setTopP(detail.value)}
            value={topP}
            min={0}
            max={1.0}
            step={0.1}
            ariaLabel="Top P Slider"
          />
        </FormField>
      </SpaceBetween>
    </Modal>
  </>
  );
};

export default ChatInputPanel;