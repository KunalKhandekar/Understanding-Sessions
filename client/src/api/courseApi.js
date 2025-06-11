import axiosInstance from "./axiosInstance";

export const getAllCoursesApi = async () => {
  const { data } = await axiosInstance.get("/courses");
  return data;
};

export const addToCartServer = async (cart) => {
  await axiosInstance.post("/cart", { cart: cart });
};

export const getCartItem = async () => {
  const { data } = await axiosInstance.get("/cart");
  return data;
};

export const removeCartItem = async (name) => {
  await axiosInstance.delete(`/cart/${name}`);
};
