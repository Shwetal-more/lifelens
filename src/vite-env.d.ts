/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  // add other frontend env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

