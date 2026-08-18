import API from "@/api/axios";

export const getAllProducts = async (slug: string) => {
  const res = await API.get(`/products/${slug}/get-products`);
  return res.data; // Returns the full payload { success: true, count, data: [...] }
};

export const getProductById = async (productId: string, slug: string) => {
  const res = await API.get(`/products/${slug}/get-products/${productId}`);
  return res.data.data; 
}

export const createProduct = async (productData: unknown, slug: string) => {
  const res = await API.post(`/products/${slug}/create-products`, productData);
  return res.data.data;
}

export const updateProduct = async (productId: string, productData: unknown, slug: string) => {
  const res = await API.put(`/products/${slug}/get-products/${productId}`, productData);
  return res.data.data;
}

export const deleteProduct = async (productId: string, slug: string) => {
  const res = await API.delete(`/products/x${slug}/get-products/${productId}`);
  return res.data.success;
}
