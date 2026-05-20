import API from "@/api/axios";

export const addWorkUpdate = async (
  projectId: string,
  slug: string,
  formData: FormData,
) => {
  const res = await API.post(`/${slug}/workUpdate/${projectId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const getWorkUpdates = async (
  slug: string,
  params?: { projectId?: string },
) => {
  try {
    const response = await API.get(`/${slug}/workUpdate`, {
      params,
      withCredentials: true,
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export const editWorkUpdate = async (
  slug: string,
  updateId: string,
  formData: FormData,
) => {
  try {
    const response = await API.put(
      `/${slug}/workUpdate/${updateId}`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export const deleteWorkUpdate = async (slug: string, updateId: string) => {
  try {
    const response = await API.delete(`/${slug}/workUpdate/${updateId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};