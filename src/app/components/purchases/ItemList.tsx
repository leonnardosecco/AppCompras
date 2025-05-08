'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Item {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface ItemListProps {
  items: Item[];
  onItemsChange: (items: Item[]) => void;
}

export default function ItemList({ items, onItemsChange }: ItemListProps) {
  const [currentItem, setCurrentItem] = useState<Item>({
    description: '',
    quantity: 1,
    unit: '',
    unitPrice: 0,
    total: 0
  });

  const calculateTotal = (item: Item) => {
    return item.quantity * item.unitPrice;
  };

  const handleAddItem = () => {
    if (currentItem.description && currentItem.unit && currentItem.unitPrice > 0) {
      const newItem = {
        ...currentItem,
        total: calculateTotal(currentItem)
      };
      onItemsChange([...items, newItem]);
      setCurrentItem({
        description: '',
        quantity: 1,
        unit: '',
        unitPrice: 0,
        total: 0
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.total, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Itens</h2>
        <button
          type="button"
          onClick={handleAddItem}
          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Adicionar Item
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Descrição do Item"
            value={currentItem.description}
            onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={currentItem.unit}
            onChange={(e) => setCurrentItem({ ...currentItem, unit: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione a unidade</option>
            <option value="UN">Unidade</option>
            <option value="KG">Quilograma</option>
            <option value="M">Metro</option>
            <option value="M2">Metro Quadrado</option>
            <option value="M3">Metro Cúbico</option>
            <option value="L">Litro</option>
            <option value="CX">Caixa</option>
            <option value="PC">Pacote</option>
          </select>
        </div>
        <div>
          <input
            type="number"
            placeholder="Quantidade"
            value={currentItem.quantity}
            onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Valor Unitário"
            value={currentItem.unitPrice}
            onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-4 border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-gray-900">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Descrição</th>
                <th className="px-4 py-2 text-center">Unidade</th>
                <th className="px-4 py-2 text-right">Quantidade</th>
                <th className="px-4 py-2 text-right">Valor Unitário</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2 text-center">{item.unit}</td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-4 py-2 text-right font-medium">
                  Subtotal:
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {calculateSubtotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
} 