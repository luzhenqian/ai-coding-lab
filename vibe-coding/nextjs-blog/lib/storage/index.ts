export interface StorageProvider {
  upload(file: File): Promise<string>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

export { LocalStorageProvider } from "./local";
