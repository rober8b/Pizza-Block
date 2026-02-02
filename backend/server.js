const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Client, MessageMedia, RemoteAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================
// MONGODB - Guardar sesión de WhatsApp
// ============================================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error conectando MongoDB:', err));

// Schema para guardar la sesión de WhatsApp
const sessionSchema = new mongoose.Schema({
  _id: String,
  session: String
});
const Session = mongoose.model('Session', sessionSchema);

// Clase para persistir la sesión en MongoDB en lugar de en disco
class MongoStore {
  constructor() {
    this.sessionName = 'pizza-block-session';
  }

  async save(session) {
    try {
      await Session.findOneAndUpdate(
        { _id: this.sessionName },
        { session: session },
        { upsert: true }
      );
      console.log('💾 Sesión de WhatsApp guardada en MongoDB');
    } catch (error) {
      console.error('❌ Error guardando sesión:', error);
    }
  }

  async extract() {
    try {
      const doc = await Session.findById(this.sessionName);
      if (doc) {
        console.log('📂 Sesión de WhatsApp recuperada de MongoDB');
        return doc.session;
      }
      return null;
    } catch (error) {
      console.error('❌ Error extrayendo sesión:', error);
      return null;
    }
  }

  async delete() {
    try {
      await Session.findByIdAndDelete(this.sessionName);
      console.log('🗑️ Sesión de WhatsApp eliminada de MongoDB');
    } catch (error) {
      console.error('❌ Error eliminando sesión:', error);
    }
  }
}

// ============================================
// CONFIGURACIÓN DE WHATSAPP
// ============================================

let whatsappClient;
let isWhatsAppReady = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function createWhatsAppClient() {
  whatsappClient = new Client({
    authStrategy: new RemoteAuth({
      store: new MongoStore(),
      clientId: 'pizza-block-client',
      backupSyncIntervalMs: 60000
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ],
      timeout: 60000
    },
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
  });

  // Evento: QR Code generado
  whatsappClient.on('qr', (qr) => {
    console.log('\n📱 ESCANEA ESTE QR CON TU WHATSAPP:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n👆 Abre WhatsApp > Dispositivos vinculados > Vincular dispositivo\n');
  });

  whatsappClient.on('authenticated', () => {
    console.log('✅ WhatsApp autenticado correctamente');
    reconnectAttempts = 0;
  });

  whatsappClient.on('ready', () => {
    console.log('✅ WhatsApp Web listo para enviar mensajes');
    isWhatsAppReady = true;
    reconnectAttempts = 0;
  });

  // Evento clave: cuando la sesión se guarda exitosamente
  whatsappClient.on('remote_session_saved', () => {
    console.log('💾 Sesión guardada exitosamente en MongoDB');
  });

  whatsappClient.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp desconectado:', reason);
    isWhatsAppReady = false;
    reconnect();
  });

  whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
    isWhatsAppReady = false;
  });

  whatsappClient.on('error', (error) => {
    console.error('❌ Error de WhatsApp:', error);
  });

  whatsappClient.on('loading_screen', (percent, message) => {
    console.log(`⏳ Cargando WhatsApp: ${percent}% - ${message}`);
  });
}

// Función de reconexión con límite de intentos
async function reconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('❌ Se alcanzó el límite de intentos de reconexión');
    return;
  }

  reconnectAttempts++;
  const delay = reconnectAttempts * 5000; // Incrementa el tiempo de espera cada intento

  console.log(`🔄 Intento de reconexión ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} en ${delay / 1000}s...`);

  setTimeout(async () => {
    try {
      if (whatsappClient) {
        await whatsappClient.destroy();
      }
      createWhatsAppClient();
      await whatsappClient.initialize();
    } catch (err) {
      console.error('❌ Error al reconectar:', err);
      reconnect(); // Intentar de nuevo
    }
  }, delay);
}

