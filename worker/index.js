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
  const folderId = env.GOOGLE_DRIVE_FOLDER_ID;
  let tokenData;

  // MÉTODO 1: OAuth 2.0 con Refresh Token (Client ID + Client Secret)
  if (env.GOOGLE_DRIVE_CLIENT_ID && env.GOOGLE_DRIVE_CLIENT_SECRET && env.GOOGLE_DRIVE_REFRESH_TOKEN) {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `client_id=${env.GOOGLE_DRIVE_CLIENT_ID}&client_secret=${env.GOOGLE_DRIVE_CLIENT_SECRET}&refresh_token=${env.GOOGLE_DRIVE_REFRESH_TOKEN}&grant_type=refresh_token`
    });
    tokenData = await tokenRes.json();
  } 
  // MÉTODO 2: Service Account (Email + Private Key)
  else if (env.GOOGLE_DRIVE_CLIENT_EMAIL && env.GOOGLE_DRIVE_PRIVATE_KEY) {
    const clientEmail = env.GOOGLE_DRIVE_CLIENT_EMAIL;
    let privateKey = env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    if (!privateKey.includes(pemHeader)) throw new Error("La Private Key es inválida.");
    
    const pemContents = privateKey.substring(
      privateKey.indexOf(pemHeader) + pemHeader.length,
      privateKey.indexOf(pemFooter)
    ).replace(/\s/g, '');

    const binaryDer = str2ab(atob(pemContents));
    const key = await crypto.subtle.importKey(
      "pkcs8", binaryDer, { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } }, false, ["sign"]
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
    const signatureBuffer = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signatureInput));
    const signature = encodeBase64Url(String.fromCharCode(...new Uint8Array(signatureBuffer)));
    const jwt = `${signatureInput}.${signature}`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
    });
    tokenData = await tokenRes.json();
  } else {
    throw new Error("Faltan credenciales de Google Drive en el Worker. Configura (CLIENT_ID, SECRET y REFRESH_TOKEN) o (CLIENT_EMAIL y PRIVATE_KEY).");
  }

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
