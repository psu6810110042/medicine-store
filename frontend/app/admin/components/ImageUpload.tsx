'use client';

import React, { useState } from 'react';
import { productService } from '../../services/productService';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);

            // Show preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload image
            const result = await productService.uploadImage(file);
            onChange(result.url);
        } catch (err) {
            console.error('Failed to upload image:', err);
            alert('ไม่สามารถอัปโหลดรูปภาพได้');
        } finally {
            setUploading(false);
        }
    };

    const handleClear = () => {
        setPreview(null);
        onChange('');
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/10 transition-colors">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium  text-muted-foreground">
                            {uploading ? 'กำลังอัปโหลด...' : 'คลิกเพื่ออัปโหลดรูปภาพ'}
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                </div>
                {preview && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4 text-red-500" />
                    </button>
                )}
            </div>
            {preview && (
                <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden border border-input">
                    <Image
                        src={preview}
                        alt="preview"
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </div>
            )}
        </div>
    );
}
