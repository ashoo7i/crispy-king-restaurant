import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendWhatsAppNotification } from './whatsapp';

const prisma = new PrismaClient();
const router = Router();

// Admin API Authentication Middleware
const checkAdminAuth = async (req: Request, res: Response, next: () => void) => {
  const passcode = req.headers['x-admin-passcode'];
  if (!passcode) {
    return res.status(401).json({ error: 'غير مصرح بالوصول. يرجى تقديم رمز مرور الإدارة.' });
  }

  try {
    const dbPasscode = await prisma.setting.findUnique({
      where: { key: 'admin_passcode' }
    });
    const validPasscode = dbPasscode?.value || 'admin123';
    if (passcode === validPasscode) {
      next();
    } else {
      res.status(401).json({ error: 'رمز المرور غير صحيح!' });
    }
  } catch (error) {
    console.error('Admin auth check failed:', error);
    res.status(500).json({ error: 'فشل التحقق من صلاحيات الإدارة' });
  }
};

// Generate readable random ID (e.g. CR-1984)
function generateOrderId() {
  return 'CR-' + Math.floor(1000 + Math.random() * 9000);
}

// Get All Orders (for admin panel)
router.get('/orders', checkAdminAuth, async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { menuItem: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get Categories
router.get('/categories', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=10');
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get Menu Items with Options
router.get('/menu', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=10');
  try {
    const items = await prisma.menuItem.findMany({
      include: { options: true }
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Create Order
router.post('/orders', async (req: Request, res: Response) => {
  const { customerName, customerPhone, deliveryType, address, totalPrice, paymentMethod, items } = req.body;

  if (!customerName || !customerPhone || !deliveryType || !totalPrice || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required order details' });
  }

  try {
    const orderId = generateOrderId();
    const order = await prisma.order.create({
      data: {
        id: orderId,
        customerName,
        customerPhone,
        deliveryType,
        address,
        status: 'PENDING',
        totalPrice,
        paymentMethod: paymentMethod || 'CASH',
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            customizations: JSON.stringify(item.customizations || [])
          }))
        }
      }
    });
    // Send WhatsApp notification for PENDING order status
    sendWhatsAppNotification(order.customerName, order.customerPhone, order.id, 'PENDING').catch(err => {
      console.error('Error sending order placement WhatsApp:', err);
    });

    res.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get Order Status for Tracking Page
router.get('/orders/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { menuItem: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update Order Status (Admin simulation)
router.patch('/orders/:id/status', checkAdminAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });
    // Send WhatsApp notification for status change
    sendWhatsAppNotification(updatedOrder.customerName, updatedOrder.customerPhone, updatedOrder.id, status).catch(err => {
      console.error('Error sending order status change WhatsApp:', err);
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Admin Login Endpoint
router.post('/admin/login', async (req: Request, res: Response) => {
  const { passcode } = req.body;
  try {
    const dbPasscode = await prisma.setting.findUnique({
      where: { key: 'admin_passcode' }
    });
    const validPasscode = dbPasscode?.value || 'admin123';
    if (passcode === validPasscode) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: 'كلمة المرور غير صحيحة' });
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ success: false, error: 'فشل التحقق من كلمة المرور' });
  }
});

// Admin Change Password Endpoint
router.post('/admin/change-password', checkAdminAuth, async (req: Request, res: Response) => {
  const { currentPasscode, newPasscode } = req.body;
  try {
    const dbPasscode = await prisma.setting.findUnique({
      where: { key: 'admin_passcode' }
    });
    const validPasscode = dbPasscode?.value || 'admin123';
    if (currentPasscode !== validPasscode) {
      return res.status(401).json({ success: false, error: 'كلمة المرور الحالية غير صحيحة' });
    }
    await prisma.setting.upsert({
      where: { key: 'admin_passcode' },
      update: { value: newPasscode },
      create: { key: 'admin_passcode', value: newPasscode }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error changing admin password:', error);
    res.status(500).json({ success: false, error: 'فشل تغيير كلمة المرور' });
  }
});

// Admin Forgot Password Endpoint
router.post('/admin/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'البريد الإلكتروني مطلوب' });
  }

  try {
    const dbEmail = await prisma.setting.findUnique({
      where: { key: 'admin_email' }
    });
    const validEmail = dbEmail?.value || 'admin@ashoospy.com';

    if (email.toLowerCase().trim() !== validEmail.toLowerCase().trim()) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني المدخل غير مسجل كمسؤول!' });
    }

    // Generate token and expiry (1 hour)
    const token = crypto.randomBytes(16).toString('hex');
    const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    // Save token in DB Settings table
    await prisma.setting.upsert({
      where: { key: 'admin_reset_token' },
      update: { value: token },
      create: { key: 'admin_reset_token', value: token }
    });
    await prisma.setting.upsert({
      where: { key: 'admin_reset_token_expiry' },
      update: { value: expiry },
      create: { key: 'admin_reset_token_expiry', value: expiry }
    });

    // Create reset link
    const origin = req.headers.referer || req.headers.origin || 'http://localhost:5173';
    const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    const resetLink = `${cleanOrigin}/?reset_token=${token}`;

    console.log(`\n🔑 [RESET LINK GENERATED]: ${resetLink}\n`);

    // Check if Resend API Key is set
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Ashoospy <onboarding@resend.dev>',
          to: validEmail,
          subject: 'إعادة تعيين رمز مرور لوحة التحكم - Ashoospy',
          html: `
            <div style="font-family: sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
              <h2 style="color: #dc2626;">طلب إعادة تعيين رمز المرور</h2>
              <p>مرحباً، لقد تم تقديم طلب لإعادة تعيين رمز المرور للوحة التحكم.</p>
              <p>يرجى الضغط على الزر أدناه لتغيير كلمة المرور الخاصة بك:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #dc2626; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">إعادة تعيين رمز المرور</a>
              </div>
              <p style="color: #666; font-size: 12px;">هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب هذا، يمكنك تجاهل هذا البريد الإلكتروني.</p>
            </div>
          `
        })
      });

      if (emailRes.ok) {
        return res.json({ success: true, message: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.' });
      } else {
        const errorData = await emailRes.json().catch(() => ({}));
        console.error('Failed to send email via Resend:', errorData);
        return res.json({ 
          success: true, 
          message: 'تم توليد الرابط بنجاح، ولكن فشل الإرسال التلقائي. يرجى مراجعة وحدة تحكم السيرفر (Console) لنسخ الرابط.' 
        });
      }
    } else {
      return res.json({ 
        success: true, 
        message: 'تم توليد الرابط بنجاح! بما أن السيرفر يعمل محلياً، يرجى نسخ الرابط من وحدة تحكم السيرفر (Terminal) للمتابعة.' 
      });
    }
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء معالجة الطلب' });
  }
});

