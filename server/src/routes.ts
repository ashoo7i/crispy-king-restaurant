import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Generate readable random ID (e.g. CR-1984)
function generateOrderId() {
  return 'CR-' + Math.floor(1000 + Math.random() * 9000);
}

// Get Categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
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
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Create Order
router.post('/orders', async (req: Request, res: Response) => {
  const { customerName, customerPhone, deliveryType, address, totalPrice, items } = req.body;

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
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
