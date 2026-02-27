"use client";

import React, { useState } from "react";
import { Upload, FileCheck, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function PrescriptionPage() {
    const [prescriptionFiles, setPrescriptionFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setPrescriptionFiles(prev => [...prev, ...files]);
            toast.success(`อัปโหลด ${files.length} ไฟล์แล้ว`);
        }
    };

    const handleRemoveFile = (index: number) => {
        setPrescriptionFiles(prev => prev.filter((_, i) => i !== index));
        toast.success("ลบไฟล์แล้ว");
    };

    const handleClear = () => {
        setPrescriptionFiles([]);
        toast.success("ล้างไฟล์แล้ว");
    };

    const handleUpload = async () => {
        if (prescriptionFiles.length === 0) {
            toast.error("กรุณาเลือกไฟล์ใบสั่งยา");
            return;
        }

        setUploading(true);
        try {
            // Here you would typically upload the files to your backend
            // For now, just simulate a successful upload
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`อัปโหลด ${prescriptionFiles.length} ใบสั่งยาแล้ว`);
            setPrescriptionFiles([]);
        } catch (error) {
            toast.error("ไม่สามารถอัปโหลดไฟล์ได้");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">อัปโหลดใบสั่งยา</h1>
                    <p className="text-gray-600">
                        อัปโหลดใบสั่งยาของคุณสำหรับยาที่ต้องการใบสั่งแพทย์
                    </p>
                </div>

                {/* Upload Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            อัปโหลดรูปภาพใบสั่งยา
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* File Input */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-input"
                                />
                                <label htmlFor="file-input" className="cursor-pointer block">
                                    <div className="flex flex-col items-center gap-2">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <p className="font-semibold text-gray-700">
                                            คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            JPG, PNG หรือ PDF (สูงสุด 10MB ต่อไฟล์)
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* File List */}
                            {prescriptionFiles.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                        <FileCheck className="w-4 h-4" />
                                        ไฟล์ที่เลือก ({prescriptionFiles.length})
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        {prescriptionFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <FileCheck className="w-5 h-5 text-primary flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 truncate">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="ml-2 p-1 hover:bg-red-50 rounded text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-4">
                                <Button
                                    onClick={handleUpload}
                                    disabled={prescriptionFiles.length === 0 || uploading}
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {uploading ? "กำลังอัปโหลด..." : "อัปโหลดใบสั่งยา"}
                                </Button>
                                {prescriptionFiles.length > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={handleClear}
                                        disabled={uploading}
                                    >
                                        ล้าง
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">ข้อมูลสำคัญ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>ใบสั่งยาจะถูกตรวจสอบโดยเภสัชกร</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>ช่วงเวลาการตรวจสอบปกติใช้เวลา 1-2 วันทำการ</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>ใบสั่งยาจะต้องเป็นของคนที่เหมือนกับผู้สั่งซื้อ</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>ใบสั่งยาจะต้องมีวันที่ชัดเจนและไม่เกิน 6 เดือน</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
