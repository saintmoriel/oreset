export interface StorageProvider {
  createUploadUrl(key: string, mimeType: string): Promise<string>
  createDownloadUrl(key: string): Promise<string>
  deleteFile(key: string): Promise<void>
}