// Inicializar
console.log('🔄 Inicializando WhatsApp Web...');
createWhatsAppClient();
whatsappClient.initialize().catch(err => {
  console.error('❌ Error al inicializar WhatsApp:', err);
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

async function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, '');

  console.log('📞 Número original:', phone);
  console.log('📞 Número limpio:', cleaned);

  if (!cleaned.startsWith('54')) {
    if (cleaned.startsWith('9')) {
      cleaned = '54' + cleaned;
    } else if (cleaned.startsWith('11') || cleaned.startsWith('351')) {
      cleaned = '549' + cleaned;
    } else if (cleaned.startsWith('0')) {
      cleaned = '549' + cleaned.substring(1);
    } else {
      cleaned = '549' + cleaned;
    }
  } else if (cleaned.startsWith('54') && !cleaned.startsWith('549')) {
    cleaned = '54' + '9' + cleaned.substring(2);
  }

  console.log('📞 Número formateado:', cleaned);

  try {
    const numberId = await whatsappClient.getNumberId(cleaned);
    if (numberId) {
      console.log('✅ Número verificado en WhatsApp:', numberId._serialized);
      return numberId._serialized;
    } else {
      console.log('⚠️ Número no encontrado en WhatsApp, usando formato estándar');
      return cleaned + '@c.us';
    }
  } catch (error) {
    console.log('⚠️ Error al verificar número, usando formato estándar');
    return cleaned + '@c.us';
  }
}

async function sendWhatsAppMessage(phoneNumber, message) {
  if (!isWhatsAppReady) {
    throw new Error('WhatsApp no está listo. Por favor, escanea el QR code.');
  }

  try {
    const formattedNumber = await formatPhoneNumber(phoneNumber);
    console.log('📤 Enviando mensaje a:', formattedNumber);

    const state = await whatsappClient.getState();
    console.log('📡 Estado de WhatsApp:', state);

    if (state !== 'CONNECTED') {
      throw new Error('WhatsApp no está conectado. Estado actual: ' + state);
    }

    await whatsappClient.sendMessage(formattedNumber, message);
    console.log('✅ Mensaje enviado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error.message);
    throw error;
  }
}

async function sendWhatsAppImage(phoneNumber, base64Image, caption) {
  if (!isWhatsAppReady) {
    throw new Error('WhatsApp no está listo. Por favor, escanea el QR code.');
  }

  try {
    const formattedNumber = await formatPhoneNumber(phoneNumber);
    console.log('📤 Enviando imagen a:', formattedNumber);

    const state = await whatsappClient.getState();
    if (state !== 'CONNECTED') {
      throw new Error('WhatsApp no está conectado. Estado actual: ' + state);
    }

    const media = new MessageMedia(
      'image/jpeg',
      base64Image.split(',')[1] || base64Image,
      'comprobante_pago.jpg'
    );

    await whatsappClient.sendMessage(formattedNumber, media, { caption: caption });
    console.log('✅ Imagen enviada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al enviar imagen:', error.message);
    throw error;
  }
}

// ============================================
// RUTAS DE LA API
// ============================================

// Health check - Railway lo usa para saber si el server está vivo
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    whatsapp: isWhatsAppReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Pizza Block API funcionando',
    whatsappStatus: isWhatsAppReady ? 'Conectado' : 'Desconectado'
  });
});

app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    ready: isWhatsAppReady,
    status: isWhatsAppReady ? 'Conectado y listo' : 'Esperando conexión'
  });
});

