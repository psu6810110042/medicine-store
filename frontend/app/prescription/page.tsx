"use client";

import React, { useState, useRef } from "react";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function PrescriptionPage() {
  const { user, setIsLoginModalOpen } = useAuth();
  const [prescriptionFiles, setPrescriptionFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter((f) => {
      if (!f.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        toast.error(`${f.name}: รองรับเฉพาะ JPG, PNG หรือ WEBP`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name}: ขนาดไฟล์เกิน 5MB`);
        return false;
      }
      return true;
    });
    if (valid.length > 0) {
      setPrescriptionFiles((prev) => [...prev, ...valid]);
      toast.success(`เพิ่ม ${valid.length} ไฟล์`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setPrescriptionFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setPrescriptionFiles([]);
    setUploadedUrls([]);
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนอัปโหลดใบสั่งยา");
      setIsLoginModalOpen(true);
      return;
    }
    if (user.role !== "customer") {
      toast.error("เฉพาะลูกค้าเท่านั้นที่สามารถอัปโหลดใบสั่งยาได้");
      return;
    }
    if (prescriptionFiles.length === 0) {
      toast.error("กรุณาเลือกไฟล์ใบสั่งยา");
      return;
    }

    setUploading(true);
    const createdOrderIds: string[] = [];

    try {
      for (const file of prescriptionFiles) {
        // 1. Upload the image
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(`${API_URL}/upload/image/prescription`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err?.message || `ไม่สามารถอัปโหลด ${file.name}`);
        }

        const { url } = await uploadRes.json();

        // 2. Create a PRESCRIPTION-status order with the full image URL
        // (same pattern as ImageUpload.tsx — store the full proxy URL)
        const orderRes = await fetch(`${API_URL}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            items: [],
            prescriptionImage: url,
          }),
        });

        if (!orderRes.ok) {
          const err = await orderRes.json().catch(() => ({}));
          throw new Error(err?.message || "ไม่สามารถสร้างคำสั่งซื้อสำหรับใบสั่งยา");
        }

        const order = await orderRes.json();
        createdOrderIds.push(order.id);
      }

      setUploadedUrls(createdOrderIds); // reuse state to track success
      setPrescriptionFiles([]);
      toast.success(
        `ส่งใบสั่งยา ${createdOrderIds.length} ใบสำเร็จ! เภสัชกรจะตรวจสอบและดำเนินการให้`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถอัปโหลดไฟล์ได้");
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
            อัปโหลดใบสั่งยาของคุณ เภสัชกรจะตรวจสอบและจัดเตรียมยาให้คุณ
          </p>
        </div>

        {/* Auth warning */}
        {!user && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <p className="text-amber-800 text-sm">
                คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถอัปโหลดใบสั่งยาได้{" "}
                <button
                  className="font-semibold underline"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  เข้าสู่ระบบ
                </button>
              </p>
            </CardContent>
          </Card>
        )}

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
              {/* Drag & Drop Zone */}
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                className={`border-2 border-dashed rounded-xl transition-colors ${dragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                {prescriptionFiles.length === 0 ? (
                  /* Empty state — clickable upload prompt */
                  <div
                    className="cursor-pointer p-10 flex flex-col items-center gap-2 text-center"
                    onClick={() => inputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 text-gray-400" />
                    <p className="font-semibold text-gray-700">
                      คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง
                    </p>
                    <p className="text-sm text-gray-500">
                      JPG, PNG หรือ WEBP (สูงสุด 5MB ต่อไฟล์)
                    </p>
                  </div>
                ) : (
                  /* Files selected — show large previews inside the zone */
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {prescriptionFiles.map((file, index) => (
                        <div
                          key={index}
                          className="relative rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-72 object-contain bg-gray-50"
                          />
                          {/* Remove button — top-right overlay */}
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 border border-gray-200 rounded-lg text-red-500 hover:text-red-700 shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {/* File info bar */}
                          <div className="px-3 py-2 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Add more button */}
                    <button
                      onClick={() => inputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-gray-300 hover:border-primary text-sm text-gray-500 hover:text-primary transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      เพิ่มรูปภาพอีก
                    </button>
                  </div>
                )}
              </div>

              {/* Success list */}
              {uploadedUrls.length > 0 && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                  <p className="text-sm font-semibold text-green-700 mb-2">
                    อัปโหลดสำเร็จ {uploadedUrls.length} ใบ
                  </p>
                  <p className="text-xs text-green-600">
                    เภสัชกรจะตรวจสอบใบสั่งยาของคุณและดำเนินการภายใน 1-2 วันทำการ
                  </p>
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
                  {uploading ? "กำลังอัปโหลด..." : "ส่งใบสั่งยา"}
                </Button>
                {(prescriptionFiles.length > 0 || uploadedUrls.length > 0) && (
                  <Button variant="outline" onClick={handleClear} disabled={uploading}>
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
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>รองรับไฟล์ JPG, PNG, WEBP ขนาดสูงสุด 5MB ต่อไฟล์</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
