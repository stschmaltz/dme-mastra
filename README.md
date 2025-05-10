# dme-mastra

A modular agent-based weather assistant built with the Mastra framework. This project demonstrates how to create AI agents with memory, tool usage, and external API integration using TypeScript.

## Features

- Uses OpenAI GPT-4o for natural language understanding
- Integrates with Open-Meteo APIs for real-time weather data
- Persistent memory with LibSQL
- Extensible tool and agent architecture

## Project Structure

- `src/mastra/agents/` — Agent definitions
- `src/mastra/tools/` — Tool definitions
- `src/mastra/index.ts` — Mastra instance setup and configuration

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```sh
npm install
```

### Development

```sh
npm run dev
```

### Build

```sh
npm run build
```

## Scripts

- `dev`: Start the Mastra development server
- `build`: Build the project
