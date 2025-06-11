import { createContext, useContext, useEffect, useState } from "react";
import { addToCartApi, removeCartItemApi } from "../api/cartApi";
import { getCartItem } from "../api/courseApi";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartItems = await getCartItem();
        setCart(cartItems);
      } catch (error) {
        console.error("Failed to load cart items:", error);
      }
    };
    fetchCart();
  }, [addToCartApi]);

  const addToCart = async (course) => {
    setCart((prevCart) => {
      const existingCourse = prevCart.find((item) => item.name === course.name);
      if (existingCourse) {
        return prevCart.map((item) =>
          item.name === course.name
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prevCart, { ...course, quantity: 1 }];
    });
  };

  const removeFromCart = async (course) => {
    setCart((prevCart) => prevCart.filter((item) => item.name !== course.name));
    await removeCartItemApi(course._id);
  };

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
