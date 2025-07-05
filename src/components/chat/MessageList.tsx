import React, { useState } from 'react';
import {
  Box,
  SpaceBetween,
  ButtonGroup,
  StatusIndicator,
  ExpandableSection,
  CopyToClipboard
} from '@cloudscape-design/components';
import ChatBubble from '@cloudscape-design/chat-components/chat-bubble';
import Avatar from '@cloudscape-design/chat-components/avatar';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface MessageListProps {
  messages: Message[];
  streamingMessage?: Message | null;
}

const MessageList = ({ messages, streamingMessage }: MessageListProps) => {
  const [messageFeedback, setMessageFeedback] = useState<Record<number, string>>({});

  const parseThinkingContent = (content: string) => {
    const thinkRegex = /<think>(.*?)<\/think>/s;
    const match = content.match(thinkRegex);

    if (match) {
      const thinkingContent = match[1].trim();
      const mainContent = content.replace(thinkRegex, '').trim();
      return { thinkingContent, mainContent };
    }

    return { thinkingContent: null, mainContent: content };
  };

  const handleFeedback = (messageId: number, feedbackType: string) => {
    setMessageFeedback(prev => ({
      ...prev,
      [messageId]: feedbackType
    }));
  };



  return (
    <SpaceBetween size="s">
      {messages.map(message => (
        <ChatBubble
          key={message.id}
          type={message.role === 'assistant' ? 'incoming' : 'outgoing'}
          ariaLabel={message.role === 'assistant' ? 'AI Assistant' : 'You'}
          actions={message.role === 'assistant' ? (
            <ButtonGroup
              ariaLabel="Chat bubble actions"
              variant="icon"
              items={[
                {
                  type: 'group',
                  text: 'Feedback',
                  items: [
                    {
                      type: 'icon-button',
                      id: `helpful-${message.id}`,
                      iconName: messageFeedback[message.id] === 'helpful' ? 'thumbs-up-filled' : 'thumbs-up',
                      text: 'Helpful',
                      disabled: messageFeedback[message.id] === 'helpful',
                      onClick: () => handleFeedback(message.id, 'helpful')
                    },
                    {
                      type: 'icon-button',
                      id: `not-helpful-${message.id}`,
                      iconName: messageFeedback[message.id] === 'not-helpful' ? 'thumbs-down-filled' : 'thumbs-down',
                      text: 'Not helpful',
                      disabled: messageFeedback[message.id] === 'not-helpful' || messageFeedback[message.id] === 'helpful',
                      onClick: () => handleFeedback(message.id, 'not-helpful')
                    }
                  ]
                },
                {
                  type: "icon-button",
                  id: "copy",
                  iconName: "copy",
                  text: "Copy",
                  popoverFeedback: (
                    <StatusIndicator type="success">
                      Message copied
                    </StatusIndicator>
                  )
                },
              ]}
            />
          ) : undefined}
          avatar={
            message.role === 'assistant' ? (
              <Avatar
                color="gen-ai"
                iconName="gen-ai"
                ariaLabel="AI Assistant"
                tooltipText="AI Assistant"
              />
            ) : (
              <Avatar
                initials="PC"
                ariaLabel="PC"
                tooltipText="PC"
              />
            )
          }
        >
          <Box padding={{ top: 'xs', bottom: 'xs' }}>
            {message.role === 'assistant' ? (
              (() => {
                const { thinkingContent, mainContent } = parseThinkingContent(message.content);
                return (
                  <SpaceBetween size="s">
                    {thinkingContent && (
                      <ExpandableSection headerText="Thinking Process">
                        <ReactMarkdown
                          components={{
                            pre: ({ node, ...props }) => (
                              <div className="code-block-container">
                                <pre {...props} />
                              </div>
                            ),
                            code: ({ node, inline, ...props }) =>
                              inline ? (
                                <code className="inline-code" {...props} />
                              ) : (
                                <code className="code-block" {...props} />
                              ),
                          }}
                        >
                          {thinkingContent}
                        </ReactMarkdown>
                      </ExpandableSection>
                    )}
                    <ReactMarkdown
                      components={{
                        pre: ({ node, ...props }) => (
                          <div className="code-block-container">
                            <pre {...props} />
                          </div>
                        ),
                        code: ({ node, inline, ...props }) =>
                          inline ? (
                            <code className="inline-code" {...props} />
                          ) : (
                            <code className="code-block" {...props} />
                          ),
                      }}
                    >
                      {mainContent}
                    </ReactMarkdown>
                  </SpaceBetween>
                );
              })()
            ) : (
              <Box>{message.content}</Box>
            )}
          </Box>
        </ChatBubble>
      ))}

      {streamingMessage && (
        <ChatBubble
          key={streamingMessage.id}
          type="incoming"
          ariaLabel="AI Assistant"
          avatar={
            <Avatar
              color="gen-ai"
              iconName="gen-ai"
              ariaLabel="AI Assistant"
              tooltipText="AI Assistant"
              loading={true}
            />
          }
        >
          <Box padding={{ top: 'xs', bottom: 'xs' }}>
            {(() => {
              const { thinkingContent, mainContent } = parseThinkingContent(streamingMessage.content);
              return (
                <SpaceBetween size="s">
                  {thinkingContent && (
                    <ExpandableSection headerText="Thinking Process">
                      <ReactMarkdown
                        components={{
                          pre: ({ node, ...props }) => (
                            <div className="code-block-container">
                              <pre {...props} />
                            </div>
                          ),
                          code: ({ node, inline, ...props }) =>
                            inline ? (
                              <code className="inline-code" {...props} />
                            ) : (
                              <code className="code-block" {...props} />
                            ),
                        }}
                      >
                        {thinkingContent}
                      </ReactMarkdown>
                    </ExpandableSection>
                  )}
                  <ReactMarkdown
                    components={{
                      pre: ({ node, ...props }) => (
                        <div className="code-block-container">
                          <pre {...props} />
                        </div>
                      ),
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code className="inline-code" {...props} />
                        ) : (
                          <code className="code-block" {...props} />
                        ),
                    }}
                  >
                    {mainContent}
                  </ReactMarkdown>
                  <span className="cursor">|</span>
                </SpaceBetween>
              );
            })()
            }
          </Box>
        </ChatBubble>
      )}
    </SpaceBetween>
  );
};

export default MessageList;