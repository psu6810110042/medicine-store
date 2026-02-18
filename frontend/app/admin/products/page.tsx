'use client';

import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { Product, Category } from '../../types/product';

// Mock categories for now as we don't have a category API yet
const categories: Category[] = [
  { id: "painkiller", name: "ยาแก้ปวด", count: 0 },
  { id: "antibiotic", name: "ยาปฏิชีวนะ", count: 0 },
  { id: "vitamins", name: "วิตามินและอาหารเสริม", count: 0 },
  { id: "skincare", name: "ผลิตภัณฑ์ดูแลผิว", count: 0 },
  { id: "chronic", name: "ยาโรคเรื้อรัง", count: 0 },
  { id: "medical-device", name: "เครื่องมือแพทย์", count: 0 },
  { id: "baby", name: "สินค้าเด็กและแม่", count: 0 },
  { id: "supplements", name: "อาหารเสริม", count: 0 },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

  if (loading) return <div className="p-8 text-center">Loading products...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">จัดการสินค้า (Product Management)</h1>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
          >
            + เพิ่มสินค้าใหม่
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-6">{isEditing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={currentProduct.name || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Note: ID is handled by backend, but we might want to let user set it manually or just auto-generate. 
                      Assuming auto-gen for now, so removed ID input unless specifically needed */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสสินค้า (Optional)</label>
                    <input
                      type="text"
                      name="id"
                      placeholder="Leave blank for auto-gen"
                      value={currentProduct.id || ''}
                      onChange={handleChange}
                      disabled={isEditing}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                    <select
                      name="categoryId"
                      required
                      value={currentProduct.categoryId || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">เลือกหมวดหมู่</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท)</label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={currentProduct.price || 0}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={currentProduct.description || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">สรรพคุณ</label>
                    <textarea
                      name="properties"
                      rows={2}
                      value={currentProduct.properties || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนในสต็อก</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      required
                      min="0"
                      value={currentProduct.stockQuantity || 0}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="isControlled"
                      name="isControlled"
                      checked={currentProduct.isControlled || false}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isControlled" className="ml-2 block text-sm text-gray-900">
                      ยาควบคุม
                    </label>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="requiresPrescription"
                      name="requiresPrescription"
                      checked={currentProduct.requiresPrescription || false}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requiresPrescription" className="ml-2 block text-sm text-gray-900">
                      ต้องมีใบสั่งแพทย์
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สินค้า</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สต็อก</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      ไม่พบสินค้าในระบบ
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full overflow-hidden">
                            {product.image ? (
                              <img className="h-10 w-10 object-cover" src={product.image} alt="" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">No Img</div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {categories.find(c => c.id === product.categoryId)?.name || product.categoryId || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ฿{product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.isControlled && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 mr-2">
                            ยาควบคุม
                          </span>
                        )}
                        {product.requiresPrescription && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            ใบสั่งแพทย์
                          </span>
                        )}
                        {!product.isControlled && !product.requiresPrescription && (
                          <span className="text-xs text-green-600">ทั่วไป</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={product.stockQuantity < 10 ? 'text-red-500' : 'text-gray-900'}>
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
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
