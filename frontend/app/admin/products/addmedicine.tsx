import React, { useState } from 'react';
import { useMedicines } from '../../../contexts/MedicineContext';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';

const AddMedicine: React.FC = () => {
  const { addMedicine } = useMedicines();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    expiryDate: '',
    isControlled: false,
    price: 0,
    category: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMedicine = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
    };
    addMedicine(newMedicine);
    router.push('/inventory'); // Redirect to inventory after adding
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'quantity' || name === 'price') {
       setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Plus className="h-6 w-6 text-emerald-600" />
        เพิ่มสต็อกยา (Add New Medicine)
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อยา (Medicine Name)</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Ex. Paracetamol 500mg"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสรรพคุณ (Description)</label>
            <textarea
              name="description"
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Ex. ยาแก้ปวด ลดไข้..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ (Category)</label>
            <select
              name="category"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">เลือกหมวดหมู่...</option>
              <option value="Pain Relief">ยาแก้ปวด (Pain Relief)</option>
              <option value="Antibiotics">ยาปฏิชีวนะ (Antibiotics)</option>
              <option value="Vitamins">วิตามิน (Vitamins)</option>
              <option value="Sedatives">ยานอนหลับ (Sedatives)</option>
              <option value="Other">อื่นๆ (Other)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (Price)</label>
            <input
              type="number"
              name="price"
              min="0"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนสต็อก (Quantity)</label>
            <input
              type="number"
              name="quantity"
              min="1"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันหมดอายุ (Expiry Date)</label>
            <input
              type="date"
              name="expiryDate"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.expiryDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-purple-50 p-4 rounded-lg border border-purple-100">
          <input
            type="checkbox"
            name="isControlled"
            id="isControlled"
            className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            checked={formData.isControlled}
            onChange={handleChange}
          />
          <label htmlFor="isControlled" className="text-sm font-medium text-purple-900 cursor-pointer select-none">
            นี่คือยาควบคุม (Controlled Substance)
          </label>
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push('/inventory')}
            className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            ยกเลิก (Cancel)
          </button>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-emerald-600 rounded-lg text-white hover:bg-emerald-700 font-bold shadow-md hover:shadow-lg transition-all"
          >
            บันทึกข้อมูล (Save)
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedicine;
