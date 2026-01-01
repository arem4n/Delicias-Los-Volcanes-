
/*************************************************************
 * CONSTANTES Y CONFIGURACIÓN
 *************************************************************/
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const PRODUCTOS_SHEET_NAME = "Productos";
const PEDIDOS_SHEET_NAME = "Pedidos";
const ADMIN_EMAIL_ADDRESS = "admin@delicias.cl";

/*************************************************************
 * AUTENTICACIÓN Y AUTORIZACIÓN
 *************************************************************/
function getAuthenticatedUser(token) {
  if (!token) throw new Error("Acceso denegado: No se proporcionó token.");
  try {
    const response = UrlFetchApp.fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    const payload = JSON.parse(response.getContentText());
    if (payload.aud !== Session.getScriptId()) throw new Error("Acceso denegado: Token no válido.");
    return {
      email: payload.email,
      nombre: payload.name,
      isAdmin: payload.email.toLowerCase() === ADMIN_EMAIL_ADDRESS.toLowerCase()
    };
  } catch (e) {
    throw new Error(`Acceso denegado: ${e.message}`);
  }
}

/*************************************************************
 * HELPERS
 *************************************************************/
const getSheetData = (sheetName) => {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return { sheet, data, headers };
};

const rowsToObjects = (headers, rows) => {
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => obj[header] = row[i]);
    return obj;
  });
};

/*************************************************************
 * LÓGICA DE NEGOCIO (API)
 *************************************************************/
const API = {
  // --- Acciones Públicas ---
  getProducts: () => {
    const { data, headers } = getSheetData(PRODUCTOS_SHEET_NAME);
    return rowsToObjects(headers, data).filter(p => p.stock > 0 && p.nombre);
  },

  // --- Acciones de Usuario Autenticado ---
  createOrder: (data, user) => {
    const { items, total } = data;
    if (!items || !Array.isArray(items) || items.length === 0 || typeof total !== 'number') {
      throw new Error("Datos del pedido no válidos.");
    }
    const { sheet } = getSheetData(PEDIDOS_SHEET_NAME);
    const orderId = "ORD-" + Utilities.getUuid();
    sheet.appendRow([new Date(), orderId, user.nombre, user.email, JSON.stringify(items), total, "Pendiente"]);
    return { status: "success", message: "Pedido creado", orderId };
  },

  getOrders: (data, user) => {
    const { data, headers } = getSheetData(PEDIDOS_SHEET_NAME);
    const emailIndex = headers.indexOf("cliente_email");
    const userOrders = data.filter(row => row[emailIndex] === user.email);
    return rowsToObjects(headers, userOrders);
  },
  
  // --- Acciones de Administrador ---
  getAllOrders: (data, user) => {
    if (!user.isAdmin) throw new Error("Acceso denegado.");
    const { data, headers } = getSheetData(PEDIDOS_SHEET_NAME);
    return rowsToObjects(headers, data);
  },

  updateOrderStatus: (data, user) => {
    if (!user.isAdmin) throw new Error("Acceso denegado.");
    const { orderId, status } = data;
    if (!orderId || !status) throw new Error("Datos no válidos.");

    const { sheet, data: rows, headers } = getSheetData(PEDIDOS_SHEET_NAME);
    const idIndex = headers.indexOf("id_pedido");
    const statusIndex = headers.indexOf("estado");
    const rowIndex = rows.findIndex(row => row[idIndex] == orderId);

    if (rowIndex === -1) throw new Error("Pedido no encontrado.");
    sheet.getRange(rowIndex + 2, statusIndex + 1).setValue(status);
    return { status: "success", message: "Estado del pedido actualizado." };
  },

  saveProduct: (data, user) => {
    if (!user.isAdmin) throw new Error("Acceso denegado.");
    const { product } = data;
    if (!product || !product.nombre) throw new Error("Datos de producto no válidos.");
    
    const { sheet, data: rows, headers } = getSheetData(PRODUCTOS_SHEET_NAME);
    const idIndex = headers.indexOf("id");

    if (product.id) { // Actualizar producto existente
      const rowIndex = rows.findIndex(row => row[idIndex] == product.id);
      if (rowIndex === -1) throw new Error("Producto no encontrado para actualizar.");
      const values = headers.map(header => product[header] || "");
      sheet.getRange(rowIndex + 2, 1, 1, headers.length).setValues([values]);
      return { status: "success", message: "Producto actualizado." };
    } else { // Crear nuevo producto
      const newId = "PROD-" + Utilities.getUuid();
      product.id = newId;
      const values = headers.map(header => product[header] || "");
      sheet.appendRow(values);
      return { status: "success", message: "Producto creado.", newId };
    }
  },

  deleteProduct: (data, user) => {
    if (!user.isAdmin) throw new Error("Acceso denegado.");
    const { productId } = data;
    if (!productId) throw new Error("ID de producto no válido.");

    const { sheet, data: rows, headers } = getSheetData(PRODUCTOS_SHEET_NAME);
    const idIndex = headers.indexOf("id");
    const rowIndex = rows.findIndex(row => row[idIndex] == productId);

    if (rowIndex === -1) throw new Error("Producto no encontrado para eliminar.");
    sheet.deleteRow(rowIndex + 2);
    return { status: "success", message: "Producto eliminado." };
  }
};

/*************************************************************
 * ENRUTADOR PRINCIPAL
 *************************************************************/
const handleRequest = (e) => {
  try {
    const action = e.parameter.action || (e.postData && JSON.parse(e.postData.contents).action);
    const data = e.postData ? JSON.parse(e.postData.contents) : {};
    
    if (action === "getProducts") {
      return API.getProducts();
    }
    
    const user = getAuthenticatedUser(data.token);
    if (API[action]) {
      return API[action](data, user);
    } else {
      throw new Error("Acción no válida.");
    }
  } catch (error) {
    return { status: "error", message: `Error del servidor: ${error.message}` };
  }
};

function doGet(e) {
  const response = handleRequest(e);
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const response = handleRequest(e);
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}
