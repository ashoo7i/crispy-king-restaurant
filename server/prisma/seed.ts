import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear old data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customizationOption.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();

  // Create Categories
  const burgers = await prisma.category.create({
    data: {
      name: 'البرجر',
      slug: 'burgers',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    },
  });

  const chicken = await prisma.category.create({
    data: {
      name: 'كرسبي دجاج',
      slug: 'crispy-chicken',
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80',
    },
  });

  const pizza = await prisma.category.create({
    data: {
      name: 'البيتزا',
      slug: 'pizza',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
    },
  });

  const drinks = await prisma.category.create({
    data: {
      name: 'المشروبات',
      slug: 'drinks',
      image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=80',
    },
  });

  const desserts = await prisma.category.create({
    data: {
      name: 'الحلويات',
      slug: 'desserts',
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
    },
  });

  // --- BURGERS ---
  const b1 = await prisma.menuItem.create({
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
      { menuItemId: b1.id, name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { menuItemId: b1.id, name: 'تحويل لوجبة مع بطاطس ومشروب', price: 1000.0, category: 'SIZE' },
      { menuItemId: b1.id, name: 'شريحة لحم إضافية', price: 1500.0, category: 'ADDON' },
      { menuItemId: b1.id, name: 'جبنة شيدر إضافية', price: 500.0, category: 'ADDON' },
    ],
  });

  const b2 = await prisma.menuItem.create({
    data: {
      name: 'برجر كلاسيك دجاج',
      description: 'صدر دجاج مقرمش ذهبي مع الخس، المايونيز والجبنة.',
      price: 3500.0,
      calories: 550,
      image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80',
      categoryId: burgers.id,
    },
  });
  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: b2.id, name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { menuItemId: b2.id, name: 'تحويل لوجبة مع بطاطس ومشروب', price: 1000.0, category: 'SIZE' },
      { menuItemId: b2.id, name: 'جبنة شيدر إضافية', price: 500.0, category: 'ADDON' },
      { menuItemId: b2.id, name: 'بارد (عادي)', price: 0.0, category: 'EXCLUDE' },
      { menuItemId: b2.id, name: 'حار سبايسي', price: 0.0, category: 'EXCLUDE' },
    ],
  });

  const b3 = await prisma.menuItem.create({
    data: {
      name: 'برجر الجبن المزدوج',
      description: 'شريحتان من اللحم المشوي مع طبقتين من جبنة الشيدر وصوص Ashoospy.',
      price: 4800.0,
      calories: 780,
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80',
      categoryId: burgers.id,
    },
  });
  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: b3.id, name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { menuItemId: b3.id, name: 'تحويل لوجبة مع بطاطس ومشروب', price: 1000.0, category: 'SIZE' },
      { menuItemId: b3.id, name: 'شريحة لحم إضافية', price: 1500.0, category: 'ADDON' },
    ],
  });

  const b4 = await prisma.menuItem.create({
    data: {
      name: 'تويستر كينج الحار',
      description: 'صدر دجاج مقرمش حار ملفوف بخبز التورتيلا مع الخس والطماطم وصوص رانش.',
      price: 3500.0,
      calories: 580,
      image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80',
      categoryId: burgers.id,
    },
  });
  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: b4.id, name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { menuItemId: b4.id, name: 'تحويل لوجبة مع بطاطس ومشروب', price: 1000.0, category: 'SIZE' },
    ],
  });

  // --- CRISPY CHICKEN ---
  const c1 = await prisma.menuItem.create({
    data: {
      name: 'دلو التوفير المقرمش (8 قطع)',
      description: '8 قطع دجاج مقرمش ذهبي مع بطاطس عائلية، صوص الثومية، والخبز.',
      price: 12000.0,
      calories: 1450,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
      categoryId: chicken.id,
    },
  });
  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: c1.id, name: 'نكهة عادية', price: 0.0, category: 'SIZE' },
      { menuItemId: c1.id, name: 'نكهة حارة', price: 0.0, category: 'SIZE' },
      { menuItemId: c1.id, name: 'صوص ثومية إضافي', price: 300.0, category: 'ADDON' },
    ],
  });

  const c2 = await prisma.menuItem.create({
    data: {
      name: 'وجبة سوبر كرسبي (4 قطع)',
      description: '4 قطع استربس دجاج مقرمش يقدم مع البطاطس، صوص الثومية والخبز.',
      price: 6500.0,
      calories: 850,
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80',
      categoryId: chicken.id,
    },
  });
  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: c2.id, name: 'نكهة عادية', price: 0.0, category: 'SIZE' },
      { menuItemId: c2.id, name: 'نكهة حارة', price: 0.0, category: 'SIZE' },
    ],
  });

  const c3 = await prisma.menuItem.create({
    data: {
      name: 'أصابع استربس الدجاج (5 قطع)',
      description: 'أصابع الدجاج المقرمشة الذهبية تقدم مع صوص خردل بالعسل.',
      price: 3200.0,
      calories: 450,
      image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&q=80',
      categoryId: chicken.id,
    },
  });
  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: c3.id, name: 'نكهة عادية', price: 0.0, category: 'SIZE' },
      { menuItemId: c3.id, name: 'نكهة حارة', price: 0.0, category: 'SIZE' },
    ],
  });

  // --- PIZZA ---
  const p1 = await prisma.menuItem.create({
    data: {
      name: 'بيتزا مارغريتا كينج',
      description: 'صلصة الطماطم الغنية مغطاة بجبنة الموزاريلا الفاخرة وأوراق الريحان.',
      price: 4500.0,
      calories: 720,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
      categoryId: pizza.id,
    },
  });
  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: p1.id, name: 'حجم وسط', price: 0.0, category: 'SIZE' },
      { menuItemId: p1.id, name: 'حجم كبير', price: 1500.0, category: 'SIZE' },
      { menuItemId: p1.id, name: 'خضار إضافي', price: 500.0, category: 'ADDON' },
    ],
  });

  const p2 = await prisma.menuItem.create({
    data: {
      name: 'بيتزا البيبروني الفاخرة',
      description: 'جبنة موزاريلا مع قطع بيبيروني لحم بقري وصوص البيتزا الإيطالي.',
      price: 5500.0,
      calories: 890,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80',
      categoryId: pizza.id,
    },
  });
  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: p2.id, name: 'حجم وسط', price: 0.0, category: 'SIZE' },
      { menuItemId: p2.id, name: 'حجم كبير', price: 1500.0, category: 'SIZE' },
      { menuItemId: p2.id, name: 'جبنة موزاريلا إضافية', price: 800.0, category: 'ADDON' },
    ],
  });

  const p3 = await prisma.menuItem.create({
    data: {
      name: 'بيتزا كرسبي دجاج',
      description: 'قطع الدجاج المقرمش مع الفلفل الألوان والموزاريلا وصوص الرانش اللذيذ.',
      price: 5800.0,
      calories: 920,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
      categoryId: pizza.id,
    },
  });
  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: p3.id, name: 'حجم وسط', price: 0.0, category: 'SIZE' },
      { menuItemId: p3.id, name: 'حجم كبير', price: 1500.0, category: 'SIZE' },
    ],
  });

  // --- DRINKS ---
  const d1 = await prisma.menuItem.create({
    data: {
      name: 'كولا مثلجة',
      description: 'مشروب غازي منعش يقدم بارداً جداً.',
      price: 1000.0,
      calories: 140,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80',
      categoryId: drinks.id,
    },
  });
  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: d1.id, name: 'حجم وسط', price: 0.0, category: 'SIZE' },
      { menuItemId: d1.id, name: 'حجم كبير', price: 400.0, category: 'SIZE' },
      { menuItemId: d1.id, name: 'بدون ثلج', price: 0.0, category: 'EXCLUDE' },
    ],
  });

  const d2 = await prisma.menuItem.create({
    data: {
      name: 'عصير ليمون بالنعناع طبيعي',
      description: 'عصير طبيعي طازج محضر من الليمون والنعناع.',
      price: 1500.0,
      calories: 120,
      image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&q=80',
      categoryId: drinks.id,
    },
  });
  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: d2.id, name: 'حجم عادي', price: 0.0, category: 'SIZE' },
      { menuItemId: d2.id, name: 'سكر خفيف', price: 0.0, category: 'EXCLUDE' },
    ],
  });

  const d3 = await prisma.menuItem.create({
    data: {
      name: 'مياه معدنية',
      description: 'مياه شرب معبأة ومنعشة.',
      price: 500.0,
      calories: 0,
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500&q=80',
      categoryId: drinks.id,
    },
  });

  // --- DESSERTS ---
  const de1 = await prisma.menuItem.create({
    data: {
      name: 'كيك الشوكولاتة الدافئ',
      description: 'كيك شوكولاتة غني يقدم مع صوص فادج الشوكولاتة الساخن.',
      price: 2500.0,
      calories: 420,
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&q=80',
      categoryId: desserts.id,
    },
  });
  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: de1.id, name: 'إضافة بول آيس كريم فانيليا', price: 800.0, category: 'ADDON' },
    ],
  });

  const de2 = await prisma.menuItem.create({
    data: {
      name: 'وافل مقرمش بالنوتيلا',
      description: 'وافل بلجيكي مغطى بالنوتيلا الغنية وقطع الموز والفراولة.',
      price: 2800.0,
      calories: 510,
      image: 'https://images.unsplash.com/photo-1695304781788-2ae3f1b02ccc?w=500&q=80',
      categoryId: desserts.id,
    },
  });
  await prisma.customizationOption.createMany({
    data: [
      { menuItemId: de2.id, name: 'إضافة بول آيس كريم', price: 800.0, category: 'ADDON' },
    ],
  });

  // Seed default admin passcode if it doesn't exist
  const existingPasscode = await prisma.setting.findUnique({
    where: { key: 'admin_passcode' }
  });
  if (!existingPasscode) {
    await prisma.setting.create({
      data: {
        key: 'admin_passcode',
        value: 'admin123'
      }
    });
  }

  // Seed default admin email if it doesn't exist
  const existingEmail = await prisma.setting.findUnique({
    where: { key: 'admin_email' }
  });
  if (!existingEmail) {
    await prisma.setting.create({
      data: {
        key: 'admin_email',
        value: 'asqu2020@gmail.com'
      }
    });
  }

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
