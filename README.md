# Ollama Chat Interface

A modern chatbot application built with Next.js 15 and [Cloudscape Design](https://cloudscape.design/) System, designed to interact with local AI models through Ollama.

## Features

- 🤖 **Local AI Integration**: Connect to local Ollama models
- 💬 **Real-time Chat**: Streaming responses with typing indicators
- 🎛️ **Model Controls**: Adjustable parameters (temperature, top-p, max tokens up to 10K)
- 🎨 **Modern UI**: Built with AWS Cloudscape Design System with professional chat bubbles
- ⚡ **Fast Development**: Powered by Next.js 15 with Turbopack
- 💪 **TypeScript**: Full type safety across all components
- 🧠 **Thinking Models**: Support for reasoning models with collapsible thinking process
- 📋 **Smart Copy**: Copy responses excluding thinking content
- 📊 **Parameter Display**: Real-time parameter values shown in chat interface
- 👍 **Message Feedback**: Thumbs up/down for assistant responses
- 📝 **Markdown Support**: Rich formatting for assistant responses

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **UI Library**: AWS Cloudscape Design System
- **Styling**: SCSS + Cloudscape Global Styles
- **AI Integration**: Ollama (via LangChain with InMemoryStore)
- **Language**: TypeScript

## Project Structure

```shell
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── chat/          # Chat streaming endpoint
│   │   └── models/        # Model listing endpoint
│   ├── page.tsx           # Main application entry
│   └── layout.tsx         # Root layout
├── components/
│   ├── chat/              # Chat-related components (TypeScript)
│   │   ├── ChatContainer.tsx
│   │   ├── ChatInputPanel.tsx
│   │   ├── ChatAvatar.tsx
│   │   └── MessageList.tsx
│   └── layout/            # Layout utilities (TypeScript)
│       ├── FittedContainer.tsx
│       └── ScrollableContainer.tsx
├── layout/                # Main layout components (TypeScript)
│   ├── BaseAppLayout.tsx  # Primary app layout
│   └── SideBar.tsx        # Model selection & controls
├── hooks/                 # Custom React hooks (TypeScript)
│   └── useFilesDragging.ts
├── utils/                 # Utility functions (TypeScript)
│   └── i18nStrings.ts
└── styles/               # Custom styling
```

## Prerequisites

- Node.js 18+
- [Ollama](https://ollama.ai) installed and running locally
- At least one Ollama model downloaded (e.g., `ollama pull llama2`)

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start Ollama** (in a separate terminal):

   ```bash
   ollama serve
   ```

3. **Download a model** (if you haven't already):

   ```bash
   ollama pull llama3.2
   # or for thinking models:
   ollama pull deepseek-r1:1.5b
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development Status

### ✅ Completed

- [x] Next.js 15 project setup with Turbopack
- [x] Cloudscape Design System integration
- [x] Chat UI components and layout
- [x] Model parameter controls (temperature, top-p, max tokens)
- [x] Streaming message interface
- [x] Responsive design with proper scrolling
- [x] **Server API Implementation** (`/src/app/api/`)
  - [x] `/api/models` - List available Ollama models
  - [x] `/api/chat` - Handle chat requests with streaming
- [x] LangChain Ollama integration with streaming support
- [x] TypeScript conversion for all components
- [x] Error handling and connection status
- [x] Model switching and validation
- [x] Chat history management with session support
- [x] Professional chat bubbles with Cloudscape chat components
- [x] Markdown rendering for assistant responses
- [x] Thinking models support with expandable sections
- [x] Message feedback system (thumbs up/down)
- [x] Smart copy functionality (excludes thinking content)
- [x] Settings modal in chat input panel
- [x] Real-time parameter display
- [x] Enhanced max tokens range (up to 10,240)

### 📋 Planned Features

- [x] File upload support for multimodal models
- [x] Chat history management (in-memory)
- [x] Professional chat interface with message actions
- [x] Thinking models support
- [x] Enhanced user experience features
- [ ] Model performance metrics
- [ ] Custom system prompts
- [ ] Export chat conversations

## API Endpoints

### `GET /api/models`

Returns list of available Ollama models

```json
{
  "foundationModels": [
    {
      "modelId": "llama2:latest",
      "modelName": "llama2"
    }
  ]
}
```

### `POST /api/chat`

Streaming chat endpoint that accepts:

```json
{
  "message": "Hello, how are you?",
  "modelId": "llama2:latest",
  "maxTokens": 1024,
  "temperature": 0.1,
  "topP": 0.5
}
```

Returns a streaming text response.

### `POST /api/chat-multimodal`

Multimodal chat endpoint for file uploads (FormData):

- `message`: Text message
- `modelId`: Model identifier
- `maxTokens`, `temperature`, `topP`: Model parameters
- `files`: Uploaded files (images for vision models)

Returns a streaming text response with image understanding.

### `POST /api/clear-history`

Clears chat history for a session:

```json
{
  "sessionId": "session-123456789"
}
```

## Supported Model Types

### Standard Models

- **Llama 3.2, 3.1**: General purpose conversation
- **Mistral**: Fast and efficient responses
- **CodeLlama**: Code generation and explanation

### Thinking/Reasoning Models

- **DeepSeek-R1**: Advanced reasoning with thinking process
- **QwQ**: Question-answering with detailed reasoning
- Models that output `<think></think>` tags are automatically supported

### Multimodal Models

- **LLaVA**: Vision and language understanding
- **Bakllava**: Image analysis and description
- Drag and drop images directly into the chat interface

## Features Overview

- **🎯 Fully Functional**: Complete chatbot with local Ollama integration
- **⚡ Real-time Streaming**: Live response streaming from Ollama models
- **🔧 Model Controls**: Adjustable temperature, top-p, and max tokens (up to 10K)
- **📁 File Support**: Drag & drop file upload with multimodal model support
- **📜 History Management**: In-memory conversation history with session support
- **🧠 Thinking Models**: Expandable sections for reasoning model thought processes
- **📋 Smart Actions**: Copy, feedback, and message interaction features
- **📊 Parameter Visibility**: Real-time display of current model settings
- **📝 Rich Formatting**: Markdown rendering with code syntax highlighting
- **💪 TypeScript**: Full type safety across all components
- **🎨 Modern UI**: Professional chat bubbles with Cloudscape Design System

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Features in Detail

### 🧠 Thinking Models Support

- Automatically detects `<think></think>` tags in responses
- Collapses thinking process into expandable sections
- Clean main responses with optional reasoning details

### 📋 Message Actions

- **Copy**: Smart copy that excludes thinking content
- **Feedback**: Thumbs up/down for assistant responses
- **Visual Feedback**: Immediate confirmation for user actions

### 🎛️ Enhanced Controls

- **Settings Modal**: Accessible from chat input area
- **Parameter Display**: Real-time values shown below chat
- **Extended Range**: Max tokens up to 10,240 (default: 4,096)

### 🎨 Professional UI

- **Chat Bubbles**: Modern design with avatars and actions
- **Markdown Rendering**: Rich formatting for code and text
- **Responsive Design**: Works on desktop and mobile devices

## Contributing

This project provides a complete, production-ready chatbot interface for local Ollama models with advanced features like thinking model support, professional UI components, and comprehensive user interaction capabilities.

## License

Private project - not for distribution.
