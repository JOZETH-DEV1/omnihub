/**
 * Cloudflare Worker Backend for Omnihub
 * Handles secure API operations (e.g., getting upload tokens, proxying Google Drive)
 * without exposing private keys to the client.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: getCorsHeaders() });
    }
    
    try {
      if (url.pathname === "/api/secure/drive-token") {
        return handleDriveToken(env);
      }
      
      return new Response(JSON.stringify({ error: "Not found" }), { 
        status: 404,
        headers: getCorsHeaders()
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { 
        status: 500,
        headers: getCorsHeaders()
      });
    }
  },
};

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };
}

// Convierte Base64 a Uint8Array
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function encodeBase64Url(string) {
  return btoa(string).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function handleDriveToken(env) {
  const clientEmail = env.DRIVE_CLIENT_EMAIL;
  let privateKey = env.DRIVE_PRIVATE_KEY;
  const folderId = env.DRIVE_FOLDER_ID;

  if (!clientEmail || !privateKey) {
    throw new Error("Faltan credenciales de Google Drive en el Worker (DRIVE_CLIENT_EMAIL o DRIVE_PRIVATE_KEY)");
  }

  // Limpiar llave privada de escapes
  privateKey = privateKey.replace(/\\n/g, '\n');
  
  // Extraer contenido base64 del PEM
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKey.substring(
    privateKey.indexOf(pemHeader) + pemHeader.length,
    privateKey.indexOf(pemFooter)
  ).replace(/\s/g, '');

  const binaryDerString = atob(pemContents);
  const binaryDer = str2ab(binaryDerString);

  // Importar llave para RS256
  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );

  const header = encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  
  const payload = encodeBase64Url(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    exp: exp,
    iat: iat
  }));

  const signatureInput = `${header}.${payload}`;
  const signatureInputBuffer = new TextEncoder().encode(signatureInput);

  const signatureBuffer = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    signatureInputBuffer
  );

  const signature = encodeBase64Url(String.fromCharCode(...new Uint8Array(signatureBuffer)));
  const jwt = `${signatureInput}.${signature}`;

  // Intercambiar JWT por Access Token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    throw new Error("Error al obtener token de Google: " + JSON.stringify(tokenData));
  }

  return new Response(JSON.stringify({ 
    token: tokenData.access_token,
    folderId: folderId // Opcional, para mandarlo al frontend
  }), {
    headers: getCorsHeaders()
  });
}
