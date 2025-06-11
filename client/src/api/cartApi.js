import axiosInstance from "./axiosInstance";

export const addToCartApi = async (courseId) => {
  await axiosInstance.post("/cart", { courseId });
};


export const removeCartItemApi = async (courseId) => {
  await axiosInstance.delete(`/cart/${courseId}`);
};