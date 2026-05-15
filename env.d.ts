/// <reference types="vite/client" />

declare module 'virtual:build-info' {
  export const gitCommit: string
  export const gitCommitDate: string
}
