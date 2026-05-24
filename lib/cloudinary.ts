import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = !!(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Uploads an image (base64, local file path, etc.) to Cloudinary.
 * Falls back to returning the original string or placeholder if Cloudinary is not configured.
 */
export async function uploadImage(imageInput: string): Promise<string> {
  if (!isConfigured) {
    console.warn("Cloudinary is not configured. Returning the image string or falling back to placeholder.");
    return imageInput || "📦";
  }

  try {
    const result = await cloudinary.uploader.upload(imageInput, {
      folder: "eshop_products",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed, falling back to input value:", error);
    return imageInput;
  }
}
