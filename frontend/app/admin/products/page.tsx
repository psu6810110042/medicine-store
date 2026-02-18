'use client';

import { useState, useEffect, useCallback } from 'react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types/product';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err: any) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct({
      ...product,
      price: Number(product.price),
      stockQuantity: Number(product.stockQuantity)
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setCurrentProduct({
      inStock: true,
      price: 0,
      stockQuantity: 0,
      isControlled: false,
      requiresPrescription: false,
      image: 'https://via.placeholder.com/150'
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentProduct.id) {
        const updated = await productService.updateProduct(currentProduct.id, currentProduct);
        setProducts(products.map(p => (p.id === updated.id ? updated : p)));
      } else {
        const newProduct = await productService.createProduct(currentProduct as Product);
        setProducts([...products, newProduct]);
      }
      setShowForm(false);
      setCurrentProduct({});
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCurrentProduct({ ...currentProduct, [name]: checked });
    } else if (name === 'price' || name === 'stockQuantity') {
      setCurrentProduct({ ...currentProduct, [name]: Number(value) });
    } else {
      setCurrentProduct({ ...currentProduct, [name]: value });
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading products...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">จัดการสินค้า</h1>
            <p className="text-muted-foreground">Product Management System</p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-primary hover:bg-blue-700 text-primary-foreground px-4 py-2 rounded-md transition-colors flex items-center gap-2 shadow-sm font-medium"
          >
            + เพิ่มสินค้าใหม่
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-2xl p-6 relative border border-border animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-6 text-foreground">{isEditing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">ชื่อสินค้า</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={currentProduct.name || ''}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-md p-2.5 focus:ring-2 focus:ring-ring focus:border-input text-foreground transition-all"
                      placeholder="ระบุชื่อสินค้า"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">รหัสสินค้า (Optional)</label>
                    <input
                      type="text"
                      name="id"
                      placeholder="Leave blank for auto-gen"
                      value={currentProduct.id || ''}
                      onChange={handleChange}
                      disabled={isEditing}
                      className="w-full bg-muted border border-border rounded-md p-2.5 text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">หมวดหมู่</label>
                    <select
                      name="categoryId"
                      required
                      value={currentProduct.categoryId || ''}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-md p-2.5 focus:ring-2 focus:ring-ring focus:border-input text-foreground transition-all"
                    >
                      <option value="">เลือกหมวดหมู่</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">ราคา (บาท)</label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={currentProduct.price || 0}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-md p-2.5 focus:ring-2 focus:ring-ring focus:border-input text-foreground transition-all"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">รายละเอียด</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={currentProduct.description || ''}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-md p-2.5 focus:ring-2 focus:ring-ring focus:border-input text-foreground transition-all"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">สรรพคุณ</label>
                    <textarea
                      name="properties"
                      rows={2}
                      value={currentProduct.properties || ''}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-md p-2.5 focus:ring-2 focus:ring-ring focus:border-input text-foreground transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border pt-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">จำนวนในสต็อก</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      required
                      min="0"
                      value={currentProduct.stockQuantity || 0}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-md p-2.5 focus:ring-2 focus:ring-ring focus:border-input text-foreground transition-all"
                    />
                  </div>

                  <div className="flex items-center pt-8">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isControlled"
                        checked={currentProduct.isControlled || false}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
                      />
                      <span className="ml-2 text-sm text-foreground">ยาควบคุม</span>
                    </label>
                  </div>

                  <div className="flex items-center pt-8">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="requiresPrescription"
                        checked={currentProduct.requiresPrescription || false}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
                      />
                      <span className="ml-2 text-sm text-foreground">ต้องมีใบสั่งแพทย์</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">สินค้า</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">หมวดหมู่</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">ราคา</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">สถานะ</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">สต็อก</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      ไม่พบสินค้าในระบบ
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-muted rounded-full overflow-hidden flex items-center justify-center border border-border">
                            {product.image && product.image !== 'https://via.placeholder.com/150' ? (
                              <img className="h-full w-full object-cover" src={product.image} alt="" />
                            ) : (
                              <span className="text-xs text-muted-foreground">No Img</span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">{product.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {categories.find(c => c.id === product.categoryId)?.name || product.categoryId || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                        ฿{product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.isControlled && (
                          <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 mr-2">
                            ยาควบคุม
                          </span>
                        )}
                        {product.requiresPrescription && (
                          <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            ใบสั่งแพทย์
                          </span>
                        )}
                        {!product.isControlled && !product.requiresPrescription && (
                          <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            ทั่วไป
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={product.stockQuantity < 10 ? 'text-red-500 font-bold' : 'text-foreground'}>
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary hover:text-blue-700 mr-4 transition-colors"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
