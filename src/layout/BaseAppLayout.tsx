'use client';
import React, { useState } from 'react';
import {
  AppLayoutToolbar,
  HelpPanel,
  SelectProps,
} from '@cloudscape-design/components';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import messages from '@cloudscape-design/components/i18n/messages/all.en';
import SideBar from "./SideBar";
import { ChatContainer } from "../components/chat";

const LOCALE = 'en';

export default function BaseAppLayout() {
  const [selectedModel, setSelectedModel] = useState<SelectProps.Option | null>(null);
  const [maxTokens, setMaxTokens] = useState<number>(4096);
  const [temperature, setTemperature] = useState<number>(0.1);
  const [topP, setTopP] = useState<number>(0.5);
  const [navigationOpen, setNavigationOpen] = useState<boolean>(true);
  const [toolsOpen, setToolsOpen] = useState<boolean>(false);

  return (
    <I18nProvider locale={LOCALE} messages={[messages]}>
      <AppLayoutToolbar
        navigationOpen={navigationOpen}
        onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
        navigation={
          <SideBar
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        }
        toolsOpen={toolsOpen}
        onToolsChange={({ detail }) => setToolsOpen(detail.open)}
        tools={<HelpPanel header={<h2>Overview</h2>}>Help content</HelpPanel>}
        content={
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ChatContainer
              selectedModel={selectedModel}
              maxTokens={maxTokens}
              setMaxTokens={setMaxTokens}
              temperature={temperature}
              setTemperature={setTemperature}
              topP={topP}
              setTopP={setTopP}
            />
          </div>
        }
      />
    </I18nProvider>
  );
}