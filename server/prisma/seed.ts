import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customizationOption.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();

  // Categories
  const burgers = await prisma.category.create({
    data: {
      name: 'برجر وبطاطس',
      slug: 'burgers',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    },
  });

  const chicken = await prisma.category.create({
    data: {
      name: 'دجاج مقلي مقرمش',
      slug: 'chicken',
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80',
    },
  });

  const beverages = await prisma.category.create({
    data: {
      name: 'المشروبات والحلويات',
      slug: 'drinks',
      image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=80',
    },
  });

  // 1. Zinger-style Burger
  const item1 = await prisma.menuItem.create({
    data: {
      name: 'تويستر كينج الحار',
      description: 'صدر دجاج مقرمش حار مع الخس والمايونيز والجبنة في خبز البريوش الفاخر.',
      price: 3500.0,
      calories: 580,
      image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80',
      categoryId: burgers.id,
    },
  });

  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: item1.id, name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { menuItemId: item1.id, name: 'حجم كبير (مع بطاطس ومشروب ضخم)', price: 1000.0, category: 'SIZE' },
      { menuItemId: item1.id, name: 'جبنة شيدر إضافية', price: 500.0, category: 'ADDON' },
      { menuItemId: item1.id, name: 'صوص رانش إضافي', price: 300.0, category: 'ADDON' },
      { menuItemId: item1.id, name: 'بدون بصل', price: 0.0, category: 'EXCLUDE' },
    ],
  });

  // 2. Chicken Bucket
  const item2 = await prisma.menuItem.create({
    data: {
      name: 'دلو التوفير المقرمش (8 قطع)',
      description: '8 قطع من الدجاج المقرمش الذهبي مع اختيارك من النكهة العادية أو الحارة، يقدم مع بطاطس عائلية.',
      price: 12000.0,
      calories: 1450,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
      categoryId: chicken.id,
    },
  });

  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: item2.id, name: 'دجاج حار', price: 0.0, category: 'SIZE' },
      { menuItemId: item2.id, name: 'دجاج خلطة سرية عادية', price: 0.0, category: 'SIZE' },
      { menuItemId: item2.id, name: 'إضافة صوص الثوم', price: 500.0, category: 'ADDON' },
    ],
  });

  // 3. Royal Beef Burger
  const item3 = await prisma.menuItem.create({
    data: {
      name: 'برجر رويال لحم',
      description: 'شريحة لحم مشوي على اللهب مع الطماطم، الخس، المخلل، وصوص رويال المدخن.',
      price: 4000.0,
      calories: 620,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
      categoryId: burgers.id,
    },
  });

  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: item3.id, name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { menuItemId: item3.id, name: 'حجم كبير مكس', price: 1000.0, category: 'SIZE' },
      { menuItemId: item3.id, name: 'شريحة لحم إضافية', price: 1500.0, category: 'ADDON' },
      { menuItemId: item3.id, name: 'جبنة إضافية', price: 500.0, category: 'ADDON' },
    ],
  });

  // 4. Fries
  const item4 = await prisma.menuItem.create({
    data: {
      name: 'بطاطس مقرمشة ذهبية',
      description: 'أصابع البطاطس المقلية المقرمشة والمملحة بشكل مثالي.',
      price: 1500.0,
      calories: 320,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80',
      categoryId: burgers.id,
    },
  });

  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: item4.id, name: 'حجم وسط', price: 0.0, category: 'SIZE' },
      { menuItemId: item4.id, name: 'حجم كبير جداً', price: 500.0, category: 'SIZE' },
      { menuItemId: item4.id, name: 'إضافة بهارات حارة', price: 200.0, category: 'ADDON' },
      { menuItemId: item4.id, name: 'إضافة صوص الجبنة', price: 500.0, category: 'ADDON' },
    ],
  });

  // 5. Drinks
  const item5 = await prisma.menuItem.create({
    data: {
      name: 'كولا مثلجة',
      description: 'مشروب غازي منعش يقدم بارداً مع الثلج.',
      price: 1000.0,
      calories: 140,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80',
      categoryId: beverages.id,
    },
  });

  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: item5.id, name: 'حجم وسط', price: 0.0, category: 'SIZE' },
      { menuItemId: item5.id, name: 'حجم كبير', price: 400.0, category: 'SIZE' },
      { menuItemId: item5.id, name: 'بدون ثلج', price: 0.0, category: 'EXCLUDE' },
    ],
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
