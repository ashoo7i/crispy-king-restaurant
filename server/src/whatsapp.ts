export async function sendWhatsAppNotification(
  customerName: string,
  customerPhone: string,
  orderId: string,
  status: string
): Promise<void> {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;

  // Determine message content based on status
  let message = '';
  switch (status) {
    case 'PENDING':
      message = `مرحباً ${customerName}، تم استلام طلبك رقم *${orderId}* بنجاح وهو قيد المراجعة الآن. سنقوم بإشعارك عند بدء التحضير! 🍗❤️`;
      break;
    case 'PREPARING':
      message = `مرحباً ${customerName}، بدأنا في تحضير طلبك رقم *${orderId}* بشغف وعناية! 🍳🔥`;
      break;
    case 'OUT_FOR_DELIVERY':
      message = `مرحباً ${customerName}، طلبك رقم *${orderId}* في طريقه إليك الآن مع المندوب! 🛵💨`;
      break;
    case 'COMPLETED':
      message = `مرحباً ${customerName}، تم تسليم طلبك رقم *${orderId}* بالهناء والعافية! شكراً لتعاملك مع Ashoospy ❤️`;
      break;
    default:
      return;
  }

  if (!instanceId || !token) {
    console.log(`⚠️ [WHATSAPP MOCK]: No UltraMsg credentials configured. Message to ${customerPhone} for order ${orderId} (${status}): "${message}"`);
    return;
  }

  // Format phone number to international format (prepending 967 for Yemen if needed)
  let cleanedPhone = customerPhone.replace(/\D/g, '');
  if (cleanedPhone.startsWith('00')) {
    cleanedPhone = cleanedPhone.slice(2);
  }
  if (cleanedPhone.length === 9 && cleanedPhone.startsWith('7')) {
    cleanedPhone = '967' + cleanedPhone;
  } else if (cleanedPhone.length === 10 && cleanedPhone.startsWith('07')) {
    cleanedPhone = '967' + cleanedPhone.slice(1);
  }

  try {
    const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        token: token,
        to: cleanedPhone,
        body: message
      })
    });

    const result = await response.json();
    console.log(`✉️ [WHATSAPP SENT]: Sent to ${cleanedPhone} for order ${orderId}. Response:`, result);
  } catch (error) {
    console.error(`❌ [WHATSAPP ERROR]: Failed to send to ${cleanedPhone} for order ${orderId}:`, error);
  }
}