// Admin Reset Password Endpoint
router.post('/admin/reset-password', async (req: Request, res: Response) => {
  const { token, newPasscode } = req.body;
  if (!token || !newPasscode) {
    return res.status(400).json({ success: false, error: 'الرمز وكلمة المرور الجديدة مطلوبان' });
  }

  try {
    const dbToken = await prisma.setting.findUnique({
      where: { key: 'admin_reset_token' }
    });
    const dbExpiry = await prisma.setting.findUnique({
      where: { key: 'admin_reset_token_expiry' }
    });

    if (!dbToken || !dbExpiry || dbToken.value !== token) {
      return res.status(400).json({ success: false, error: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية' });
    }

    const expiryTime = new Date(dbExpiry.value).getTime();
    if (Date.now() > expiryTime) {
      return res.status(400).json({ success: false, error: 'انتهت صلاحية رابط إعادة التعيين (أكثر من ساعة)' });
    }

    // Update passcode
    await prisma.setting.upsert({
      where: { key: 'admin_passcode' },
      update: { value: newPasscode },
      create: { key: 'admin_passcode', value: newPasscode }
    });

    // Clear reset token settings
    await prisma.setting.delete({ where: { key: 'admin_reset_token' } }).catch(() => {});
    await prisma.setting.delete({ where: { key: 'admin_reset_token_expiry' } }).catch(() => {});

    res.json({ success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح!' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, error: 'فشل إعادة تعيين كلمة المرور' });
  }
});

// Create Menu Item
router.post('/menu', checkAdminAuth, async (req: Request, res: Response) => {
  const { name, description, price, calories, image, categoryId, options } = req.body;
  if (!name || price === undefined || !categoryId) {
    return res.status(400).json({ error: 'Missing required fields (name, price, categoryId)' });
  }

  try {
    const item = await prisma.menuItem.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        calories: parseInt(calories) || 0,
        image: image || 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80',
        categoryId,
        isAvailable: true,
        options: {
          create: options ? options.map((opt: any) => ({
            name: opt.name,
            price: parseFloat(opt.price) || 0,
            category: opt.category || 'ADDON'
          })) : []
        }
      },
      include: { options: true }
    });
    res.json(item);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update Menu Item
router.put('/menu/:id', checkAdminAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, calories, image, categoryId, isAvailable, options } = req.body;

  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (calories !== undefined) updateData.calories = parseInt(calories) || 0;
    if (image !== undefined) updateData.image = image;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isAvailable !== undefined) updateData.isAvailable = !!isAvailable;

    if (options !== undefined) {
      // Clear out existing options first to rewrite them
      await prisma.customizationOption.deleteMany({
        where: { menuItemId: id }
      });
      updateData.options = {
        create: options.map((opt: any) => ({
          name: opt.name,
          price: parseFloat(opt.price) || 0,
          category: opt.category || 'ADDON'
        }))
      };
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: updateData,
      include: { options: true }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete Menu Item
router.delete('/menu/:id', checkAdminAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Check if the item has ever been ordered
    const orderItemCount = await prisma.orderItem.count({
      where: { menuItemId: id }
    });

    if (orderItemCount > 0) {
      return res.status(400).json({
        error: 'لا يمكن حذف هذا الصنف لأنه مرتبط بطلبات سابقة للعملاء. يرجى إلغاء تفعيل خيار (متاح) بدلاً من الحذف.'
      });
    }

    // Delete customization options first
    await prisma.customizationOption.deleteMany({
      where: { menuItemId: id }
    });

    // Delete the menu item itself
    await prisma.menuItem.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Get Settings
router.get('/settings', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=10');
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    res.json(settingsMap);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update Settings
router.post('/settings', checkAdminAuth, async (req: Request, res: Response) => {
  const { settings } = req.body;
  if (!settings) {
    return res.status(400).json({ error: 'Settings object is required' });
  }
  try {
    const upserts = Object.entries(settings).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    });
    await Promise.all(upserts);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
