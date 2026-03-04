import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const success = await login(loginEmail, loginPassword);
    if (success) {
      toast.success('เข้าสู่ระบบสำเร็จ');
      onClose();
      setLoginEmail('');
      setLoginPassword('');
    } else {
      toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerName || !registerEmail || !registerPhone || !registerPassword) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (registerPassword.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    const success = await register(registerEmail, registerPhone, registerName, registerPassword);
    if (success) {
      toast.success('ลงทะเบียนสำเร็จ');
      onClose();
      // Clear form
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPhone('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
    } else {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Demo login quick access
  const handleDemoLogin = async (role: 'customer' | 'pharmacist' | 'admin') => {
    const demoAccounts = {
      customer: 'somchai@email.com',
      pharmacist: 'pharmacist@meds.com',
      admin: 'admin@meds.com',
    };

    const success = await login(demoAccounts[role], 'demo123');
    if (success) {
      toast.success(`เข้าสู่ระบบในฐานะ ${role === 'customer' ? 'ลูกค้า' : role === 'pharmacist' ? 'เภสัชกร' : 'ผู้ดูแลระบบ'}`);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>เข้าสู่ระบบ / สมัครสมาชิก</DialogTitle>
          <DialogDescription>กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบหรือสมัครสมาชิกใหม่</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
            <TabsTrigger value="register">สมัครสมาชิก</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">อีเมล</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="example@email.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">รหัสผ่าน</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                เข้าสู่ระบบ
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">หรือทดลองใช้งาน</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDemoLogin('customer')}
                >
                  เข้าสู่ระบบในฐานะลูกค้า
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDemoLogin('pharmacist')}
                >
                  เข้าสู่ระบบในฐานะเภสัชกร
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-blue-50 hover:bg-blue-100 border-blue-300"
                  onClick={() => handleDemoLogin('admin')}
                >
                  🔐 เข้าสู่ระบบในฐานะ Admin
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">ชื่อ-นามสกุล</Label>
                <Input
                  id="register-name"
                  placeholder="สมชาย ใจดี"
                  value={registerName}
                  onChange={e => setRegisterName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">อีเมล</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="example@email.com"
                  value={registerEmail}
                  onChange={e => setRegisterEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="register-phone"
                  placeholder="0812345678"
                  value={registerPhone}
                  onChange={e => setRegisterPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">รหัสผ่าน</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={e => setRegisterPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">ยืนยันรหัสผ่าน</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerConfirmPassword}
                  onChange={e => setRegisterConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                สมัครสมาชิก
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}