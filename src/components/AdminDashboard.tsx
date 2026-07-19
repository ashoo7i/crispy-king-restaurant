import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { Clock, CheckCircle2, DollarSign, Eye, RefreshCw, Lock, ShieldAlert, KeyRound, LogOut, Bell, Volume2, Plus, Edit, Trash2, Layout } from 'lucide-react';
import { playNewOrderAlert, playPendingOrderReminder } from '../utils/audio';
import { FALLBACK_CATEGORIES, FALLBACK_MENU } from './MenuSection';
import { compressImage } from '../utils/image';

interface AdminDashboardProps {
  onBackToMenu: () => void;
}

const MOCK_ORDERS = [
  {
    id: 'CR-7842',
    customerName: 'المهندس أشرف قُصيلة',
    customerPhone: '777xxxxxx',
    deliveryType: 'DELIVERY',
    address: 'صنعاء، شارع حدة، عمارة الأمل الدور الثالث',
    status: 'PENDING',
    totalPrice: 4300,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    items: [
      {
        id: 'oi-1',
        quantity: 1,
        price: 3500,
        customizations: JSON.stringify([{ name: 'حجم كبير (مع بطاطس ومشروب ضخم)' }, { name: 'جبنة شيدر إضافية' }]),
        menuItem: { name: 'تويستر كينج الحار' }
      }
    ]
  },
  {
    id: 'CR-1948',
    customerName: 'أحمد علي',
    customerPhone: '733xxxxxx',
    deliveryType: 'PICKUP',
    address: 'استلام من الفرع الرئيسي',
    status: 'PREPARING',
    totalPrice: 12500,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    items: [
      {
        id: 'oi-2',
        quantity: 1,
        price: 12000,
        customizations: JSON.stringify([{ name: 'دجاج حار' }, { name: 'إضافة صوص الثوم' }]),
        menuItem: { name: 'دلو التوفير المقرمش (8 قطع)' }
      }
    ]
  }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToMenu }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [shake, setShake] = useState(false);
  
  // Change password modal state
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Forgot/Reset Password state
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPasscodeForReset, setNewPasscodeForReset] = useState('');
  const [confirmPasscodeForReset, setConfirmPasscodeForReset] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const [adminEmail, setAdminEmail] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Tab switching
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'homepage'>('orders');

  // Homepage setting states
  const [homeHeroTitle, setHomeHeroTitle] = useState(() => {
    try {
      const local = localStorage.getItem('local_settings');
      if (local) {
        return JSON.parse(local).hero_title || 'Crunch it &\nLive the Deliciousness!';
      }
    } catch {}
    return 'Crunch it &\nLive the Deliciousness!';
  });
  const [homeHeroSubtitle, setHomeHeroSubtitle] = useState(() => {
    try {
      const local = localStorage.getItem('local_settings');
      if (local) {
        return JSON.parse(local).hero_subtitle || 'قرمشها وعيش اللذاذة';
      }
    } catch {}
    return 'قرمشها وعيش اللذاذة';
  });
  const [homeHeroImage, setHomeHeroImage] = useState(() => {
    try {
      const local = localStorage.getItem('local_settings');
      if (local) {
        return JSON.parse(local).hero_image || '/hero-bg.jpg';
      }
    } catch {}
    return '/hero-bg.jpg';
  });
  const [homeHeroVideo, setHomeHeroVideo] = useState(() => {
    try {
      const local = localStorage.getItem('local_settings');
      if (local) {
        return JSON.parse(local).hero_video || '/hero-video.mp4';
      }
    } catch {}
    return '/hero-video.mp4';
  });
  const [isSavingHomepage, setIsSavingHomepage] = useState(false);
  const [homepageSuccess, setHomepageSuccess] = useState('');
  const [homepageError, setHomepageError] = useState('');

  // Menu management state
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  // Menu form states
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCalories, setFormCalories] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formOptions, setFormOptions] = useState<{ name: string; price: number; category: string }[]>([]);

  // Notification states
  const [newOrderToast, setNewOrderToast] = useState<any | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const getAdminHeaders = (extraHeaders: Record<string, string> = {}) => {
    const passcode = sessionStorage.getItem('admin_passcode') || '';
    return {
      'Content-Type': 'application/json',
      'x-admin-passcode': passcode,
      ...extraHeaders
    };
  };

  useEffect(() => {
    // Check session storage for existing auth
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }

    // Check for reset_token query param
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setResetToken(token);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          'x-admin-passcode': sessionStorage.getItem('admin_passcode') || ''
        }
      });
      const data = await res.json();
      
      // Check for new orders to trigger sound/notifications
      if (orders.length > 0) {
        const currentIds = new Set(orders.map(o => o.id));
        const newOrders = data.filter((o: any) => !currentIds.has(o.id));
        
        if (newOrders.length > 0) {
          playNewOrderAlert(); // Play double ping sound
          
          // Trigger browser native push notification
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('👑 طلب جديد وارد!', {
              body: `العميل: ${newOrders[0].customerName}\nالمجموع: ${newOrders[0].totalPrice} ريال`,
              tag: newOrders[0].id
            });
          }
          
          // Trigger custom slide-in UI toast
          setNewOrderToast(newOrders[0]);
          setTimeout(() => setNewOrderToast(null), 6000);
        }
      }
      
      setOrders(data);
    } catch (err) {
      console.warn('Backend server offline, loading local localStorage orders:', err);
      const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
      const activeLocal = localOrders.length > 0 ? localOrders : MOCK_ORDERS;
      
      // Also diff for offline local orders
      if (orders.length > 0) {
        const currentIds = new Set(orders.map(o => o.id));
        const newOrders = activeLocal.filter((o: any) => !currentIds.has(o.id));
        
        if (newOrders.length > 0) {
          playNewOrderAlert();
          
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('👑 طلب جديد وارد (محلي)!', {
              body: `العميل: ${newOrders[0].customerName}\nالمجموع: ${newOrders[0].totalPrice} ريال`,
              tag: newOrders[0].id
            });
          }
          
          setNewOrderToast(newOrders[0]);
          setTimeout(() => setNewOrderToast(null), 6000);
        }
      }
      
      setOrders(localOrders.length > 0 ? localOrders : MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuData = async () => {
    try {
      const catsRes = await fetch(`${API_BASE_URL}/api/categories`);
      const menuRes = await fetch(`${API_BASE_URL}/api/menu`);
      if (catsRes.ok && menuRes.ok) {
        const catsData = await catsRes.json();
        const menuData = await menuRes.json();
        setCategories(catsData);
        setMenuItems(menuData);
        // Sync locally
        localStorage.setItem('local_categories', JSON.stringify(catsData));
        localStorage.setItem('local_menu_items', JSON.stringify(menuData));
      }
    } catch (err) {
      console.warn('Backend server offline, loading local localStorage menu or fallbacks:', err);
      const localCats = JSON.parse(localStorage.getItem('local_categories') || '[]');
      const localItems = JSON.parse(localStorage.getItem('local_menu_items') || '[]');
      setCategories(localCats.length > 0 ? localCats : FALLBACK_CATEGORIES);
      setMenuItems(localItems.length > 0 ? localItems : FALLBACK_MENU);
    }
  };

  const fetchHomepageSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setHomeHeroTitle(data.hero_title || 'Crunch it &\nLive the Deliciousness!');
        setHomeHeroSubtitle(data.hero_subtitle || 'قرمشها وعيش اللذاذة');
        setHomeHeroImage(data.hero_image || '/hero-bg.jpg');
        setHomeHeroVideo(data.hero_video || '/hero-video.mp4');
        setAdminEmail(data.admin_email || 'admin@ashoospy.com');
      }
    } catch (err) {
      console.warn('Backend server offline, loading local settings:', err);
      const localSettings = JSON.parse(localStorage.getItem('local_settings') || '{}');
      setHomeHeroTitle(localSettings.hero_title || 'Crunch it &\nLive the Deliciousness!');
      setHomeHeroSubtitle(localSettings.hero_subtitle || 'قرمشها وعيش اللذاذة');
      setHomeHeroImage(localSettings.hero_image || '/hero-bg.jpg');
      setHomeHeroVideo(localSettings.hero_video || '/hero-video.mp4');
      setAdminEmail(localSettings.admin_email || 'admin@ashoospy.com');
    }
  };

  const handleSaveHomepage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHomepage(true);
    setHomepageError('');
    setHomepageSuccess('');

    const payload = {
      settings: {
        hero_title: homeHeroTitle,
        hero_subtitle: homeHeroSubtitle,
        hero_image: homeHeroImage,
        hero_video: homeHeroVideo,
        admin_email: adminEmail
      }
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setHomepageSuccess('تم حفظ إعدادات الواجهة الرئيسية بنجاح!');
        localStorage.setItem('local_settings', JSON.stringify(payload.settings));
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save settings');
      }
    } catch (err: any) {
      console.warn('Backend server offline, saving homepage locally:', err);
      localStorage.setItem('local_settings', JSON.stringify(payload.settings));
      setHomepageSuccess('تم الحفظ محلياً بنجاح (وضع الأوفلاين)!');
    } finally {
      setIsSavingHomepage(false);
    }
  };

  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setHomeHeroImage(base64);
    } catch (err) {
      console.error('Failed to compress hero image:', err);
      alert('فشل في معالجة وضغط الصورة، يرجى المحاولة بصورة أخرى.');
    }
  };

  const handleMenuItemImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setFormImage(base64);
    } catch (err) {
      console.error('Failed to compress menu item image:', err);
      alert('فشل في معالجة وضغط الصورة، يرجى المحاولة بصورة أخرى.');
    }
  };

  const handleOpenForm = (item: any | null) => {
    setModalError('');
    setModalSuccess('');
    if (item) {
      setEditingItem(item);
      setFormName(item.name);
      setFormDescription(item.description || '');
      setFormPrice(item.price.toString());
      setFormCalories(item.calories ? item.calories.toString() : '');
      setFormImage(item.image || '');
      setFormCategoryId(item.categoryId);
      setFormOptions(item.options ? item.options.map((opt: any) => ({
        name: opt.name,
        price: opt.price,
        category: opt.category
      })) : []);
    } else {
      setEditingItem(null);
      setFormName('');
      setFormDescription('');
      setFormPrice('');
      setFormCalories('');
      setFormImage('');
      setFormCategoryId(categories[0]?.id || '');
      setFormOptions([]);
    }
    setIsFormOpen(true);
  };

  const handleAddFormOption = () => {
    setFormOptions(prev => [...prev, { name: '', price: 0, category: 'ADDON' }]);
  };

  const handleUpdateFormOption = (index: number, key: string, value: any) => {
    setFormOptions(prev => prev.map((opt, i) => {
      if (i === index) {
        return {
          ...opt,
          [key]: key === 'price' ? parseFloat(value) || 0 : value
        };
      }
      return opt;
    }));
  };

  const handleRemoveFormOption = (index: number) => {
    setFormOptions(prev => prev.filter((_, i) => i !== index));
  };

  const toggleItemAvailability = async (item: any) => {
    const updatedStatus = !item.isAvailable;
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/${item.id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ isAvailable: updatedStatus })
      });
      if (res.ok) {
        setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, isAvailable: updatedStatus } : i));
        // Update local cache
        const localItems = JSON.parse(localStorage.getItem('local_menu_items') || '[]');
        const updated = localItems.map((i: any) => i.id === item.id ? { ...i, isAvailable: updatedStatus } : i);
        localStorage.setItem('local_menu_items', JSON.stringify(updated));
      } else {
        throw new Error('Failed to update availability');
      }
    } catch (err) {
      console.warn('Backend server offline, toggling locally:', err);
      const updated = menuItems.map(i => i.id === item.id ? { ...i, isAvailable: updatedStatus } : i);
      setMenuItems(updated);
      localStorage.setItem('local_menu_items', JSON.stringify(updated));
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الصنف نهائياً من القائمة؟')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-passcode': sessionStorage.getItem('admin_passcode') || ''
        }
      });
      if (res.ok) {
        setMenuItems(prev => prev.filter(i => i.id !== itemId));
        // Update local cache
        const localItems = JSON.parse(localStorage.getItem('local_menu_items') || '[]');
        const updated = localItems.filter((i: any) => i.id !== itemId);
        localStorage.setItem('local_menu_items', JSON.stringify(updated));
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('طلب')) {
        alert(err.message);
      } else {
        console.warn('Backend server offline, deleting locally:', err);
        const updated = menuItems.filter(i => i.id !== itemId);
        setMenuItems(updated);
        localStorage.setItem('local_menu_items', JSON.stringify(updated));
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    const itemPayload = {
      name: formName,
      description: formDescription,
      price: parseFloat(formPrice),
      calories: parseInt(formCalories) || 0,
      image: formImage || 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80',
      categoryId: formCategoryId,
      options: formOptions
    };

    try {
      let res;
      if (editingItem) {
        res = await fetch(`${API_BASE_URL}/api/menu/${editingItem.id}`, {
          method: 'PUT',
          headers: getAdminHeaders(),
          body: JSON.stringify(itemPayload)
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/menu`, {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify(itemPayload)
        });
      }

      if (res.ok) {
        const savedItem = await res.json();
        setModalSuccess('تم حفظ بيانات الوجبة بنجاح!');
        
        // Refresh menu list
        if (editingItem) {
          setMenuItems(prev => prev.map(i => i.id === editingItem.id ? savedItem : i));
        } else {
          setMenuItems(prev => [...prev, savedItem]);
        }

        // Update local cache
        const localItems = JSON.parse(localStorage.getItem('local_menu_items') || '[]');
        if (editingItem) {
          const idx = localItems.findIndex((i: any) => i.id === editingItem.id);
          if (idx > -1) localItems[idx] = savedItem;
          else localItems.push(savedItem);
        } else {
          localItems.push(savedItem);
        }
        localStorage.setItem('local_menu_items', JSON.stringify(localItems));

        setTimeout(() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }, 1500);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save item');
      }
    } catch (err: any) {
      console.warn('Backend server offline, saving locally:', err);
      // Fallback local storage CRUD
      const updatedMenu = [...menuItems];
      let mockSavedItem;
      if (editingItem) {
        mockSavedItem = {
          ...editingItem,
          ...itemPayload,
          options: formOptions.map((opt, i) => ({ id: `${editingItem.id}-o-${i}`, menuItemId: editingItem.id, ...opt }))
        };
        const idx = updatedMenu.findIndex(i => i.id === editingItem.id);
        if (idx > -1) updatedMenu[idx] = mockSavedItem;
      } else {
        const newId = `item-${Date.now()}`;
        mockSavedItem = {
          id: newId,
          ...itemPayload,
          isAvailable: true,
          options: formOptions.map((opt, i) => ({ id: `${newId}-o-${i}`, menuItemId: newId, ...opt }))
        };
        updatedMenu.push(mockSavedItem);
      }

      setMenuItems(updatedMenu);
      localStorage.setItem('local_menu_items', JSON.stringify(updatedMenu));
      setModalSuccess('تم الحفظ محلياً بنجاح (وضع الأوفلاين)!');
      
      setTimeout(() => {
        setIsFormOpen(false);
        setEditingItem(null);
      }, 1500);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchMenuData();
      fetchHomepageSettings();
      const interval = setInterval(fetchOrders, 6000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Check if there are any pending orders
    const hasPending = orders.some(o => o.status === 'PENDING');
    
    if (hasPending) {
      const interval = setInterval(() => {
        playPendingOrderReminder();
        
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('⚠️ تنبيه: طلبات قيد الانتظار!', {
            body: 'يوجد طلب معلق يحتاج للمراجعة والقبول في لوحة التحكم.',
            icon: '/logo.png'
          });
        }
      }, 60000); // 1 minute (60 seconds)
      
      return () => clearInterval(interval);
    }
  }, [orders, isAuthenticated]);

  // Handle authentication login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_passcode', passcode);
      } else {
        throw new Error(data.error || 'رمز الدخول غير صحيح');
      }
    } catch (err: any) {
      // Fallback to local storage passcode check
      const localPasscode = localStorage.getItem('admin_passcode') || 'admin123';
      if (passcode === localPasscode) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_passcode', passcode);
      } else {
        setLoginError('رمز المرور المدخل غير صحيح!');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (newPass !== confirmPass) {
      setModalError('كلمات المرور الجديدة غير متطابقة!');
      return;
    }
    if (newPass.length < 4) {
      setModalError('يجب أن تكون كلمة المرور مكونة من 4 رموز على الأقل!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ currentPasscode: currentPass, newPasscode: newPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('admin_passcode', newPass); // local sync
        sessionStorage.setItem('admin_passcode', newPass); // session sync
        setModalSuccess('تم تغيير كلمة المرور بنجاح!');
        setTimeout(() => {
          setIsChangeModalOpen(false);
          setCurrentPass('');
          setNewPass('');
          setConfirmPass('');
          setModalSuccess('');
        }, 1500);
      } else {
        throw new Error(data.error || 'فشل التغيير');
      }
    } catch (err) {
      // Fallback update in local storage
      const localPass = localStorage.getItem('admin_passcode') || 'admin123';
      if (currentPass === localPass) {
        localStorage.setItem('admin_passcode', newPass);
        sessionStorage.setItem('admin_passcode', newPass);
        setModalSuccess('تم تغيير كلمة المرور محلياً بنجاح!');
        setTimeout(() => {
          setIsChangeModalOpen(false);
          setCurrentPass('');
          setNewPass('');
          setConfirmPass('');
          setModalSuccess('');
        }, 1500);
      } else {
        setModalError('كلمة المرور الحالية غير صحيحة!');
      }
    }
  };

  // Submit forgot password request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForgotSuccess(data.message || 'تم إرسال رابط إعادة التعيين بنجاح!');
        localStorage.setItem('local_reset_token', 'temp_reset_token_local');
        localStorage.setItem('local_reset_token_expiry', (Date.now() + 3600000).toString());
      } else {
        throw new Error(data.error || 'فشل معالجة طلب استعادة كلمة المرور');
      }
    } catch (err: any) {
      // Local storage fallback for forgot password
      const localSettings = JSON.parse(localStorage.getItem('local_settings') || '{}');
      const localEmail = localSettings.admin_email || 'admin@ashoospy.com';
      if (forgotEmail.toLowerCase().trim() === localEmail.toLowerCase().trim()) {
        localStorage.setItem('local_reset_token', 'temp_reset_token_local');
        localStorage.setItem('local_reset_token_expiry', (Date.now() + 3600000).toString());
        setForgotSuccess('تم توليد طلب إعادة تعيين محلي! يرجى استخدام الرابط التالي للمحاكاة:\nhttp://localhost:5173/admin?reset_token=temp_reset_token_local');
      } else {
        setForgotError(err.message || 'البريد الإلكتروني المدخل غير صحيح!');
      }
    }
  };

  // Submit reset password request
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (newPasscodeForReset !== confirmPasscodeForReset) {
      setResetError('كلمات المرور الجديدة غير متطابقة!');
      return;
    }
    if (newPasscodeForReset.length < 4) {
      setResetError('يجب أن تكون كلمة المرور مكونة من 4 رموز على الأقل!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPasscode: newPasscodeForReset })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetSuccess('تم إعادة تعيين كلمة المرور بنجاح! سيتم تحويلك لصفحة الدخول...');
        localStorage.setItem('admin_passcode', newPasscodeForReset); // sync local
        setTimeout(() => {
          setResetToken(null);
          setIsForgotPasswordMode(false);
          setNewPasscodeForReset('');
          setConfirmPasscodeForReset('');
          setResetSuccess('');
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 2000);
      } else {
        throw new Error(data.error || 'فشل إعادة التعيين');
      }
    } catch (err: any) {
      const localToken = localStorage.getItem('local_reset_token');
      const localExpiry = localStorage.getItem('local_reset_token_expiry');
      if (localToken && localToken === resetToken && localExpiry && Date.now() < parseInt(localExpiry)) {
        localStorage.setItem('admin_passcode', newPasscodeForReset);
        localStorage.removeItem('local_reset_token');
        localStorage.removeItem('local_reset_token_expiry');
        setResetSuccess('تم إعادة تعيين كلمة المرور محلياً بنجاح! سيتم تحويلك لصفحة الدخول...');
        setTimeout(() => {
          setResetToken(null);
          setIsForgotPasswordMode(false);
          setNewPasscodeForReset('');
          setConfirmPasscodeForReset('');
          setResetSuccess('');
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 2000);
      } else {
        setResetError('رابط إعادة التعيين غير صالح أو منتهي الصلاحية محلياً!');
      }
    }
  };

  // Logout function
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_passcode');
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.warn('Failed to update status on server, updating locally:', err);
      
      const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
      const updated = localOrders.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem('local_orders', JSON.stringify(updated));
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    }
  };

  // Render Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className={`w-full max-w-md bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-xl text-center space-y-6 text-white ${shake ? 'animate-bounce' : ''}`}>
          <div className="w-16 h-16 bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto border-2 border-red-900/40 animate-pulse">
            {resetToken ? (
              <KeyRound className="w-8 h-8" />
            ) : (
              <Lock className="w-8 h-8" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">
              {resetToken ? 'تعيين كلمة مرور جديدة 🛡️' : isForgotPasswordMode ? 'استعادة كلمة المرور 🔑' : 'شاشة التحقق والأمان 🔐'}
            </h2>
            <p className="text-xs text-gray-400 font-bold mt-1.5">
              {resetToken ? 'يرجى كتابة رمز المرور الجديد وتأكيده' : isForgotPasswordMode ? 'أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين' : 'الوصول إلى لوحة إدارة الطلبات محمي بكلمة مرور'}
            </p>
          </div>

          {isForgotPasswordMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <input 
                  type="email"
                  placeholder="أدخل البريد الإلكتروني للمسؤول"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full text-center px-4 py-3 rounded-2xl border border-gray-850 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm"
                  required
                />
              </div>

              {forgotError && (
                <div className="text-xs text-red-500 bg-red-950/20 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-red-900/50">
                  <ShieldAlert className="w-3.5 h-3.5" /> {forgotError}
                </div>
              )}

              {forgotSuccess && (
                <div className="text-xs text-emerald-500 bg-emerald-950/20 py-2.5 px-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1.5 border border-emerald-900/50 whitespace-pre-line">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {forgotSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordMode(false);
                    setForgotError('');
                    setForgotSuccess('');
                  }}
                  className="w-1/2 border border-gray-800 text-gray-400 py-3 rounded-2xl hover:bg-gray-800 font-bold text-xs transition-colors bg-gray-950"
                >
                  العودة لتسجيل الدخول
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-red-600 text-white py-3 rounded-2xl hover:bg-red-700 font-bold text-xs transition-all shadow-md shadow-red-950"
                >
                  إرسال رابط إعادة التعيين
                </button>
              </div>
            </form>
          ) : resetToken ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <input 
                  type="password"
                  placeholder="أدخل رمز المرور الجديد"
                  value={newPasscodeForReset}
                  onChange={(e) => setNewPasscodeForReset(e.target.value)}
                  className="w-full text-center px-4 py-3 rounded-2xl border border-gray-850 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm"
                  required
                />
              </div>
              <div>
                <input 
                  type="password"
                  placeholder="أكّد رمز المرور الجديد"
                  value={confirmPasscodeForReset}
                  onChange={(e) => setConfirmPasscodeForReset(e.target.value)}
                  className="w-full text-center px-4 py-3 rounded-2xl border border-gray-850 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm"
                  required
                />
              </div>

              {resetError && (
                <div className="text-xs text-red-500 bg-red-950/20 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-red-900/50">
                  <ShieldAlert className="w-3.5 h-3.5" /> {resetError}
                </div>
              )}

              {resetSuccess && (
                <div className="text-xs text-emerald-500 bg-emerald-950/20 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-emerald-900/50">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {resetSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setResetToken(null);
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }}
                  className="w-1/2 border border-gray-800 text-gray-400 py-3 rounded-2xl hover:bg-gray-800 font-bold text-xs transition-colors bg-gray-950"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-red-600 text-white py-3 rounded-2xl hover:bg-red-700 font-bold text-xs transition-all shadow-md shadow-red-950"
                >
                  حفظ كلمة المرور الجديدة
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input 
                  type="password"
                  placeholder="أدخل كلمة المرور (الافتراضية: admin123)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full text-center px-4 py-3 rounded-2xl border border-gray-850 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm"
                  required
                />
              </div>

              {loginError && (
                <div className="text-xs text-red-500 bg-red-950/20 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-red-900/50">
                  <ShieldAlert className="w-3.5 h-3.5" /> {loginError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={onBackToMenu}
                  className="w-1/2 border border-gray-800 text-gray-400 py-3 rounded-2xl hover:bg-gray-800 font-bold text-xs transition-colors bg-gray-950"
                >
                  العودة للمنيو
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-red-600 text-white py-3 rounded-2xl hover:bg-red-700 font-bold text-xs transition-all shadow-md shadow-red-950"
                >
                  تأكيد الدخول
                </button>
              </div>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordMode(true)}
                  className="text-xs text-red-400 hover:text-red-300 font-bold underline transition-colors"
                >
                  نسيت رمز المرور؟
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalRevenue = orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.totalPrice, 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'COMPLETED').length;
  const completedOrdersCount = orders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300 text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b border-gray-800">
        <div>
          <h2 className="text-3xl font-black text-white">لوحة تحكم Ashoospy 👑</h2>
          <p className="text-sm text-gray-400 mt-1">إدارة ومراقبة الطلبات الحية وتحديث حالة التسليم للعملاء</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {typeof Notification !== 'undefined' && notificationPermission !== 'granted' && (
            <button 
              onClick={async () => {
                const res = await Notification.requestPermission();
                setNotificationPermission(res);
              }}
              className="flex items-center gap-2 px-4 py-2.5 border border-yellow-800/80 hover:border-yellow-700 text-yellow-500 rounded-full font-bold text-xs bg-yellow-950/20 shadow-xs transition-colors"
            >
              <Bell className="w-3.5 h-3.5" /> تفعيل الإشعارات 🔔
            </button>
          )}
          <button 
            onClick={fetchOrders} 
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-800 hover:border-gray-700 text-gray-300 rounded-full font-bold text-xs bg-gray-900 shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> تحديث البيانات
          </button>
          <button 
            onClick={() => setIsChangeModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-880 hover:border-gray-700 text-gray-300 rounded-full font-bold text-xs bg-gray-900 shadow-xs transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" /> تغيير رمز المرور
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-950 hover:bg-gray-850 text-gray-300 rounded-full font-bold text-xs transition-colors border border-gray-800"
          >
            <LogOut className="w-3.5 h-3.5" /> خروج
          </button>
          <button 
            onClick={onBackToMenu}
            className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-red-700 transition-all text-xs shadow-md"
          >
            العودة لواجهة المنيو
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-800 gap-6 text-sm font-bold pb-2" dir="rtl">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders' ? 'border-red-600 text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          📋 إدارة الطلبات الواردة
        </button>
        <button 
          onClick={() => {
            setActiveTab('menu');
            fetchMenuData();
          }}
          className={`pb-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'menu' ? 'border-red-600 text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          🍔 إدارة قائمة الطعام (المنيو)
        </button>
        <button 
          onClick={() => {
            setActiveTab('homepage');
            fetchHomepageSettings();
          }}
          className={`pb-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'homepage' ? 'border-red-600 text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Layout className="w-3.5 h-3.5" /> إدارة الواجهة الرئيسية
        </button>
      </div>

      {activeTab === 'orders' && (
        <>
          {/* Stats Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xs flex items-center gap-5 text-white">
          <div className="w-12 h-12 bg-red-950/20 text-red-500 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalRevenue} ريال</div>
            <div className="text-xs text-gray-400 font-bold mt-1">إجمالي المبيعات المكتملة</div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xs flex items-center gap-5 text-white">
          <div className="w-12 h-12 bg-yellow-950/20 text-yellow-500 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{activeOrdersCount} طلبات</div>
            <div className="text-xs text-gray-400 font-bold mt-1">الطلبات النشطة حالياً</div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xs flex items-center gap-5 text-white">
          <div className="w-12 h-12 bg-green-950/20 text-green-500 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{completedOrdersCount} طلبات</div>
            <div className="text-xs text-gray-400 font-bold mt-1">الطلبات المسلمة بالكامل</div>
          </div>
        </div>
      </div>

      {/* Orders details grid splitting layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-gray-900 rounded-3xl border border-gray-800 shadow-xs overflow-hidden text-white">
          <div className="p-6 border-b border-gray-800 bg-gray-950/50">
            <h3 className="font-bold text-white text-lg">الطلبات الواردة ({orders.length})</h3>
          </div>

          <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <p className="text-center py-12 text-gray-400 font-bold">لا يوجد أي طلبات واردة بعد</p>
            ) : (
              orders.map(order => {
                const statusLabels: Record<string, string> = {
                  PENDING: 'بانتظار التحضير',
                  PREPARING: 'جاري التحضير',
                  OUT_FOR_DELIVERY: 'خرج للتوصيل',
                  COMPLETED: 'تم التوصيل'
                };
                const statusColors: Record<string, string> = {
                  PENDING: 'bg-yellow-950/40 text-yellow-500 border-yellow-900/50',
                  PREPARING: 'bg-orange-950/40 text-orange-500 border-orange-900/50',
                  OUT_FOR_DELIVERY: 'bg-blue-950/40 text-blue-500 border-blue-900/50',
                  COMPLETED: 'bg-green-950/40 text-green-500 border-green-900/50'
                };

                return (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className={`p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-red-955/10 transition-colors ${
                      selectedOrder?.id === order.id ? 'bg-red-950/20' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-display font-black text-white text-base">{order.id}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors[order.status] || ''}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-bold mt-2">
                        العميل: {order.customerName} - {order.customerPhone}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1 max-w-sm truncate">
                        العنوان: {order.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:text-left self-end sm:self-auto">
                      <div className="text-right sm:text-left">
                        <div className="font-black text-red-500">{order.totalPrice} ريال</div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-950 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Order Details */}
        <div className="lg:col-span-4 bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xs h-fit space-y-6 text-white">
          <h3 className="font-bold text-white text-lg border-b border-gray-800 pb-3 mb-4">تفاصيل الطلب المحدد</h3>
          {selectedOrder ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-sm space-y-2.5">
                <div><span className="text-gray-400 font-bold">معرف الطلب:</span> <span className="font-display font-black text-white">{selectedOrder.id}</span></div>
                <div><span className="text-gray-400 font-bold">العميل:</span> <span className="font-bold text-white">{selectedOrder.customerName}</span></div>
                <div><span className="text-gray-400 font-bold">الجوال:</span> <span className="font-bold text-white">{selectedOrder.customerPhone}</span></div>
                <div><span className="text-gray-400 font-bold">طريقة الدفع:</span> <span className="font-bold text-blue-400">{selectedOrder.paymentMethod || 'CASH'}</span></div>
                <div><span className="text-gray-400 font-bold">نوع الاستلام:</span> <span className="font-bold text-red-500">{selectedOrder.deliveryType === 'DELIVERY' ? '🚀 توصيل' : '🏪 استلام'}</span></div>
                <div><span className="text-gray-400 font-bold">العنوان:</span> <p className="font-bold text-gray-300 text-xs mt-1 bg-gray-950 p-2.5 rounded-lg leading-relaxed border border-gray-850">{selectedOrder.address}</p></div>
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-3">
                <span className="text-xs text-gray-400 font-black block">الوجبات المطلوبة:</span>
                {selectedOrder.items.map((item: any) => {
                  const customizations = JSON.parse(item.customizations || '[]');
                  return (
                    <div key={item.id} className="text-xs flex justify-between items-start border-b border-gray-800/60 pb-2.5">
                      <div>
                        <div className="font-bold text-white">{item.menuItem.name} <span className="text-red-500 font-normal">x{item.quantity}</span></div>
                        {customizations.length > 0 && (
                          <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap gap-1">
                            {customizations.map((c: any, i: number) => (
                              <span key={i} className="bg-gray-950 px-1.5 py-0.5 rounded-md font-bold text-gray-300 border border-gray-850">{c.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-gray-200">{item.price * item.quantity} ريال</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-3">
                <span className="text-xs text-gray-400 font-black block">تغيير حالة الطلب الحية:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'COMPLETED'].map((status) => {
                    const labels: Record<string, string> = { PENDING: 'قيد الانتظار', PREPARING: 'بدء التحضير', OUT_FOR_DELIVERY: 'خروج للتوصيل', COMPLETED: 'تم التسليم' };
                    const activeColors: Record<string, string> = { PENDING: 'bg-yellow-500 text-white border-yellow-500', PREPARING: 'bg-orange-500 text-white border-orange-500', OUT_FOR_DELIVERY: 'bg-blue-500 text-white border-blue-500', COMPLETED: 'bg-green-500 text-white border-green-500' };
                    return (
                      <button 
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)} 
                        className={`p-2.5 rounded-xl border font-bold transition-all ${
                          selectedOrder.status === status 
                            ? activeColors[status] 
                            : 'border-gray-800 hover:border-gray-700 text-gray-300 bg-gray-955'
                        }`}
                      >
                        {labels[status]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-20 text-gray-400 text-xs font-bold">حدد أحد الطلبات من القائمة لمشاهدة تفاصيله والتحكم به.</p>
          )}
        </div>
      </div>
        </>
      )}

      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gray-900 p-6 rounded-3xl border border-gray-800" dir="rtl">
            <div>
              <h3 className="font-bold text-white text-lg">قائمة المأكولات والمشروبات 🍔</h3>
              <p className="text-xs text-gray-400 mt-1">أضف، عدّل أسعار، أو احذف وجبات المطعم من هنا</p>
            </div>
            <button
              onClick={() => handleOpenForm(null)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> إضافة صنف جديد للمنيو
            </button>
          </div>

          {/* Grouped by Category */}
          <div className="space-y-8" dir="rtl">
            {categories.map((category) => {
              const catItems = menuItems.filter(item => item.categoryId === category.id);
              if (catItems.length === 0) return null;

              return (
                <div key={category.id} className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-xs">
                  <div className="p-5 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
                    <h4 className="font-black text-white text-base flex items-center gap-2">
                      <span>{category.name}</span>
                      <span className="text-xs text-gray-500 font-bold">({catItems.length} أصناف)</span>
                    </h4>
                  </div>

                  <div className="divide-y divide-gray-850">
                    {catItems.map((item) => (
                      <div key={item.id} className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80'} 
                            alt={item.name} 
                            className="w-16 h-16 rounded-2xl object-cover border border-gray-800 shrink-0"
                          />
                          <div>
                            <h5 className="font-extrabold text-white text-sm">{item.name}</h5>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-lg line-clamp-1">{item.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] bg-red-950/40 text-red-500 font-bold px-2 py-0.5 rounded-md border border-red-900/30">
                                {item.calories} سعرة
                              </span>
                              {item.options && item.options.length > 0 && (
                                <span className="text-[10px] bg-blue-950/40 text-blue-500 font-bold px-2 py-0.5 rounded-md border border-blue-900/30">
                                  {item.options.length} إضافات/أحجام
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-none pt-3 md:pt-0">
                          {/* Price & availability */}
                          <div className="text-right">
                            <div className="font-black text-red-500 text-sm">{item.price} ريال</div>
                            <button
                              onClick={() => toggleItemAvailability(item)}
                              className={`mt-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                                item.isAvailable 
                                  ? 'bg-green-950/40 text-green-500 border-green-900/50 hover:bg-green-900/20' 
                                  : 'bg-gray-955 text-gray-500 border-gray-800 hover:bg-gray-900/20'
                              }`}
                            >
                              {item.isAvailable ? '● متاح للطلب' : '○ غير متاح'}
                            </button>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenForm(item)}
                              className="px-3.5 py-2 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-colors bg-gray-955 cursor-pointer flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" /> تعديل
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="px-3.5 py-2 bg-red-955 text-red-500 hover:bg-red-950/40 border border-red-900/40 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'homepage' && (
        <div className="space-y-6" dir="rtl">
          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
            <h3 className="font-bold text-white text-lg">إدارة الواجهة الرئيسية للموقع 📋</h3>
            <p className="text-xs text-gray-400 mt-1">عدل النصوص وصورة الخلفية للبانر الرئيسي في الصفحة الرئيسية</p>
          </div>

          <form onSubmit={handleSaveHomepage} className="bg-gray-900 p-8 rounded-3xl border border-gray-800 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">عنوان البانر الرئيسي (يمكن استخدام أسطر جديدة)</label>
                <textarea 
                  value={homeHeroTitle}
                  onChange={(e) => setHomeHeroTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500 h-28 resize-none"
                  placeholder="مثال: Crunch it & \nLive the Deliciousness!"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">العنوان الفرعي (العربي)</label>
                <input 
                  type="text"
                  value={homeHeroSubtitle}
                  onChange={(e) => setHomeHeroSubtitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="مثال: قرمشها وعيش اللذاذة"
                  required
                />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 space-y-4">
              <span className="text-xs font-black text-gray-300 block">صورة خلفية البانر الرئيسي</span>
              <div className="flex flex-col md:flex-row items-center gap-6">
                {homeHeroImage && (
                  <div className="relative w-48 h-28 rounded-xl overflow-hidden border border-gray-800 shrink-0">
                    <img src={homeHeroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 w-full space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1.5">اختر صورة من جهازك للرفع</label>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageChange}
                      className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-955 file:text-red-500 hover:file:bg-red-900/20 file:cursor-pointer border border-gray-800 p-2.5 rounded-xl bg-gray-955"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1.5">أو أدخل رابط صورة مباشر</label>
                    <input 
                      type="text"
                      value={homeHeroImage}
                      onChange={(e) => setHomeHeroImage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-xs bg-gray-955 text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 space-y-4">
              <span className="text-xs font-black text-gray-300 block">فيديو خلفية البانر الرئيسي</span>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1.5">رابط أو مسار الفيديو المباشر (MP4)</label>
                  <input 
                    type="text"
                    value={homeHeroVideo}
                    onChange={(e) => setHomeHeroVideo(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-xs bg-gray-955 text-white focus:outline-none"
                    placeholder="مثال: /hero-video.mp4 أو رابط خارجي"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 space-y-4">
              <span className="text-xs font-black text-gray-300 block">إعدادات الأمان واستعادة الحساب</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1.5">البريد الإلكتروني للمسؤول (لاستعادة كلمة المرور)</label>
                  <input 
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="admin@ashoospy.com"
                    required
                  />
                </div>
              </div>
            </div>

            {homepageError && <p className="text-xs text-red-500 bg-red-955/20 p-2.5 rounded-xl border border-red-900/50 font-bold">{homepageError}</p>}
            {homepageSuccess && <p className="text-xs text-green-500 bg-green-955/20 p-2.5 rounded-xl border border-green-900/50 font-bold">{homepageSuccess}</p>}

            <div className="border-t border-gray-800 pt-6 flex justify-end">
              <button 
                type="submit"
                disabled={isSavingHomepage}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-8 py-3 rounded-2xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSavingHomepage ? 'جاري الحفظ...' : 'حفظ إعدادات الواجهة'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-gray-900 w-full max-w-2xl p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-6 text-right text-white max-h-[90vh] overflow-y-auto" dir="rtl">
            <h3 className="text-xl font-black text-white border-b border-gray-800 pb-3">
              {editingItem ? 'تعديل بيانات الوجبة 🍔' : 'إضافة صنف جديد للمنيو ➕'}
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1.5">اسم الصنف (مثال: برجر دبل تشيز)</label>
                  <input 
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1.5">التصنيف</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">اختر التصنيف...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1.5">السعر (بالريال اليمني)</label>
                  <input 
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1.5">السعرات الحرارية</label>
                  <input 
                    type="number"
                    value={formCalories}
                    onChange={(e) => setFormCalories(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-800/60 pt-4 space-y-4">
                <span className="text-xs font-black text-gray-300 block">صورة الوجبة</span>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  {formImage && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-800 shrink-0 bg-gray-955">
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 w-full space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">اختر صورة من جهازك للرفع</label>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleMenuItemImageChange}
                        className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-red-955 file:text-red-500 hover:file:bg-red-900/20 file:cursor-pointer border border-gray-800 p-2 rounded-lg bg-gray-955"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">أو أدخل رابط صورة مباشر</label>
                      <input 
                        type="text"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-4 py-2 rounded-xl border border-gray-800 text-xs bg-gray-955 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">وصف الوجبة</label>
                <textarea 
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500 h-20 resize-none"
                />
              </div>

              {/* Customization Options Editor */}
              <div className="border-t border-gray-800 pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-300 block">خيارات التخصيص (الأحجام والإضافات)</span>
                  <button
                    type="button"
                    onClick={handleAddFormOption}
                    className="text-[10px] bg-gray-850 hover:bg-gray-800 text-white font-bold px-3 py-1.5 rounded-lg border border-gray-800 transition-all cursor-pointer"
                  >
                    ➕ إضافة خيار
                  </button>
                </div>

                {formOptions.length === 0 ? (
                  <p className="text-[11px] text-gray-500">لا يوجد خيارات مخصصة لهذا الصنف بعد. يمكنك إضافة أحجام أو إضافات.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {formOptions.map((opt, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="اسم الخيار (مثال: حجم كبير، جبنة إضافية)"
                          value={opt.name}
                          onChange={(e) => handleUpdateFormOption(index, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-800 text-xs bg-gray-955 text-white focus:outline-none"
                          required
                        />
                        <input
                          type="number"
                          placeholder="السعر الإضافي"
                          value={opt.price.toString()}
                          onChange={(e) => handleUpdateFormOption(index, 'price', e.target.value)}
                          className="w-24 px-3 py-2 rounded-lg border border-gray-800 text-xs bg-gray-955 text-white focus:outline-none"
                          required
                        />
                        <select
                          value={opt.category}
                          onChange={(e) => handleUpdateFormOption(index, 'category', e.target.value)}
                          className="w-28 px-3 py-2 rounded-lg border border-gray-800 text-xs bg-gray-955 text-white focus:outline-none"
                        >
                          <option value="SIZE">حجم (Size)</option>
                          <option value="ADDON">إضافة (Addon)</option>
                          <option value="EXCLUDE">بدون (Exclude)</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveFormOption(index)}
                          className="p-2 text-red-500 hover:bg-red-950/20 rounded-lg transition-colors border border-red-950/30 cursor-pointer text-xs"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {modalError && <p className="text-xs text-red-500 bg-red-955/20 p-2.5 rounded-xl border border-red-900/50 font-bold">{modalError}</p>}
              {modalSuccess && <p className="text-xs text-green-500 bg-green-955/20 p-2.5 rounded-xl border border-green-900/50 font-bold">{modalSuccess}</p>}

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-1/2 border border-gray-850 text-gray-300 py-3 rounded-2xl hover:bg-gray-850 font-bold text-xs transition-colors bg-gray-955 cursor-pointer"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-red-600 text-white py-3 rounded-2xl hover:bg-red-700 font-bold text-xs transition-all shadow-md shadow-red-950 cursor-pointer"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangeModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-gray-900 w-full max-w-md p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-5 text-right text-white" dir="rtl">
            <h3 className="text-xl font-black text-white border-b border-gray-800 pb-3">تغيير رمز مرور الإدارة 🔑</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">رمز المرور الحالي</label>
                <input 
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">رمز المرور الجديد</label>
                <input 
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">تأكيد رمز المرور الجديد</label>
                <input 
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-800 text-sm font-bold bg-gray-955 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {modalError && <p className="text-xs text-red-500 bg-red-955/20 p-2.5 rounded-xl border border-red-900/50 font-bold">{modalError}</p>}
              {modalSuccess && <p className="text-xs text-green-500 bg-green-955/20 p-2.5 rounded-xl border border-green-900/50 font-bold">{modalSuccess}</p>}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsChangeModalOpen(false);
                    setModalError('');
                    setModalSuccess('');
                  }}
                  className="w-1/2 border border-gray-850 text-gray-300 py-2.5 rounded-xl hover:bg-gray-850 font-bold text-xs transition-colors bg-gray-955"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 font-bold text-xs transition-all shadow-md shadow-red-950"
                >
                  حفظ التغييرات
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* New Order Toast Alert */}
      {newOrderToast && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm bg-gray-900 border-2 border-red-600 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 flex items-center gap-4 text-right" dir="rtl">
          <div className="w-12 h-12 bg-red-955/20 text-red-500 rounded-2xl flex items-center justify-center shrink-0 border border-red-900/50">
            <Volume2 className="w-6 h-6 animate-bounce" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-sm text-white">👑 طلب جديد وارد للتو!</h4>
            <p className="text-xs text-gray-400 mt-1 font-bold">العميل: {newOrderToast.customerName}</p>
            <p className="text-xs text-red-500 font-bold mt-0.5">{newOrderToast.totalPrice} ريال | معرف: {newOrderToast.id}</p>
          </div>
          <button 
            onClick={() => {
              setSelectedOrder(newOrderToast);
              setNewOrderToast(null);
            }}
            className="text-xs bg-red-600 text-white font-bold px-3.5 py-2 rounded-xl hover:bg-red-700 transition-colors"
          >
            عرض
          </button>
        </div>
      )}
    </div>
  );
};
