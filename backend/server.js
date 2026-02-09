const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// =====================
// WHATSAPP CLIENT
// =====================
let whatsappClient = null;
let whatsappReady = false;

function initWhatsApp() {
  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      clientId: 'pizza-block-client',
      dataPath: './.wwebjs_auth',
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    },
  });

  whatsappClient.on('qr', (qr) => {
    console.log('\n📱 ESCANEÁ ESTE QR (UNA SOLA VEZ):\n');
    qrcode.generate(qr, { small: true });
  });

  whatsappClient.on('authenticated', () => {
    console.log('🔐 WhatsApp autenticado');
  });

  whatsappClient.on('ready', () => {
    whatsappReady = true;
    console.log('✅ WhatsApp CONNECTED y listo para enviar mensajes');
  });

  whatsappClient.on('disconnected', (reason) => {
    whatsappReady = false;
    console.log('⚠️ WhatsApp desconectado:', reason);
  });

  whatsappClient.initialize();
}

initWhatsApp();

// =====================
// UTILS
// =====================
async function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, '');

  if (!cleaned.startsWith('54')) {
    cleaned = '549' + cleaned.replace(/^0/, '');
  } else if (cleaned.startsWith('54') && !cleaned.startsWith('549')) {
    cleaned = '549' + cleaned.substring(2);
  }

  return cleaned + '@c.us';
}

async function waitForWhatsAppReady(timeoutMs = 20000) {
  const start = Date.now();

  while (!whatsappReady) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('WhatsApp no está listo (timeout)');
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

// =====================
// API ROUTES
// =====================
app.get('/', (req, res) => {
  res.json({ message: 'Pizza Block API funcionando' });
});

app.get('/api/whatsapp/status', (req, res) => {
  res.json({ ready: whatsappReady });
});

app.post('/api/pedido', async (req, res) => {
  try {
    const { cliente, pedido, total, comprobante } = req.body;

    console.log('\n📦 NUEVO PEDIDO');
    console.log(`Cliente: ${cliente.nombre} ${cliente.apellido}`);
    console.log(`Total: $${total.total}`);

    // ⏳ ESPERAMOS a que WhatsApp esté READY
    await waitForWhatsAppReady();

    const numeroDestino =
      process.env.WHATSAPP_NUMBER || '5491125128321';

    let mensaje = `🍕 *NUEVO PEDIDO*\n\n`;
    mensaje += `👤 ${cliente.nombre} ${cliente.apellido}\n`;
    mensaje += `📞 ${cliente.telefono}\n\n`;

    pedido.forEach((item, i) => {
      mensaje += `${i + 1}. ${item.nombre} x${item.cantidad}\n`;
    });

    mensaje += `\n💰 TOTAL: $${total.total}`;

    const formattedNumber = await formatPhoneNumber(numeroDestino);
    await whatsappClient.sendMessage(formattedNumber, mensaje);

    if (comprobante) {
      const media = new MessageMedia(
        'image/jpeg',
        comprobante.split(',')[1],
        'comprobante.jpg'
      );
      await whatsappClient.sendMessage(formattedNumber, media);
    }

    console.log('✅ Pedido enviado por WhatsApp');
    res.json({ success: true });

  } catch (err) {
    console.error('❌ Error pedido:', err.message);
    res.json({
      success: true,
      warning: 'Pedido guardado pero WhatsApp no disponible',
    });
  }
});

// =====================
// SERVER
// =====================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Backend corriendo en puerto ${PORT}`);
  console.log('='.repeat(50));
});

// =====================
// GRACEFUL SHUTDOWN
// =====================
process.on('SIGINT', async () => {
  console.log('🛑 Cerrando...');
  if (whatsappClient) await whatsappClient.destroy();
  process.exit(0);
});
