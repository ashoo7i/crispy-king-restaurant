import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Generate readable random ID (e.g. CR-1984)
function generateOrderId() {
  return 'CR-' + Math.floor(1000 + Math.random() * 9000);
}

// Get All Orders (for admin panel)
router.get('/orders', async (req: Request, res: Response) => {
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
router.patch('/orders/:id/status', async (req: Request, res: Response) => {
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
router.post('/admin/change-password', async (req: Request, res: Response) => {
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

export default router;
