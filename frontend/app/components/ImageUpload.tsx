'use client';

import { useState } from 'react';

export default function ImageUpload({
  folder = 'products',
  onUploadSuccess,
  label = 'Upload Image'
}: {
  folder?: string;
  onUploadSuccess?: (url: string) => void;
  label?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/upload/image/${folder}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setImageUrl(data.url);
      if (onUploadSuccess) {
        onUploadSuccess(data.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-card rounded-xl border border-border shadow-sm w-full mx-auto mt-4">
      {label && <h3 className="text-lg font-semibold mb-4 text-foreground">{label}</h3>}

      <div className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100
          "
        />

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {imageUrl && (
          <div className="space-y-2">
            <p className="text-sm text-green-600 font-medium">Upload Successful!</p>
            <div className="text-xs text-muted-foreground break-all bg-muted p-2 rounded">
              {imageUrl}
            </div>
            <p className="text-xs text-yellow-600 mt-2">
              Note: If the URL starts with http://rustfs:9000, it is an internal Docker URL.
              To view it, access via localhost:9000 (if mapped) or configure Public URL.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
