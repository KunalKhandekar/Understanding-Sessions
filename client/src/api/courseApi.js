import axiosInstance from "./axiosInstance";

export const getAllCoursesApi = async () => {
  const { data } = await axiosInstance.get("/courses");
  return data;
};



export const getCartItem = async () => {
  const { data } = await axiosInstance.get("/cart");
  return data;
};


