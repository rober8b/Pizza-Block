const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de Telegram
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
const chatId = process.env.TELEGRAM_CHAT_ID;

// Configuración de Email (Nodemailer)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Pizza Block API (Telegram + Email) activa' });
});

// RUTA PARA RECIBIR PEDIDOS
app.post('/api/pedido', async (req, res) => {
  try {
    const { cliente, pedido, total, comprobante } = req.body;

    console.log('\n📦 NUEVO PEDIDO RECIBIDO');
    
    // 1. Formatear el mensaje para Telegram y Email
    let mensaje = `🍕 *NUEVO PEDIDO*\n\n`;
    mensaje += `👤 *Cliente:* ${cliente.nombre} ${cliente.apellido}\n`;
    mensaje += `📞 *Teléfono:* ${cliente.telefono}\n`;
    mensaje += `🏠 *Tipo:* ${cliente.tipoEntrega === 'delivery' ? `Delivery (${cliente.calle} ${cliente.numero})` : 'Retiro en local'}\n\n`;
    mensaje += `🛒 *Pedido:*\n`;
    
    pedido.forEach((item, i) => {
      mensaje += `- ${item.nombre} x${item.cantidad}\n`;
    });

    mensaje += `\n💰 *TOTAL:* $${total.total}\n`;
    mensaje += `💳 *Pago:* ${cliente.metodoPago}`;

    // 2. ENVÍO A TELEGRAM
    if (comprobante) {
      // Convertir el base64 del comprobante a Buffer para Telegram
      const buffer = Buffer.from(comprobante.split(',')[1], 'base64');
      await bot.sendPhoto(chatId, buffer, { caption: mensaje, parse_mode: 'Markdown' });
    } else {
      await bot.sendMessage(chatId, mensaje, { parse_mode: 'Markdown' });
    }
    console.log('✅ Telegram enviado');

    // 3. ENVÍO POR EMAIL
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Te llega a ti mismo
      subject: `🍕 Pedido de ${cliente.nombre} ${cliente.apellido}`,
      text: mensaje.replace(/\*/g, ''), // Quitamos asteriscos para el texto plano del mail
    };

    if (comprobante) {
      mailOptions.attachments = [{
        filename: 'comprobante.jpg',
        content: comprobante.split(',')[1],
        encoding: 'base64'
      }];
    }

    await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado');

    res.json({ success: true });

  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});