import API from "@/api/axios";

/**
 * Uploads an image to the backend (which uploads it to Cloudinary).
 * @param {File} file - The image file to upload.
 * @returns {Promise<string>} The uploaded image URL.
 */
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const uploadRes = await API.post("/upload/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const resData = uploadRes.data;
  return resData.imageUrl || resData.secure_url || resData.url || resData.data?.imageUrl || "";
};

