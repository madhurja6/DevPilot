<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?style=for-the-badge&logo=spring-boot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google" alt="Google Gemini" />

  <h1>🚀 DevPilot</h1>
  <p><strong>Chat with your codebase using AI, RAG, and citations.</strong></p>
</div>

---

## 📖 Overview

**DevPilot** is an AI-powered developer tool that allows you to connect your GitHub repositories, index your code using Retrieval-Augmented Generation (RAG), and have natural language conversations with your codebase.

Whether you are onboarding to a new project, looking for specific logic, or debugging a complex issue, DevPilot gives you grounded answers with exact file and line citations.

## ✨ Features

- 🔐 **GitHub OAuth Integration**: Securely connect and sync your public and private repositories.
- ⚡ **Background Indexing**: Automatically chunk and embed your codebase into a vector database.
- 💬 **Real-time Streaming Chat**: Chat with your code using Server-Sent Events (SSE) for real-time token generation.
- 📚 **Grounded Citations**: Every answer includes clickable references pointing directly to the exact file and line in your repo.
- 🎨 **Modern UI**: A beautiful, responsive, dark-mode-first interface built with Tailwind CSS and Base UI.
- 📝 **Markdown & Syntax Highlighting**: AI responses support rich formatting, including code blocks and tables.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **UI Components**: Base UI / Radix UI primitives
- **Icons**: Lucide React

### Backend
- **Framework**: [Spring Boot 3](https://spring.io/projects/spring-boot)
- **Language**: Java 21
- **AI Integration**: Spring AI (Google Gemini)
- **Database**: MySQL
- **Security**: Spring Security (OAuth2)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Java 21](https://jdk.java.net/21/)
- [Docker](https://www.docker.com/) (for running MySQL)
- A GitHub OAuth App (for client ID and secret)
- A Google AI Studio API Key

### 1. Clone the repository

```bash
git clone https://github.com/madhurja6/devpilot.git
cd devpilot
```

### 2. Backend Setup (Spring Boot)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Start the PostgreSQL database using Docker:
   ```bash
   docker-compose up -d
   ```

3. Configure your `application.yml` (or use environment variables):
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/devpilot
       username: postgres
       password: password
     ai:
       google:
         genai:
           api-key: YOUR_GOOGLE_AI_API_KEY
           chat:
             options:
               model: gemini-3.8-flash # or the latest available
     security:
       oauth2:
         client:
           registration:
             github:
               client-id: YOUR_GITHUB_CLIENT_ID
               client-secret: YOUR_GITHUB_CLIENT_SECRET
   ```

4. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend will start on `http://localhost:8080`.*

### 3. Frontend Setup (Next.js)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or pnpm install / yarn install
   ```

3. Create a `.env.local` file and add the API URL:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will start on `http://localhost:3000`.*

---

## 📂 Project Structure

```text
devpilot/
├── backend/                  # Spring Boot Application
│   ├── src/main/java/...     # Java source code
│   ├── src/main/resources/   # application.yml
│   └── pom.xml
│
├── frontend/                 # Next.js Application
│   ├── app/                  # Next.js App Router (pages & layouts)
│   │   ├── dashboard/        # Protected dashboard routes
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components (UI, Chat, Dashboard)
│   ├── hooks/                # Custom React hooks (use-chats, use-repos)
│   ├── lib/                  # API clients, types, and utilities
│   └── package.json
│
└── README.md
```

---

## 🧠 How It Works

1. **Connect**: You authenticate via GitHub OAuth. The app fetches your repositories.
2. **Index**: You select a repository to index. The Spring Boot backend clones the repo, chunks the code files (e.g., using AST or text splitting), and generates embeddings using Google Gemini.
3. **Store**: The embeddings are stored in PostgreSQL using the `pgvector` extension.
4. **Chat**: When you ask a question, the backend performs a similarity search against the vector database to find relevant code snippets. It then passes those snippets, along with your question, to the LLM.
5. **Stream**: The LLM streams the answer back to the Next.js frontend using Server-Sent Events (SSE), complete with citations pointing back to the original files.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/madhurja6">Madhurja Adak</a></p>
</div>
