/**
 * Cloudflare Worker Backend for Omnihub
 * Handles secure API operations (e.g., getting upload tokens, proxying Google Drive)
 * without exposing private keys to the client.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+/g, '/'); // Limpiar dobles barras (ej: //api/secure -> /api/secure)
    
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: getCorsHeaders() });
    }
    
    try {
      if (path === "/api/secure/drive-token") {
        return handleDriveToken(env);
      }
      
      if (path === "/api/secure/delete-files" && request.method === "POST") {
        return handleDeleteFiles(request, env);
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
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };
}

async function getDriveToken(env) {
  let tokenData;
  if (env.GOOGLE_DRIVE_CLIENT_ID && env.GOOGLE_DRIVE_CLIENT_SECRET && env.GOOGLE_DRIVE_REFRESH_TOKEN) {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `client_id=${env.GOOGLE_DRIVE_CLIENT_ID}&client_secret=${env.GOOGLE_DRIVE_CLIENT_SECRET}&refresh_token=${env.GOOGLE_DRIVE_REFRESH_TOKEN}&grant_type=refresh_token`
    });
    tokenData = await tokenRes.json();
  } else if (env.GOOGLE_DRIVE_CLIENT_EMAIL && env.GOOGLE_DRIVE_PRIVATE_KEY) {
    const clientEmail = env.GOOGLE_DRIVE_CLIENT_EMAIL;
    let privateKey = env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const pemContents = privateKey.substring(privateKey.indexOf("-----BEGIN PRIVATE KEY-----") + 27, privateKey.indexOf("-----END PRIVATE KEY-----")).replace(/\s/g, '');
    const binaryDer = str2ab(atob(pemContents));
    const key = await crypto.subtle.importKey("pkcs8", binaryDer, { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } }, false, ["sign"]);
    const header = encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;
    const payload = encodeBase64Url(JSON.stringify({ iss: clientEmail, scope: "https://www.googleapis.com/auth/drive.file", aud: "https://oauth2.googleapis.com/token", exp, iat }));
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
  }
  if (!tokenData?.access_token) throw new Error("Error obteniendo token interno para borrar en Drive");
  return tokenData.access_token;
}

async function handleDriveToken(env) {
  const token = await getDriveToken(env);
  return new Response(JSON.stringify({ token, folderId: env.GOOGLE_DRIVE_FOLDER_ID }), { headers: getCorsHeaders() });
}

async function handleDeleteFiles(request, env) {
  const body = await request.json();
  const { driveUrl, cloudinaryUrl, adminEmail, authorId } = body;
  let results = [];

  // Seguridad estricta anti-crackeo:
  if (adminEmail && env.ADMIN_EMAIL && adminEmail !== env.ADMIN_EMAIL) {
    return new Response(JSON.stringify({ error: "No eres el admin supremo. Intento de crackeo bloqueado." }), { status: 403, headers: getCorsHeaders() });
  }

  // 1. Borrar de Google Drive
  if (driveUrl && driveUrl.includes('drive.google.com')) {
    let driveId = null;
    try {
      if (driveUrl.includes('id=')) driveId = driveUrl.split('id=')[1];
      else if (driveUrl.includes('/d/')) driveId = driveUrl.split('/d/')[1].split('/')[0];
      
      if (driveId) {
        const token = await getDriveToken(env);
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${driveId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        results.push({ service: 'drive', id: driveId, status: res.ok ? 'deleted' : 'error' });
      }
    } catch(e) { results.push({ service: 'drive', error: e.message }); }
  }

  // 2. Borrar de Cloudinary
  if (cloudinaryUrl && cloudinaryUrl.includes('res.cloudinary.com')) {
    try {
      const parts = cloudinaryUrl.split('/');
      const filename = parts[parts.length - 1];
      const publicId = filename.split('.')[0]; // remueve la extension
      
      if (env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET && env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const strToSign = `public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
        
        // SHA-1
        const encoder = new TextEncoder();
        const data = encoder.encode(strToSign);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const form = new URLSearchParams();
        form.append("public_id", publicId);
        form.append("api_key", env.CLOUDINARY_API_KEY);
        form.append("timestamp", timestamp);
        form.append("signature", signature);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: form
        });
        const clData = await res.json();
        results.push({ service: 'cloudinary', id: publicId, status: clData.result });
      } else {
        results.push({ service: 'cloudinary', status: 'skipped (missing credentials)' });
      }
    } catch(e) { results.push({ service: 'cloudinary', error: e.message }); }
  }

  return new Response(JSON.stringify({ success: true, results }), { headers: getCorsHeaders() });
}

// Funciones utilitarias al final
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) bufView[i] = str.charCodeAt(i);
  return buf;
}

function encodeBase64Url(string) {
  return btoa(string).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
