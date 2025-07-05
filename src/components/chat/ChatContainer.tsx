'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Header,
  Box,
  Alert,
  SelectProps,
  KeyValuePairs,
} from '@cloudscape-design/components';

import { FittedContainer, ScrollableContainer } from '../../components/layout';
import ChatInputPanel from './ChatInputPanel';
import MessageList from './MessageList';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface ErrorState {
  type: 'error';
  title: string;
  content: string;
}

interface ChatContainerProps {
  selectedModel: SelectProps.Option | null;
  maxTokens: number;
  setMaxTokens: (tokens: number) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  topP: number;
  setTopP: (topP: number) => void;
}

const ChatContainer = ({ selectedModel, maxTokens, setMaxTokens, temperature, setTemperature, topP, setTopP }: ChatContainerProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [sessionId] = useState<string>(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const handleClearHistory = async () => {
    try {
      await fetch('/api/clear-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      setMessages([]);
      setStreamingMessage(null);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, streamingMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    setStreamingMessage(null);
  }, [selectedModel]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedModel || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const streamingId = Date.now() + 1;
    setStreamingMessage({
      id: streamingId,
      role: 'assistant',
      content: '',
    });

    try {
      if (files.length > 0) {
        console.log('Files to process:', files);
      }

      let response: Response;
      
      if (files.length > 0) {
        const formData = new FormData();
        formData.append('message', userMessage.content);
        formData.append('modelId', selectedModel.value);
        formData.append('maxTokens', maxTokens.toString());
        formData.append('temperature', temperature.toString());
        formData.append('topP', topP.toString());
        formData.append('sessionId', sessionId);
        
        files.forEach(file => {
          formData.append('files', file);
        });
        
        response = await fetch('/api/chat-multimodal', {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage.content,
            modelId: selectedModel.value,
            maxTokens,
            temperature,
            topP,
            sessionId,
          }),
        });
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported in this browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const decodedChunk = decoder.decode(value, { stream: true });
        fullContent += decodedChunk;

        setStreamingMessage(prev => ({
          ...prev!,
          content: fullContent,
        }));
      }

      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: streamingId,
          role: 'assistant',
          content: fullContent,
        }
      ]);

      setStreamingMessage(null);

    } catch (error) {
      console.error('Error sending message or fetching bot response:', error);

      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Error: ${(error as Error).message || 'Could not connect to the bot.'}`,
      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setStreamingMessage(null);

      setError({
        type: 'error',
        title: 'Connection Error',
        content: 'Failed to connect to the chat service. Please try again later.',
      });
    } finally {
      setIsLoading(false);
      setFiles([]);
    }
  };

  return (
    <>
      {error && (
        <Alert
          type={error.type}
          dismissible
          onDismiss={() => setError(null)}
          header={error.title}
        >
          {error.content || 'An error occurred'}
        </Alert>
      )}

      <FittedContainer>
        <Container
          header={
            <Header 
              variant="h2" 
              actions={
                <button 
                  onClick={handleClearHistory}
                  style={{ 
                    background: 'none', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px', 
                    padding: '4px 8px', 
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Clear History
                </button>
              }
            >
              Chat 💬
            </Header>
          }
          fitHeight
          disableContentPaddings={false}
          footer={
            <Box padding="m">
              <ChatInputPanel
                inputValue={inputValue}
                onInputValueChange={setInputValue}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                selectedModel={selectedModel}
                onFilesChange={setFiles}
                maxTokens={maxTokens}
                setMaxTokens={setMaxTokens}
                temperature={temperature}
                setTemperature={setTemperature}
                topP={topP}
                setTopP={setTopP}
              />
              <Box margin={{ top: 'xs' }}>
                <KeyValuePairs
                  columns={3}
                  items={[
                    {
                      label: "Temperature",
                      value: temperature.toFixed(1)
                    },
                    {
                      label: "Top P",
                      value: topP.toFixed(1)
                    },
                    {
                      label: "Max Tokens",
                      value: maxTokens.toString()
                    }
                  ]}
                />
              </Box>
            </Box>
          }
        >
          <ScrollableContainer>
            <Box padding="s">
              {messages.length === 0 ? (
                <Box color="text-body-secondary" textAlign="center" padding="l">
                  {selectedModel ? (
                    "Send a message to start chatting with the AI."
                  ) : (
                    "Please select a model from the sidebar to start chatting."
                  )}
                </Box>
              ) : (
                <MessageList
                  messages={messages}
                  streamingMessage={streamingMessage}
                />
              )}
              <div ref={messagesEndRef} />
            </Box>
          </ScrollableContainer>
        </Container>
      </FittedContainer>

      <style jsx="true">{`
        .inline-code {
          background-color: var(--color-background-code-inline);
          border-radius: 3px;
          padding: 0.2em 0.4em;
          font-family: monospace;
          font-size: 85%;
        }

        .code-block-container {
          position: relative;
          margin: 1em 0;
        }

        .code-block {
          display: block;
          overflow-x: auto;
          padding: 1em;
          background-color: var(--color-background-code-block);
          border-radius: 4px;
          font-family: monospace;
          white-space: pre;
          color: var(--color-text-body-default);
        }

        .cursor {
          display: inline-block;
          width: 0.5em;
          height: 1em;
          background-color: var(--color-text-body-default);
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default ChatContainer;