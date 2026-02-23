import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Medicine, initialMedicines } from '../data/mockData';

interface MedicineContextType {
  medicines: Medicine[];
  addMedicine: (medicine: Medicine) => void;
  deleteMedicine: (id: string) => void;
  updateMedicine: (id: string, updatedMedicine: Partial<Medicine>) => void;
  loading: boolean;
  error: string | null;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export const MedicineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch medicines from backend on mount
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/medicines');
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
          throw new Error('API not available or not returning JSON');
        }
        const data = await response.json();
        setMedicines(data);
        setError(null);
      } catch (err) {
        console.warn('Backend not reachable, using mock data:', err);
        // Fallback to mock data is already set via useState initial value
        setError('Backend unavailable - Using local mode');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const addMedicine = async (medicine: Medicine) => {
    // Optimistic update
    setMedicines((prev) => [...prev, medicine]);
    
    try {
      await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicine),
      });
    } catch (err) {
      console.warn('Failed to sync add with backend:', err);
    }
  };

  const deleteMedicine = async (id: string) => {
    // Optimistic update
    setMedicines((prev) => prev.filter((m) => m.id !== id));

    try {
      await fetch(`/api/medicines/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Failed to sync delete with backend:', err);
    }
  };

  const updateMedicine = async (id: string, updatedMedicine: Partial<Medicine>) => {
    // Optimistic update
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updatedMedicine } : m))
    );

    try {
      await fetch(`/api/medicines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMedicine),
      });
    } catch (err) {
      console.warn('Failed to sync update with backend:', err);
    }
  };

  return (
    <MedicineContext.Provider value={{ medicines, addMedicine, deleteMedicine, updateMedicine, loading, error }}>
      {children}
    </MedicineContext.Provider>
  );
};

export const useMedicines = () => {
  const context = useContext(MedicineContext);
  if (context === undefined) {
    throw new Error('useMedicines must be used within a MedicineProvider');
  }
  return context;
};
