import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const newPasscode = process.argv[2];
  if (!newPasscode) {
    console.error('⚠️ يرجى تحديد رمز المرور الجديد! مثال:');
    console.error('npm run reset-passcode newPassword123');
    process.exit(1);
  }

  await prisma.setting.upsert({
    where: { key: 'admin_passcode' },
    update: { value: newPasscode },
    create: { key: 'admin_passcode', value: newPasscode }
  });

  console.log(`\n✅ تم إعادة تعيين رمز مرور الإدارة بنجاح إلى: ${newPasscode}\n`);
}

main()
  .catch((e) => {
    console.error('❌ حدث خطأ أثناء إعادة التعيين:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
