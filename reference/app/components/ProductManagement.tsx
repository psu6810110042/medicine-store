import { useState } from 'react';
import { Plus, Edit, Trash2, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { products as initialProducts, categories, Product } from '@/data/mockData';
import { toast } from 'sonner';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    id: '',
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    manufacturer: '',
    activeIngredient: '',
    stockQuantity: 0,
    batchNumber: '',
    expiryDate: '',
    inStock: true,
    isControlled: false,
    requiresPrescription: false,
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({
      id: `PROD${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      name: '',
      description: '',
      price: 0,
      category: 'general',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      manufacturer: '',
      activeIngredient: '',
      stockQuantity: 0,
      batchNumber: '',
      expiryDate: '',
      inStock: true,
      isControlled: false,
      requiresPrescription: false,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  };

  const handleSaveProduct = () => {
    // Validation
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    if (editingProduct) {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? (formData as Product) : p))
      );
      toast.success('อัพเดทสินค้าสำเร็จ');
    } else {
      // Add new product
      setProducts((prev) => [...prev, formData as Product]);
      toast.success('เพิ่มสินค้าสำเร็จ');
    }

    setIsDialogOpen(false);
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast.success('ลบสินค้าสำเร็จ');
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stockQuantity: newStock, inStock: newStock > 0 }
          : p
      )
    );
    toast.success('อัพเดทสต็อกสำเร็จ');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>จัดการสินค้า</CardTitle>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มสินค้าใหม่
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ค้นหาสินค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Product Table */}
          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสสินค้า</TableHead>
                  <TableHead>ชื่อสินค้า</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>ราคา</TableHead>
                  <TableHead>คงเหลือ</TableHead>
                  <TableHead>วันหมดอายุ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const categoryName = categories.find((c) => c.id === product.category)?.name || product.category;

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">{product.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-gray-500">
                              {product.manufacturer}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{categoryName}</Badge>
                      </TableCell>
                      <TableCell>฿{product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={product.stockQuantity}
                            onChange={(e) =>
                              handleUpdateStock(product.id, parseInt(e.target.value) || 0)
                            }
                            className="w-20"
                            min="0"
                          />
                          {product.stockQuantity < 50 && (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            product.expiryDate && new Date(product.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                              ? 'text-red-600 font-semibold'
                              : ''
                          }
                        >
                          {product.expiryDate}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {product.inStock ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              มีสินค้า
                            </Badge>
                          ) : (
                            <Badge variant="secondary">หมด</Badge>
                          )}
                          {product.isControlled && (
                            <Badge variant="destructive" className="text-xs">
                              ยาควบคุม
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setProductToDelete(product);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">ไม่พบสินค้า</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'แก้ไขข้อมูลสินค้าที่มีอยู่ในระบบ' : 'กรอกข้อมูลสินค้าใหม่ให้ครบถ้วน'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">รหัสสินค้า *</Label>
                <Input
                  id="productId"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  disabled={!!editingProduct}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">หมวดหมู่ *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">ชื่อสินค้า *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อสินค้า"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียดสินค้า</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="รายละเอียดสินค้า"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">ราคา (บาท) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">จำนวนสต็อก</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockQuantity: parseInt(e.target.value) || 0,
                      inStock: (parseInt(e.target.value) || 0) > 0,
                    })
                  }
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">ผู้ผลิต</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturer: e.target.value })
                  }
                  placeholder="ชื่อบริษัทผู้ผลิต"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activeIngredient">สารสำคัญ</Label>
                <Input
                  id="activeIngredient"
                  value={formData.activeIngredient}
                  onChange={(e) =>
                    setFormData({ ...formData, activeIngredient: e.target.value })
                  }
                  placeholder="สารสำคัญ"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, batchNumber: e.target.value })
                  }
                  placeholder="Batch Number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">วันหมดอายุ</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL รูปภาพ</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isControlled"
                  checked={formData.isControlled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isControlled: checked as boolean })
                  }
                />
                <Label htmlFor="isControlled" className="cursor-pointer">
                  ยาควบคุมพิเศษ
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, requiresPrescription: checked as boolean })
                  }
                />
                <Label htmlFor="requiresPrescription" className="cursor-pointer">
                  ต้องใช้ใบสั่งแพทย์
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveProduct}>
              {editingProduct ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบสินค้า</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "{productToDelete?.name}"?
              <br />
              การดำเนินการนี้ไม่สามารถยกเลิกได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              <Trash2 className="w-4 h-4 mr-2" />
              ลบสินค้า
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
