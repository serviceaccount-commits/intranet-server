// src/types/environment.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string; // Make PORT optional, as it might not always be set
      DATABASE_URL?: string;
      NODE_ENV: "development" | "production" | "test"; // Example with specific values
      // Add other environment variables here
    }
  }
}

export {}; // This is important to make it a module
