const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// =====================
// MIDDLEWARE
// =====================
app.use(cors({
  origin: ['https://pizza-block.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// =====================
// EMAIL CONFIG
// =====================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,  // ← Cambia a 587
  secure: false,  // ← Cambia a false
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.replace(/\s/g, ''),
  },
});

// Verificar conexión de email
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Error email:', error);
  } else {
    console.log('✅ Email configurado correctamente');
  }
});

// =====================
// TELEGRAM CONFIG
// =====================
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// =====================
// FUNCIONES
// =====================
async function enviarEmail(pedido) {
  const { cliente, pedido: items, total, envio } = pedido;

  let htmlContent = `
    <h2>🍕 NUEVO PEDIDO - PIZZA BLOCK</h2>
    
    <h3>👤 CLIENTE</h3>
    <p>
      <strong>Nombre:</strong> ${cliente.nombre} ${cliente.apellido}<br>
      <strong>Teléfono:</strong> ${cliente.telefono}<br>
      <strong>Email:</strong> ${cliente.email || 'N/A'}
    </p>

    <h3>📦 ENTREGA</h3>
    <p>
      <strong>Tipo:</strong> ${cliente.tipoEntrega === 'delivery' ? 'Delivery a domicilio' : 'Retiro en local'}<br>
  `;

  if (cliente.tipoEntrega === 'delivery') {
    htmlContent += `
      <strong>Dirección:</strong> ${cliente.calle} ${cliente.numero}<br>
      <strong>Entre calles:</strong> ${cliente.entrecalles || 'N/A'}<br>
    `;
  }

  htmlContent += `
      <strong>Método de pago:</strong> ${cliente.metodoPago === 'efectivo' ? 'Efectivo' : 'Mercado Pago'}
    </p>

    <h3>🛒 DETALLE DEL PEDIDO</h3>
    <table border="1" cellpadding="8" style="border-collapse: collapse;">
      <tr>
        <th>Producto</th>
        <th>Cantidad</th>
        <th>Precio Unit.</th>
        <th>Subtotal</th>
      </tr>
  `;

  items.forEach(item => {
    htmlContent += `
      <tr>
        <td>
          <strong>${item.nombre}</strong><br>
          ${item.tipoCarne ? `🥩 ${item.tipoCarne === 'carne' ? 'Carne' : 'Pollo'}<br>` : ''}
          ${item.extraPapas ? `🍟 Papas con ${item.extraPapas.nombre}<br>` : ''}
          ${item.ingredientes ? `🥗 ${item.ingredientes.join(', ')}` : ''}
        </td>
        <td>${item.cantidad}</td>
        <td>$${item.precio.toLocaleString('es-AR')}</td>
        <td>$${(item.precio * item.cantidad).toLocaleString('es-AR')}</td>
      </tr>
    `;
  });

  htmlContent += `
    </table>

    <h3>💰 RESUMEN</h3>
    <p>
      <strong>Subtotal:</strong> $${total.subtotal.toLocaleString('es-AR')}<br>
      <strong>Envío:</strong> ${envio > 0 ? '$' + envio.toLocaleString('es-AR') : 'GRATIS'}<br>
      <strong style="font-size: 18px;">TOTAL: $${total.total.toLocaleString('es-AR')}</strong>
    </p>
  `;

  await transporter.sendMail({
    from: `"Pizza Block" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `🍕 Nuevo Pedido - ${cliente.nombre} ${cliente.apellido} - $${total.total}`,
    html: htmlContent,
  });
}

async function enviarTelegram(pedido) {
  const { cliente, pedido: items, total, envio } = pedido;

  let mensaje = `🍕 *NUEVO PEDIDO - PIZZA BLOCK*\n\n`;
  mensaje += `👤 *CLIENTE*\n`;
  mensaje += `Nombre: ${cliente.nombre} ${cliente.apellido}\n`;
  mensaje += `📞 Tel: ${cliente.telefono}\n`;
  if (cliente.email) mensaje += `📧 Email: ${cliente.email}\n`;

  mensaje += `\n📦 *ENTREGA*\n`;
  mensaje += `Tipo: ${cliente.tipoEntrega === 'delivery' ? 'Delivery a domicilio' : 'Retiro en local'}\n`;

  if (cliente.tipoEntrega === 'delivery') {
    mensaje += `📍 Dirección: ${cliente.calle} ${cliente.numero}\n`;
    if (cliente.entrecalles) mensaje += `Entre: ${cliente.entrecalles}\n`;
  }

  mensaje += `💳 Pago: ${cliente.metodoPago === 'efectivo' ? 'Efectivo' : 'Mercado Pago'}\n`;

  mensaje += `\n🛒 *PEDIDO:*\n`;
  items.forEach((item, i) => {
    mensaje += `${i + 1}. ${item.nombre} x${item.cantidad}\n`;
    if (item.tipoCarne) mensaje += `   🥩 ${item.tipoCarne === 'carne' ? 'Carne' : 'Pollo'}\n`;
    if (item.extraPapas) mensaje += `   🍟 Papas con ${item.extraPapas.nombre}\n`;
    if (item.ingredientes?.length) mensaje += `   🥗 ${item.ingredientes.join(', ')}\n`;
  });

  mensaje += `\n💰 *RESUMEN*\n`;
  mensaje += `Subtotal: $${total.subtotal.toLocaleString('es-AR')}\n`;
  mensaje += `Envío: ${envio > 0 ? '$' + envio.toLocaleString('es-AR') : 'GRATIS'}\n`;
  mensaje += `*TOTAL: $${total.total.toLocaleString('es-AR')}*`;

  await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, mensaje, { parse_mode: 'Markdown' });
}

// =====================
// RUTAS
// =====================
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pizza Block API funcionando',
    email: '✅',
    telegram: '✅'
  });
});

app.post('/api/pedido', async (req, res) => {
  try {
    const { cliente, pedido, total, envio, comprobante } = req.body;

    console.log('\n📦 Nuevo pedido:');
    console.log(`   Cliente: ${cliente.nombre} ${cliente.apellido}`);
    console.log(`   Total: $${total.total}`);

    // Enviar por Email
    try {
      await enviarEmail(req.body);
      console.log('✅ Email enviado');
    } catch (err) {
      console.error('❌ Error email:', err.message);
    }

    // Enviar por Telegram
    try {
      await enviarTelegram(req.body);
      console.log('✅ Telegram enviado');
    } catch (err) {
      console.error('❌ Error telegram:', err.message);
    }

    // Enviar comprobante si existe
    if (comprobante) {
      try {
        const base64Data = comprobante.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        await bot.sendPhoto(process.env.TELEGRAM_CHAT_ID, buffer, {
          caption: `💳 Comprobante de pago\nCliente: ${cliente.nombre} ${cliente.apellido}`
        });
        console.log('✅ Comprobante enviado a Telegram');
      } catch (err) {
        console.error('❌ Error comprobante:', err.message);
      }
    }

    console.log('✅ Pedido procesado\n');
    res.json({ success: true });

  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================
// SERVER
// =====================
app.listen(PORT, () => {
  console.log('\n==================================================');
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
  console.log('==================================================\n');
});