"use client";

import { useState, useRef } from "react";

type ImageUploadProps = {
  onUpload: (url: string) => void;
};

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Upload failed");
      setUploading(false);
      return;
    }

    const data = await res.json();
    setPreview(data.url);
    onUpload(data.url);
    setUploading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="cursor-pointer rounded-lg border-2 border-dashed p-6 text-center hover:border-blue-500 dark:border-gray-700"
      >
        {uploading ? (
          <p className="text-sm text-gray-500">Uploading...</p>
        ) : preview ? (
          <img
            src={preview}
            alt="Uploaded"
            className="mx-auto h-32 object-contain"
          />
        ) : (
          <p className="text-sm text-gray-500">
            Click or drag to upload image (max 5MB)
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
