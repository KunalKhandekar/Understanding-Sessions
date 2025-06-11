import { createContext, useContext, useState, useEffect } from "react";
import { addToCartServer, getCartItem, removeCartItem } from "../api/courseApi";

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
  }, []);

  const addToCart = async (course) => {
    setCart((prevCart) => {
      const existingCourse = prevCart.find((item) => item.name === course.name);
      let updatedCart = [];
      if (existingCourse) {
        updatedCart = prevCart.map((item) =>
          item.name === course.name
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        updatedCart = [...prevCart, { ...course, quantity: 1 }];
      }
      addToCartServer(updatedCart);
      return updatedCart;
    });
  };

  const removeFromCart = async (course) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.name !== course.name));
    removeCartItem(course.name);
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
