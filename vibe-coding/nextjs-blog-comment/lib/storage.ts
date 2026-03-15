import { writeFile, mkdir } from "fs/promises";
import path from "path";

export class LocalStorageProvider {
  private uploadDir: string;

  constructor(uploadDir = "public/uploads") {
    this.uploadDir = uploadDir;
  }

  async upload(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    const dir = path.join(process.cwd(), this.uploadDir);
    await mkdir(dir, { recursive: true });

    const filePath = path.join(dir, name);
    await writeFile(filePath, buffer);

    return name;
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }
}
