import { supabase } from '../lib/supabase'

/**
 * Uploads a receipt image to Supabase Storage.
 * Returns the public URL or null if no file provided.
 */
export async function uploadReceipt(file) {
  if (!file) return null

  const ext = file.name.split('.').pop()
  const filename = `receipt_${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('receipts')
    .upload(filename, file, { upsert: false })

  if (error) {
    console.error('Receipt upload error:', error)
    throw new Error('No se pudo subir el comprobante. Intenta de nuevo.')
  }

  const { data } = supabase.storage.from('receipts').getPublicUrl(filename)
  return data.publicUrl
}

/**
 * Inserts a new order into the orders table.
 * @param {Object} orderData - { customer_name, phone, address, products, total, payment_method, receipt_url }
 * @returns the inserted order row
 */
export async function createOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert([{ ...orderData, status: 'nuevo' }])
    .select()
    .single()

  if (error) {
    console.error('Order insert error:', error)
    throw new Error('No se pudo guardar el pedido. Intenta de nuevo.')
  }

  return data
}