export function getPublicIdFromCloudinaryUrl(url) {
  try {
    const u = new URL(url);
    // Debe contener /upload/ en la ruta
    const match = u.pathname.match(/\/upload\/(.+)$/);
    if (!match) return null;

    // Lo que viene después de /upload/
    // Ej: "c_fill,w_300,h_300/v1700000/uploads/publications/archivo.jpg"
    const afterUpload = match[1].split("/");

    // Quitar transformaciones y detectar si hay versión v<digits>
    const verIdx = afterUpload.findIndex((seg) => /^v\d+$/i.test(seg));

    // Partes que componen el public_id: carpeta/archivo.ext
    const publicParts =
      verIdx >= 0 ? afterUpload.slice(verIdx + 1) : afterUpload;

    if (!publicParts.length) return null;

    // Quitar extensión final (.jpg, .png, .webp, etc.)
    const joined = publicParts.join("/"); // "uploads/publications/archivo.jpg"
    const publicId = joined.replace(/\.[^/.]+$/, ""); // "uploads/publications/archivo"

    return publicId || null;
  } catch {
    return null;
  }
}

export function isCloudinaryUrl(url, cloudName) {
  try {
    const u = new URL(url);
    // Confirmar que es de tu cloud
    return (
      u.hostname === "res.cloudinary.com" &&
      u.pathname.includes(`/${cloudName}/`)
    );
  } catch {
    return false;
  }
}
