/**
 * Cliente para conectar el Frontend (Next.js) con el Backend (Cloudflare Worker)
 */

// La URL de tu worker se leerá de las variables de entorno de Pages
// Si no está configurada, usará un fallback local por defecto
const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://omnihub-worker.TU_SUBDOMINIO.workers.dev";

export const omnihubApi = {
  /**
   * Obtiene la firma segura de Cloudinary desde el Worker.
   */
  async getCloudinarySignature() {
    try {
      const response = await fetch(`${WORKER_URL}/api/secure/upload-signature`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al comunicarse con el Worker");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en API:", error);
      throw error;
    }
  },

  /**
   * Pide permiso/token al Worker para subir archivos grandes a Google Drive
   */
  async getDriveUploadToken(fileMetadata: any) {
    try {
      const response = await fetch(`${WORKER_URL}/api/secure/drive-upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fileMetadata),
      });

      if (!response.ok) {
        throw new Error("Fallo en la comunicación con el backend (Drive)");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en API:", error);
      throw error;
    }
  }
};
