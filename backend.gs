
/**
 * BACKEND: Google Apps Script (GAS)
 * Copia este código en un nuevo proyecto de Google Apps Script (script.google.com)
 * Asegúrate de tener las pestañas "Productos" y "Pedidos" en tu Google Sheet.
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const OWNER_EMAIL = "tu-email@ejemplo.com"; // CAMBIAR POR TU EMAIL

function doGet(e) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Productos");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  const products = rows.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(products))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Pedidos");
    
    const pedidoId = "ORD-" + Math.floor(Math.random() * 1000000);
    const fecha = new Date();
    
    // Columnas: fecha, id_pedido, cliente_nombre, cliente_email, direccion, detalle_json, total, estado
    sheet.appendRow([
      fecha,
      pedidoId,
      data.cliente_nombre,
      data.cliente_email,
      data.direccion,
      data.detalle_json,
      data.total,
      "Pendiente"
    ]);
    
    // Enviar Email al dueño
    sendOrderEmail(data, pedidoId);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Pedido recibido correctamente",
      id: pedidoId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendOrderEmail(order, id) {
  const items = JSON.parse(order.detalle_json);
  let tableRows = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.nombre}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.precio * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const htmlBody = `
    <div style="font-family: sans-serif; color: #1C1917; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
      <h2 style="color: #EA580C; font-size: 24px;">¡Nuevo Pedido Recibido!</h2>
      <p><strong>ID de Pedido:</strong> ${id}</p>
      <p><strong>Cliente:</strong> ${order.cliente_nombre} (${order.cliente_email})</p>
      <p><strong>Dirección:</strong> ${order.direccion}</p>
      <p><strong>Notas:</strong> ${order.notas || 'Sin notas'}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #FAFAF9;">
            <th style="text-align: left; padding: 10px;">Producto</th>
            <th style="text-align: center; padding: 10px;">Cant.</th>
            <th style="text-align: right; padding: 10px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">TOTAL:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #EA580C;">$${order.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">Enviado desde Delicias Los Volcanes App</p>
    </div>
  `;
  
  GmailApp.sendEmail(OWNER_EMAIL, "Nuevo Pedido: " + id, "", {
    htmlBody: htmlBody
  });
}
