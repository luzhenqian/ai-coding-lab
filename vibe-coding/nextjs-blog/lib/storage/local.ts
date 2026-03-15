import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import type { StorageProvider } from "./index";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export class LocalStorageProvider implements StorageProvider {
  async upload(file: File): Promise<string> {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF`
      );
    }

    if (file.size > MAX_SIZE) {
      throw new Error(`File too large: ${file.size} bytes. Max: 5MB`);
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    return filename;
  }

  async delete(key: string): Promise<void> {
    const filepath = join(UPLOAD_DIR, key);
    await unlink(filepath).catch(() => {});
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }
}
