const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumentar límite para imágenes base64
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================
// CONFIGURACIÓN DE WHATSAPP
// ============================================

let whatsappClient;
let isWhatsAppReady = false;

// Inicializar cliente de WhatsApp
console.log('🔄 Inicializando WhatsApp Web...');

whatsappClient = new Client({
  authStrategy: new LocalAuth({
    clientId: 'pizza-block-client',
    dataPath: './.wwebjs_auth'
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

// Evento: QR Code generado (solo la primera vez)
whatsappClient.on('qr', (qr) => {
  console.log('\n📱 ESCANEA ESTE QR CON TU WHATSAPP:\n');
  qrcode.generate(qr, { small: true });
  console.log('\n👆 Abre WhatsApp > Dispositivos vinculados > Vincular dispositivo\n');
});

// Evento: Cliente autenticado
whatsappClient.on('authenticated', () => {
  console.log('✅ WhatsApp autenticado correctamente');
});

// Evento: Cliente listo
whatsappClient.on('ready', () => {
  console.log('✅ WhatsApp Web listo para enviar mensajes');
  isWhatsAppReady = true;
});

// Evento: Desconexión
whatsappClient.on('disconnected', (reason) => {
  console.log('⚠️ WhatsApp desconectado:', reason);
  isWhatsAppReady = false;
  
  // Intentar reconectar después de 5 segundos
  console.log('🔄 Intentando reconectar en 5 segundos...');
  setTimeout(() => {
    whatsappClient.initialize().catch(err => {
      console.error('❌ Error al reconectar:', err);
    });
  }, 5000);
});

// Evento: Error de autenticación
whatsappClient.on('auth_failure', (msg) => {
  console.error('❌ Error de autenticación:', msg);
  isWhatsAppReady = false;
});

// Evento: Error general
whatsappClient.on('error', (error) => {
  console.error('❌ Error de WhatsApp:', error);
});

// Evento: Loading screen
whatsappClient.on('loading_screen', (percent, message) => {
  console.log(`⏳ Cargando WhatsApp: ${percent}% - ${message}`);
});

// Inicializar WhatsApp con manejo de errores
whatsappClient.initialize().catch(err => {
  console.error('❌ Error al inicializar WhatsApp:', err);
  console.log('\n💡 Intenta eliminar la carpeta .wwebjs_auth y reiniciar\n');
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Formatear número de teléfono para WhatsApp
async function formatPhoneNumber(phone) {
  // Eliminar todo excepto números
  let cleaned = phone.replace(/\D/g, '');
  
  console.log('📞 Número original:', phone);
  console.log('📞 Número limpio:', cleaned);
  
  // Formato Argentina: 549 + código área + número
  if (!cleaned.startsWith('54')) {
    if (cleaned.startsWith('9')) {
      // Ya tiene el 9, agregar 54
      cleaned = '54' + cleaned;
    } else if (cleaned.startsWith('11') || cleaned.startsWith('351')) {
      // Código de área sin 0, agregar 549
      cleaned = '549' + cleaned;
    } else if (cleaned.startsWith('0')) {
      // Tiene 0 inicial, quitarlo y agregar 549
      cleaned = '549' + cleaned.substring(1);
    } else {
      // Caso genérico
      cleaned = '549' + cleaned;
    }
  } else if (cleaned.startsWith('54') && !cleaned.startsWith('549')) {
    // Tiene 54 pero no el 9
    cleaned = '54' + '9' + cleaned.substring(2);
  }
  
  console.log('📞 Número formateado:', cleaned);
  
  // Verificar si el número existe en WhatsApp
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

// Enviar mensaje de WhatsApp
async function sendWhatsAppMessage(phoneNumber, message) {
  if (!isWhatsAppReady) {
    throw new Error('WhatsApp no está listo. Por favor, escanea el QR code.');
  }

  try {
    const formattedNumber = await formatPhoneNumber(phoneNumber);
    console.log('📤 Enviando mensaje a:', formattedNumber);
    
    // Verificar que el cliente sigue conectado
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

// Enviar imagen de WhatsApp
async function sendWhatsAppImage(phoneNumber, base64Image, caption) {
  if (!isWhatsAppReady) {
    throw new Error('WhatsApp no está listo. Por favor, escanea el QR code.');
  }

  try {
    const formattedNumber = await formatPhoneNumber(phoneNumber);
    console.log('📤 Enviando imagen a:', formattedNumber);
    
    // Verificar que el cliente sigue conectado
    const state = await whatsappClient.getState();
    
    if (state !== 'CONNECTED') {
      throw new Error('WhatsApp no está conectado. Estado actual: ' + state);
    }
    
    // Crear media desde base64
    const media = new MessageMedia(
      'image/jpeg', // Tipo MIME
      base64Image.split(',')[1] || base64Image, // Remover el prefijo data:image/...;base64, si existe
      'comprobante_pago.jpg' // Nombre del archivo
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

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pizza Block API funcionando',
    whatsappStatus: isWhatsAppReady ? 'Conectado' : 'Desconectado'
  });
});

// Verificar estado de WhatsApp
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
    
    // Valores seguros
    const email = cliente.email?.trim() ? cliente.email : 'N/A';
    const entrecalles = cliente.entrecalles?.trim() ? cliente.entrecalles : 'N/A';
    const tipoEntrega = cliente.tipoEntrega === 'delivery' ? 'Delivery a domicilio' : 'Retiro en local';

    console.log('\n📦 Nuevo pedido recibido:');
    console.log(`   Cliente: ${cliente.nombre} ${cliente.apellido}`);
    console.log(`   Total: $${total.total.toLocaleString('es-AR')}`);
    console.log(`   Items: ${pedido.length}`);
    console.log(`   Método de pago: ${cliente.metodoPago}`);
    console.log(`   Comprobante: ${comprobante ? 'SÍ' : 'NO'}`);

    // Formatear mensaje para WhatsApp con configuraciones detalladas
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

    mensaje += `   💳 Pago: ${
      cliente.metodoPago === 'efectivo' ? 'Efectivo' : 'Mercado Pago'
    }\n`;
    
    if (comprobante) {
      mensaje += `   ✅ *Comprobante adjunto*\n`;
    }
    
    mensaje += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `🛒 *DETALLE DEL PEDIDO*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    pedido.forEach((item, index) => {
      mensaje += `${index + 1}. *${item.nombre}*\n`;
      mensaje += `   📂 Categoría: ${item.categoria}\n`;
      
      // Mostrar configuraciones detalladas
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

    // Enviar mensaje a tu número de WhatsApp
    const tuNumero = process.env.WHATSAPP_NUMBER || '541171910505';
    
    try {
      // Enviar el mensaje del pedido
      await sendWhatsAppMessage(tuNumero, mensaje);
      
      // Si hay comprobante, enviarlo como imagen
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
      
      // Guardar pedido aunque falle WhatsApp
      console.log('⚠️ Pedido guardado pero no se pudo enviar por WhatsApp');
      
      res.status(200).json({ 
        success: true, 
        message: 'Pedido recibido pero hubo un problema al enviar WhatsApp. Revisa la consola.',
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
  if (whatsappClient) {
    await whatsappClient.destroy();
  }
  process.exit(0);
});