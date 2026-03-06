'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { userService, User, CreateUserDto } from '../../services/userService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ChevronLeft, Plus, Trash2, X, Users, Shield, UserCheck } from 'lucide-react';

// Inner component that uses useSearchParams — must be inside <Suspense>
function SearchParamsHandler({ onOpenModal }: { onOpenModal: () => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleFromQuery = searchParams.get('createRole');
    if (roleFromQuery === 'pharmacist') {
      onOpenModal();
    }
  }, [searchParams, onOpenModal]);

  return null;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    fullName: '',
    phone: '',
    password: '',
    role: 'pharmacist',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      const message = err instanceof Error ? err.message : 'ไม่ทราบสาเหตุ';
      if (message.toLowerCase().includes('access denied') || message.toLowerCase().includes('forbidden')) {
        alert('ไม่สามารถโหลดข้อมูลผู้ใช้: กรุณาเข้าสู่ระบบใหม่ด้วยบัญชี admin');
      } else {
        alert(`ไม่สามารถโหลดข้อมูลผู้ใช้: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.fullName || !formData.phone || !formData.password) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    try {
      setSaving(true);
      await userService.createUser({ ...formData, role: 'pharmacist' });
      alert('สร้างเภสัชกรสำเร็จ');
      setShowAddModal(false);
      setFormData({
        email: '',
        fullName: '',
        phone: '',
        password: '',
        role: 'pharmacist',
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
      alert('ไม่สามารถสร้างเภสัชกรได้');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, userEmail: string) => {
    if (window.confirm(`คุณแน่ใจหรือว่าต้องการลบผู้ใช้ ${userEmail}?`)) {
      try {
        await userService.deleteUser(id);
        alert('ลบผู้ใช้สำเร็จ');
        fetchUsers();
      } catch (err) {
        console.error('Failed to delete user:', err);
        alert('ไม่สามารถลบผู้ใช้ได้');
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const roleStyles = {
      admin: 'bg-red-100 text-red-700',
      pharmacist: 'bg-blue-100 text-blue-700',
      customer: 'bg-gray-100 text-gray-700',
    };
    const roleLabels = {
      admin: 'ผู้ดูแลระบบ',
      pharmacist: 'เภสัชกร',
      customer: 'ลูกค้า',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleStyles[role as keyof typeof roleStyles]}`}>
        {roleLabels[role as keyof typeof roleLabels]}
      </span>
    );
  };

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Shield className="w-4 h-4 text-red-600" />;
    if (role === 'pharmacist') return <UserCheck className="w-4 h-4 text-blue-600" />;
    return <Users className="w-4 h-4 text-gray-600" />;
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Suspense fallback={null}>
        <SearchParamsHandler onOpenModal={() => setShowAddModal(true)} />
      </Suspense>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">จัดการผู้ใช้</h1>
              <p className="text-muted-foreground">จำนวนผู้ใช้ทั้งหมด: {users.length}</p>
            </div>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มเภสัชกร
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายชื่อผู้ใช้ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-semibold">ชื่อ-สกุล</th>
                    <th className="pb-3 font-semibold">อีเมล</th>
                    <th className="pb-3 font-semibold">เบอร์โทร</th>
                    <th className="pb-3 font-semibold">บทบาท</th>
                    <th className="pb-3 font-semibold">วันที่สร้าง</th>
                    <th className="pb-3 font-semibold text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className="font-medium">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-600">{user.email}</td>
                      <td className="py-4 text-gray-600">{user.phone}</td>
                      <td className="py-4">{getRoleBadge(user.role)}</td>
                      <td className="py-4 text-gray-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH') : '-'}
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id, user.email)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={user.role === 'admin'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">ไม่พบผู้ใช้ในระบบ</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">เพิ่มเภสัชกร</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">อีเมล *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ชื่อ-สกุล *</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="ชื่อ นามสกุล"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">เบอร์โทรศัพท์ *</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812345678"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">รหัสผ่าน *</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">บทบาท *</label>
                  <Input value="เภสัชกร (Pharmacist)" disabled className="bg-gray-50" />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? 'กำลังบันทึก...' : 'เพิ่มเภสัชกร'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
