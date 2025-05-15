# dme-mastra

A modular agent-based D&D loot assistant built with the Mastra framework. This project demonstrates how to create AI agents that leverage SRD data and LLM generation for creating treasure.

## Features

- Uses OpenAI GPT for natural language understanding and loot generation
- Utilizes SRD (System Reference Document) data for D&D content
- Persistent memory with LibSQL (if applicable, otherwise remove)
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
