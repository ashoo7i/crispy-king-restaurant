export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface CustomizationOption {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  category: 'SIZE' | 'ADDON' | 'EXCLUDE';
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  image: string;
  categoryId: string;
  isAvailable: boolean;
  options: CustomizationOption[];
}

export interface CartItem {
  id: string; // Unique combination key (e.g. itemId-sizeId-addonIds)
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customizations: CustomizationOption[];
}
