'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Eye, Package, BarChart3, FileText, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Separator } from '@/app/components/ui/separator';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { mockOrders, products as initialProducts, mockUsers, categories, Product } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProductManagement from '@/app/components/ProductManagement';

export default function AdminPanel() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [pharmacistNotes, setPharmacistNotes] = useState('');
  const [isFillingPrescription, setIsFillingPrescription] = useState(false);
  const [selectedProductsForOrder, setSelectedProductsForOrder] = useState<{ product: Product, quantity: number }[]>([]);

  const isPharmacist = user?.role === 'pharmacist' || user?.role === 'admin';

  if (!isPharmacist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleVerifyOrder = (orderId: string, approved: boolean) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status: approved ? 'verified' : 'cancelled',
            verifiedBy: user?.id,
            verifiedAt: new Date().toISOString(),
            pharmacistNotes: pharmacistNotes,
          };
        }
        return order;
      })
    );

    toast.success(approved ? 'อนุมัติคำสั่งซื้อสำเร็จ' : 'ปฏิเสธคำสั่งซื้อสำเร็จ');
    setSelectedOrder(null);
    setPharmacistNotes('');
  };

  const handleFillPrescription = (orderId: string) => {
    const total = selectedProductsForOrder.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            items: selectedProductsForOrder,
            totalAmount: total,
            status: 'verified',
            verifiedBy: user?.id,
            verifiedAt: new Date().toISOString(),
            pharmacistNotes: pharmacistNotes,
          };
        }
        return order;
      })
    );

    toast.success('จัดยาตามใบสั่งแพทย์สำเร็จ');
    setSelectedOrder(null);
    setIsFillingPrescription(false);
    setSelectedProductsForOrder([]);
    setPharmacistNotes('');
  };

  const addProductToOrder = (product: Product) => {
    setSelectedProductsForOrder(prev => {
      const existing = prev.find(p => p.product.id === product.id);
      if (existing) {
        return prev.map(p => p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeProductFromOrder = (productId: string) => {
    setSelectedProductsForOrder(prev => prev.filter(p => p.product.id !== productId));
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      pending: 'secondary',
      verified: 'default',
      preparing: 'default',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };

    const labels: { [key: string]: string } = {
      pending: 'รอตรวจสอบ',
      verified: 'ตรวจสอบแล้ว',
      preparing: 'กำลังเตรียมสินค้า',
      shipped: 'จัดส่งแล้ว',
      delivered: 'ส่งสำเร็จ',
      cancelled: 'ยกเลิก',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const prescriptionRequests = orders.filter(o => o.status === 'prescription_request');
  const verifiedOrders = orders.filter(o => o.status === 'verified' || o.status === 'preparing');
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  // Calculate statistics
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const pendingCount = pendingOrders.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {user?.role === 'admin' ? 'ระบบจัดการ' : 'ระบบเภสัชกร'}
        </h1>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                คำสั่งซื้อรอตรวจสอบ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                คำสั่งซื้อทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">ยอดขาย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ฿{totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">สินค้าในสต็อก</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {initialProducts.reduce((sum, p) => sum + p.stockQuantity, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              รอตรวจสอบ
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              ใบสั่งแพทย์
              {prescriptionRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {prescriptionRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="verified">กำลังดำเนินการ</TabsTrigger>
            <TabsTrigger value="completed">เสร็จสิ้น</TabsTrigger>
            {user?.role === 'admin' && <TabsTrigger value="products">จัดการสินค้า</TabsTrigger>}
            <TabsTrigger value="inventory">คลังสินค้า</TabsTrigger>
          </TabsList>

          {/* Pending Orders */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  คำสั่งซื้อรอตรวจสอบ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">ไม่มีคำสั่งซื้อรอตรวจสอบ</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingOrders.map(order => {
                      const customer = mockUsers.find(u => u.id === order.userId);
                      const hasControlled = order.items.some(i => i.product.isControlled);

                      return (
                        <div
                          key={order.id}
                          className={`border rounded-lg p-4 ${hasControlled ? 'border-red-300 bg-red-50' : ''
                            }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">{order.id}</h4>
                              <p className="text-sm text-gray-600">ลูกค้า: {customer?.name}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              {hasControlled && (
                                <Badge variant="destructive" className="mb-2">
                                  มียาควบคุม
                                </Badge>
                              )}
                              <div className="text-lg font-bold text-primary">
                                ฿{order.totalAmount.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <Separator className="my-3" />

                          <div className="space-y-2 mb-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {item.product.name} x{item.quantity}
                                  {item.product.isControlled && (
                                    <Badge variant="destructive" className="ml-2 text-xs">
                                      ยาควบคุม
                                    </Badge>
                                  )}
                                </span>
                                <span className="font-medium">
                                  ฿{(item.product.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>

                          {order.prescriptionImage && (
                            <div className="mb-3">
                              <Badge variant="outline" className="mb-2">
                                มีใบสั่งแพทย์
                              </Badge>
                            </div>
                          )}

                          {customer?.healthData && (
                            <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                              <p className="text-xs font-semibold mb-1">ข้อมูลสุขภาพลูกค้า:</p>
                              {customer.healthData.allergies.length > 0 && (
                                <p className="text-xs text-yellow-800">
                                  <strong>แพ้:</strong> {customer.healthData.allergies.join(', ')}
                                </p>
                              )}
                              {customer.healthData.chronicDiseases.length > 0 && (
                                <p className="text-xs text-yellow-800">
                                  <strong>โรคประจำตัว:</strong>{' '}
                                  {customer.healthData.chronicDiseases.join(', ')}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              ตรวจสอบ
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescription Requests */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  คำขอสั่งยาตามใบสั่งแพทย์
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prescriptionRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">ไม่มีคำขอใหม่</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prescriptionRequests.map(order => {
                      const customer = mockUsers.find(u => u.id === order.userId);
                      return (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold">{order.id}</h4>
                              <p className="text-sm text-gray-600">ลูกค้า: {customer?.name}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleString('th-TH')}
                              </p>
                            </div>
                            <Badge variant="outline">ใบสั่งแพทย์</Badge>
                          </div>
                          <img
                            src={order.prescriptionImage}
                            alt="Prescription"
                            className="w-full h-40 object-cover rounded-md mb-4 border"
                          />
                          <Button
                            className="w-full"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsFillingPrescription(true);
                              setSelectedProductsForOrder([]);
                            }}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            จัดยาตามใบสั่ง
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verified Orders */}
          <TabsContent value="verified">
            <Card>
              <CardHeader>
                <CardTitle>คำสั่งซื้อที่กำลังดำเนินการ</CardTitle>
              </CardHeader>
              <CardContent>
                {verifiedOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">ไม่มีคำสั่งซื้อที่กำลังดำเนินการ</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {verifiedOrders.map(order => {
                      const customer = mockUsers.find(u => u.id === order.userId);
                      return (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{order.id}</h4>
                              <p className="text-sm text-gray-600">ลูกค้า: {customer?.name}</p>
                              <p className="text-sm text-gray-500">
                                ตรวจสอบแล้วเมื่อ:{' '}
                                {order.verifiedAt &&
                                  new Date(order.verifiedAt).toLocaleDateString('th-TH')}
                              </p>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(order.status)}
                              <div className="text-lg font-bold text-primary mt-2">
                                ฿{order.totalAmount.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Orders */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>คำสั่งซื้อที่เสร็จสิ้น</CardTitle>
              </CardHeader>
              <CardContent>
                {completedOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">ไม่มีคำสั่งซื้อที่เสร็จสิ้น</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedOrders.map(order => {
                      const customer = mockUsers.find(u => u.id === order.userId);
                      return (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{order.id}</h4>
                              <p className="text-sm text-gray-600">ลูกค้า: {customer?.name}</p>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(order.status)}
                              <div className="text-lg font-bold text-primary mt-2">
                                ฿{order.totalAmount.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  จัดการคลังสินค้า
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสสินค้า</TableHead>
                      <TableHead>ชื่อสินค้า</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>คงเหลือ</TableHead>
                      <TableHead>วันหมดอายุ</TableHead>
                      <TableHead>สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {initialProducts.map(product => (
                      <TableRow key={product.id}>
                        <TableCell>{product.id}</TableCell>
                        <TableCell>
                          {product.name}
                          {product.isControlled && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              ควบคุม
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{product.batchNumber}</TableCell>
                        <TableCell>
                          <span
                            className={
                              product.stockQuantity < 50
                                ? 'text-red-600 font-semibold'
                                : 'text-gray-900'
                            }
                          >
                            {product.stockQuantity}
                          </span>
                        </TableCell>
                        <TableCell>{product.expiryDate}</TableCell>
                        <TableCell>
                          {product.inStock ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              มีสินค้า
                            </Badge>
                          ) : (
                            <Badge variant="secondary">หมด</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Management */}
          {user?.role === 'admin' && (
            <TabsContent value="products">
              <ProductManagement />
            </TabsContent>
          )}
        </Tabs>

        {/* Order Review & Prescription Filling Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => {
          setSelectedOrder(null);
          setIsFillingPrescription(false);
        }}>
          <DialogContent className={isFillingPrescription ? "max-w-4xl" : "max-w-2xl"}>
            <DialogHeader>
              <DialogTitle>
                {isFillingPrescription ? 'จัดยาตามใบสั่งแพทย์' : `ตรวจสอบคำสั่งซื้อ ${selectedOrder?.id}`}
              </DialogTitle>
              <DialogDescription>
                {isFillingPrescription
                  ? 'เลือกสินค้าที่ระบุในใบสั่งแพทย์เพื่อสร้างรายการสั่งซื้อให้ลูกค้า'
                  : 'กรุณาตรวจสอบรายละเอียดคำสั่งซื้อและใบสั่งแพทย์ก่อนอนุมัติ'}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className={`grid ${isFillingPrescription ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                <div className="space-y-4">
                  {selectedOrder.prescriptionImage && (
                    <div>
                      <Label className="mb-2 block">ใบสั่งแพทย์:</Label>
                      <img
                        src={selectedOrder.prescriptionImage}
                        alt="Prescription"
                        className="w-full rounded-lg border"
                      />
                    </div>
                  )}

                  {selectedOrder.pharmacistNotes && !isFillingPrescription && (
                    <div className="bg-secondary p-3 rounded-lg">
                      <p className="text-xs font-semibold text-primary mb-1">บันทึก/หมายเหตุ:</p>
                      <p className="text-sm text-gray-700">{selectedOrder.pharmacistNotes}</p>
                    </div>
                  )}

                  {selectedOrder.userNotes && (
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                      <p className="text-xs font-semibold text-orange-800 mb-1">หมายเหตุจากลูกค้า/อาการ:</p>
                      <p className="text-sm text-gray-700">{selectedOrder.userNotes}</p>
                    </div>
                  )}

                  {!isFillingPrescription && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">รายการสินค้า:</h3>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {item.product.name} x{item.quantity}
                              {item.product.isControlled && (
                                <Badge variant="destructive" className="ml-2 text-xs">
                                  ยาควบคุม
                                </Badge>
                              )}
                            </span>
                            <span>฿{(item.product.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isFillingPrescription && (
                    <div className="space-y-4">
                      <Label>ยาที่จัดให้ลูกค้า:</Label>
                      <div className="border rounded-lg divide-y bg-white">
                        {selectedProductsForOrder.length === 0 ? (
                          <p className="p-4 text-sm text-gray-500 text-center italic">ยังไม่ได้เลือกยา</p>
                        ) : (
                          selectedProductsForOrder.map((item, idx) => (
                            <div key={idx} className="p-3 flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium">{item.product.name}</p>
                                <p className="text-xs text-gray-500">฿{item.product.price.toLocaleString()} x {item.quantity}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => removeProductFromOrder(item.product.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>

                      {selectedProductsForOrder.length > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">ยอดรวมประเมิน:</p>
                          <p className="text-xl font-bold text-primary">
                            ฿{selectedProductsForOrder.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toLocaleString()}
                          </p>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="notes">คำแนะนำจากเภสัชกร:</Label>
                        <Textarea
                          id="notes"
                          placeholder="ระบุวิธีใช้ยา หรือข้อมูลเพิ่มเติม..."
                          value={pharmacistNotes}
                          onChange={e => setPharmacistNotes(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <Button
                        className="w-full"
                        disabled={selectedProductsForOrder.length === 0}
                        onClick={() => handleFillPrescription(selectedOrder.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        ยืนยันการจัดยาและส่งให้ลูกค้า
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full mt-2"
                        onClick={() => handleVerifyOrder(selectedOrder.id, false)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        ปฏิเสธคำขอใบสั่งแพทย์
                      </Button>
                    </div>
                  )}
                </div>

                {isFillingPrescription && (
                  <div className="space-y-4 border-l pl-6">
                    <Label>ค้นหายาในคลังสินค้า:</Label>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {initialProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-primary font-semibold">฿{product.price.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400">สต็อก: {product.stockQuantity}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addProductToOrder(product)}
                            disabled={product.stockQuantity <= 0}
                          >
                            เพิ่ม
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isFillingPrescription && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notes">หมายเหตุจากเภสัชกร:</Label>
                      <Textarea
                        id="notes"
                        placeholder="ระบุข้อมูลเพิ่มเติมหรือคำแนะนำสำหรับลูกค้า..."
                        value={pharmacistNotes}
                        onChange={e => setPharmacistNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleVerifyOrder(selectedOrder.id, true)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        อนุมัติคำสั่งซื้อ
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleVerifyOrder(selectedOrder.id, false)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        ปฏิเสธคำสั่งซื้อ
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
