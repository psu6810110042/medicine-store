'use client';

import React, { useState } from 'react';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types/product';
import { Plus, X } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (category: Category) => void;
}

export function AddCategoryModal({ isOpen, onClose, onSuccess }: AddCategoryModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('กรุณากรอกชื่อหมวดหมู่');
            return;
        }

        try {
            setLoading(true);
            const newCategory = await categoryService.createCategory(name, description);
            onSuccess(newCategory);
            setName('');
            setDescription('');
            onClose();
        } catch (err) {
            console.error('Failed to create category:', err);
            alert('ไม่สามารถเพิ่มหมวดหมู่ได้');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">เพิ่มหมวดหมู่ใหม่</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            ชื่อหมวดหมู่ *
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="เช่น ยาแก้ปวด"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            คำอธิบาย
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="หมวดหมู่นี้สำหรับ..."
                            rows={3}
                            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            ยกเลิก
                        </Button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-700 disabled:opacity-50 font-medium transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            {loading ? 'กำลังเพิ่ม...' : 'เพิ่มหมวดหมู่'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
