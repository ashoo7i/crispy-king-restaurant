import React, { useState } from 'react';
import type { MenuItem, CustomizationOption } from '../types';
import { X, Plus, Minus } from 'lucide-react';

interface CustomizationModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, customizations: CustomizationOption[]) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({ item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<CustomizationOption[]>([]);

  const handleOptionToggle = (option: CustomizationOption) => {
    if (option.category === 'SIZE') {
      setSelectedOptions(prev => [
        ...prev.filter(opt => opt.category !== 'SIZE'),
        option
      ]);
    } else {
      if (selectedOptions.some(opt => opt.id === option.id)) {
        setSelectedOptions(prev => prev.filter(opt => opt.id !== option.id));
      } else {
        setSelectedOptions(prev => [...prev, option]);
      }
    }
  };

  const isOptionSelected = (option: CustomizationOption) => {
    if (option.category === 'SIZE' && selectedOptions.filter(opt => opt.category === 'SIZE').length === 0) {
      return item.options.filter(opt => opt.category === 'SIZE')[0]?.id === option.id;
    }
    return selectedOptions.some(opt => opt.id === option.id);
  };

  const activeSizePrice = selectedOptions.find(opt => opt.category === 'SIZE')?.price || 0;
  const addonsPrice = selectedOptions.filter(opt => opt.category === 'ADDON').reduce((sum, opt) => sum + opt.price, 0);
  const singleUnitPrice = item.price + activeSizePrice + addonsPrice;
  const totalPrice = singleUnitPrice * quantity;

  const handleConfirm = () => {
    let finalOptions = [...selectedOptions];
    const sizeOptions = item.options.filter(opt => opt.category === 'SIZE');
    if (sizeOptions.length > 0 && !selectedOptions.some(opt => opt.category === 'SIZE')) {
      finalOptions.push(sizeOptions[0]);
    }
    onAddToCart(item, quantity, finalOptions);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-950 text-white border border-neutral-900 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner Food Image */}
        <div className="relative h-60 bg-neutral-950">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/95 p-2 rounded-full text-neutral-200 hover:bg-neutral-900 hover:text-red-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-2 gap-4">
            <h3 className="text-2xl font-black text-white">{item.name}</h3>
            <span className="text-xl font-black text-amber-500 shrink-0">{item.price.toLocaleString('ar-YE')} ريال</span>
          </div>
          <p className="text-neutral-400 text-xs font-medium mb-6 leading-relaxed">{item.description}</p>

          {/* Options Panels */}
          <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
            {/* 1. Sizes selection */}
            {item.options.filter(opt => opt.category === 'SIZE').length > 0 && (
              <div>
                <h4 className="font-extrabold text-white mb-3 border-r-4 border-red-600 pr-2 text-sm">اختر الحجم:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {item.options.filter(opt => opt.category === 'SIZE').map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionToggle(option)}
                      type="button"
                      className={`p-4 border-2 rounded-2xl text-right transition-all duration-200 cursor-pointer ${
                        isOptionSelected(option)
                          ? 'border-red-600 bg-red-950/20 text-red-500 font-extrabold'
                          : 'border-neutral-900 hover:border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <div className="text-sm">{option.name}</div>
                      {option.price > 0 && <div className="text-xs mt-1 text-amber-500">+{option.price.toLocaleString('ar-YE')} ريال</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Addons checkboxes */}
            {item.options.filter(opt => opt.category === 'ADDON').length > 0 && (
              <div>
                <h4 className="font-extrabold text-white mb-3 border-r-4 border-red-600 pr-2 text-sm">إضافات مميزة:</h4>
                <div className="space-y-2">
                  {item.options.filter(opt => opt.category === 'ADDON').map(option => (
                    <label
                      key={option.id}
                      onClick={() => handleOptionToggle(option)}
                      className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                        isOptionSelected(option)
                          ? 'border-red-600 bg-red-950/20'
                          : 'border-neutral-900 hover:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={isOptionSelected(option)} onChange={() => {}} className="accent-red-600 w-4 h-4 rounded" />
                        <span className="font-extrabold text-neutral-300 text-sm">{option.name}</span>
                      </div>
                      <span className="text-sm font-black text-amber-500">+{option.price.toLocaleString('ar-YE')} ريال</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal bottom bar actions */}
          <div className="border-t border-neutral-900/80 pt-6 mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 bg-neutral-950 px-4 py-2.5 rounded-full border border-neutral-900 shadow-inner">
              <button type="button" onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="p-1 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-neutral-200">{quantity}</span>
              <button type="button" onClick={() => setQuantity(prev => prev + 1)} className="p-1 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={handleConfirm}
              type="button"
              className="w-full sm:w-auto bg-red-600 text-white font-extrabold px-8 py-3.5 rounded-full hover:bg-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
            >
              إضافة للطلب - {totalPrice.toLocaleString('ar-YE')} ريال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
