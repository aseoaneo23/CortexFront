# Cortex

**Cortex** is an intelligent knowledge management system that helps you capture, process, and organize information from multiple sources using AI. It transforms raw input (text, URLs, images) into a structured knowledge base with summaries, tags, and actionable tasks.

## Purpose

We are overwhelmed with information. Cortex solves the "collecting without processing" problem by providing a streamlined workflow to capture raw data into an Inbox and then use AI (via Ollama) to distill that data into meaningful, categorized notes and tasks.

## Features

- **Omnicapture**: Quickly save text, URLs, and images to your Inbox.
- **AI Processing**: Use local AI (Ollama) to automatically generate summaries, categories, and tags.
- **Tasks & Collections**: Separate actionable tasks from reference knowledge.
- **Minimalist UI**: High-contrast, premium mobile interface built with React Native and Expo.
- **Local First**: Keep your data and AI processing local for maximum privacy.

## Install

### Prerequisites

- **Frontend**: Node.js (v18+), npm/yarn, Expo Go (on your mobile device).
- **Backend**: Java 17+, Maven, SQLite.
- **AI**: [Ollama](https://ollama.ai/) installed and running locally with the `llama2` or `mistral` model.

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aseoaneo23/Cortex.git
   cd Cortex
   ```

2. **Set up the Backend**:
   ```bash
   cd backend
   # Configure application.properties if needed
   mvn spring-boot:run
   ```

3. **Set up the Frontend**:
   ```bash
   cd ../frontend/CortexFront
   npm install
   npx expo start
   ```

## Usage

1. **Capture**: Use the "Capture" tab to paste content or upload images.
2. **Process**: Go to the "Pending" tab. Review incoming items and click "Accept" to let Cortex analyze them.
3. **Organize**: Find your processed notes in "Collections" and your to-dos in "Tasks".
4. **Detail**: Click on any item to see the AI-generated summary and full markdown content.

## Configuration

- **API Endpoint**: Update `constants/api.ts` in the frontend with your backend IP address.
- **AI Model**: The backend defaults to Ollama. Ensure the service is reachable at `localhost:11434`.

## Compatibility

- **Web**: Supported via Expo for Web.
- **Mobile**: iOS and Android via Expo Go.
- **Desktop**: Not officially supported, but web build works on browsers.

## Troubleshooting

- **AI not responding**: Check if Ollama is running (`ollama list`).
- **Network Error**: Ensure your mobile device and backend server are on the same Wi-Fi network and the IP in `api.ts` is correct.

## Support Channels

- **Issues**: Open a bug report on GitHub.
- **Discussions**: Join our GitHub Discussions forum.
- **Email**: Reach out at support@cortex-app.io (dummy).
