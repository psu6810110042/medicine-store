export interface Medicine {
  id: string;
  name: string;
  description: string;
  quantity: number;
  expiryDate: string; // ISO format YYYY-MM-DD
  isControlled: boolean;
  price: number;
  category: string;
}

export const initialMedicines: Medicine[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    description: "ยาแก้ปวด ลดไข้",
    quantity: 100,
    expiryDate: "2025-12-31",
    isControlled: false,
    price: 50,
    category: "Pain Relief",
  },
  {
    id: "2",
    name: "Amoxicillin 500mg",
    description: "ยาปฏิชีวนะ ฆ่าเชื้อแบคทีเรีย",
    quantity: 50,
    expiryDate: "2024-06-15",
    isControlled: true,
    price: 120,
    category: "Antibiotics",
  },
  {
    id: "3",
    name: "Vitamin C 1000mg",
    description: "วิตามินซี เสริมภูมิคุ้มกัน",
    quantity: 200,
    expiryDate: "2026-01-20",
    isControlled: false,
    price: 350,
    category: "Vitamins",
  },
  {
    id: "4",
    name: "Diazepam 5mg",
    description: "ยาคลายเครียด ช่วยให้นอนหลับ",
    quantity: 20,
    expiryDate: "2024-04-10", // Expiring soon
    isControlled: true,
    price: 80,
    category: "Sedatives",
  },
  {
    id: "5",
    name: "Ibuprofen 400mg",
    description: "ยาแก้ปวด ลดการอักเสบ",
    quantity: 80,
    expiryDate: "2025-05-05",
    isControlled: false,
    price: 90,
    category: "Pain Relief",
  },
];
