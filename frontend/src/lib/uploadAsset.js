export async function uploadAssetFile(file, options = {}) {
  const folder = options.folder || "general";
  const cloudName =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
    (typeof __CLOUDINARY_CLOUD_NAME_FROM_URL__ !== "undefined"
      ? __CLOUDINARY_CLOUD_NAME_FROM_URL__
      : "");
  const uploadPreset =
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
    (typeof __CLOUDINARY_UPLOAD_PRESET_FROM_ENV__ !== "undefined"
      ? __CLOUDINARY_UPLOAD_PRESET_FROM_ENV__
      : "");

  if (!(file instanceof File)) {
    throw new Error("Please select a valid file.");
  }

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Missing Cloudinary config. Set VITE_CLOUDINARY_UPLOAD_PRESET or CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);
  formData.append("public_id", `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const cloudinaryMessage =
      (typeof payload?.error === "string" && payload.error) ||
      payload?.error?.message ||
      payload?.message;
    throw new Error(
      cloudinaryMessage || `Upload failed with status ${response.status}.`
    );
  }

  const url = payload?.secure_url || payload?.url;
  if (!url) {
    throw new Error("Upload succeeded but no URL was returned.");
  }

  return url;
}