// Endpoint para recibir pedidos
app.post('/api/pedido', async (req, res) => {
  try {
    const { cliente, pedido, total, envio, comprobante } = req.body;

    const email = cliente.email?.trim() ? cliente.email : 'N/A';
    const entrecalles = cliente.entrecalles?.trim() ? cliente.entrecalles : 'N/A';
    const tipoEntrega = cliente.tipoEntrega === 'delivery' ? 'Delivery a domicilio' : 'Retiro en local';

    console.log('\n📦 Nuevo pedido recibido:');
    console.log(`   Cliente: ${cliente.nombre} ${cliente.apellido}`);
    console.log(`   Total: $${total.total.toLocaleString('es-AR')}`);
    console.log(`   Items: ${pedido.length}`);
    console.log(`   Método de pago: ${cliente.metodoPago}`);
    console.log(`   Comprobante: ${comprobante ? 'SÍ' : 'NO'}`);

    // Formatear mensaje para WhatsApp
    let mensaje = `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `🍕 *NUEVO PEDIDO - PIZZA BLOCK*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    mensaje += `👤 *CLIENTE*\n`;
    mensaje += `   Nombre: ${cliente.nombre} ${cliente.apellido}\n`;
    mensaje += `   📞 Tel: ${cliente.telefono}\n`;
    mensaje += `   📧 Email: ${email}\n\n`;

    mensaje += `📦 *ENTREGA*\n`;
    mensaje += `   Tipo: ${tipoEntrega}\n`;

    if (cliente.tipoEntrega === 'delivery') {
      mensaje += `   📍 Dirección: ${cliente.calle} ${cliente.numero}\n`;
      mensaje += `   🚦 Entrecalles: ${entrecalles}\n`;
    } else {
      mensaje += `   🏬 Retiro en: Av. Ejemplo 1234, Buenos Aires\n`;
    }

    mensaje += `   💳 Pago: ${cliente.metodoPago === 'efectivo' ? 'Efectivo' : 'Mercado Pago'}\n`;

    if (comprobante) {
      mensaje += `   ✅ *Comprobante adjunto*\n`;
    }

    mensaje += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `🛒 *DETALLE DEL PEDIDO*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    pedido.forEach((item, index) => {
      mensaje += `${index + 1}. *${item.nombre}*\n`;
      mensaje += `   📂 Categoría: ${item.categoria}\n`;

      if (item.tipoCarne) {
        mensaje += `   🥩 Tipo: ${item.tipoCarne === 'carne' ? 'Carne' : 'Pollo'}\n`;
      }

      if (item.extraPapas) {
        mensaje += `   🍟 Papas con: ${item.extraPapas.nombre}\n`;
      } else if (item.categoria === 'Milanesas') {
        mensaje += `   🍟 Papas incluidas (sin extra)\n`;
      }

      if (item.ingredientes && item.ingredientes.length > 0) {
        mensaje += `   🥗 Ingredientes: ${item.ingredientes.join(', ')}\n`;
      }

      mensaje += `   📊 Cantidad: ${item.cantidad}\n`;
      mensaje += `   💵 Precio unitario: $${item.precio.toLocaleString('es-AR')}\n`;
      mensaje += `   💰 Subtotal: $${(item.precio * item.cantidad).toLocaleString('es-AR')}\n\n`;
    });

    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `💵 *RESUMEN*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `   Subtotal: $${total.subtotal.toLocaleString('es-AR')}\n`;

    if (envio > 0) {
      mensaje += `   Envío: $${envio.toLocaleString('es-AR')}\n`;
    } else {
      mensaje += `   Envío: GRATIS 🎉\n`;
    }

    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `💰 *TOTAL: $${total.total.toLocaleString('es-AR')}*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━━`;

    const tuNumero = process.env.WHATSAPP_NUMBER || '541125128321';

    try {
      await sendWhatsAppMessage(tuNumero, mensaje);

      if (comprobante) {
        console.log('📸 Enviando comprobante de pago...');
        const caption = `💳 *COMPROBANTE DE PAGO*\n\nCliente: ${cliente.nombre} ${cliente.apellido}\nTotal: $${total.total.toLocaleString('es-AR')}`;
        await sendWhatsAppImage(tuNumero, comprobante, caption);
        console.log('✅ Comprobante enviado exitosamente');
      }

      console.log('✅ Pedido procesado y enviado por WhatsApp\n');

      res.status(200).json({
        success: true,
        message: 'Pedido recibido y enviado por WhatsApp',
        orderId: Date.now()
      });

    } catch (whatsappError) {
      console.error('❌ Error al enviar WhatsApp:', whatsappError);
      console.log('⚠️ Pedido guardado pero no se pudo enviar por WhatsApp');

      res.status(200).json({
        success: true,
        message: 'Pedido recibido pero hubo un problema al enviar WhatsApp.',
        orderId: Date.now(),
        warning: 'WhatsApp no disponible'
      });
    }

  } catch (error) {
    console.error('❌ Error al procesar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el pedido',
      error: error.message
    });
  }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📱 WhatsApp: ${isWhatsAppReady ? '✅ Conectado' : '⏳ Conectando...'}`);
  console.log(`${'='.repeat(50)}\n`);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  if (whatsappClient) await whatsappClient.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor (SIGTERM)...');
  if (whatsappClient) await whatsappClient.destroy();
  process.exit(0);
});

// Manejo de errores globales para que el proceso no muera
process.on('uncaughtException', (err) => {
  console.error('⚠️ Excepción no capturada:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('⚠️ Promesa rechazada sin manejar:', err);
});