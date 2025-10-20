import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  console.log('🔄 cartReducer called with action:', action.type, action.payload);
  console.log('🔄 current state.items:', state.items);
  console.log('🔄 current state.items.length:', state.items.length);

  switch (action.type) {
    case 'ADD_ITEM':
      console.log('🔄 ADD_ITEM processing...');
      const existingItem = state.items.find(item =>
        item.id === action.payload.id &&
        JSON.stringify(item.customizations) === JSON.stringify(action.payload.customizations)
      );
      console.log('🔄 existingItem found:', existingItem);

      if (existingItem) {
        console.log('🔄 Updating existing item quantity');
        const newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id &&
              JSON.stringify(item.customizations) === JSON.stringify(action.payload.customizations)
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
        console.log('🔄 New state after update:', newState);
        return newState;
      }
      console.log('🔄 Adding new item to cart');
      const newState = {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      };
      console.log('🔄 New state after add:', newState);
      return newState;

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.cartItemId === action.payload.cartItemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.cartItemId !== action.payload)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: []
  });

  // Get cart storage key based on user authentication status
  const getCartKey = () => {
    if (isAuthenticated && user) {
      return `sweetbite-cart-user-${user.id}`;
    } else {
      return 'sweetbite-cart-guest';
    }
  };

  // Handle cart loading and migration when user changes
  useEffect(() => {
    console.log('🛒 User/auth state changed:', { user: user?.id, isAuthenticated });

    if (isAuthenticated && user) {
      // User is logged in - handle migration and loading
      const guestCartKey = 'sweetbite-cart-guest';
      const userCartKey = `sweetbite-cart-user-${user.id}`;

      const guestCart = localStorage.getItem(guestCartKey);
      const userCart = localStorage.getItem(userCartKey);

      if (guestCart && !userCart) {
        // Migrate guest cart to user cart
        console.log('🛒 Migrating guest cart to user cart');
        localStorage.setItem(userCartKey, guestCart);
        localStorage.removeItem(guestCartKey);

        try {
          const parsedGuestCart = JSON.parse(guestCart);
          dispatch({ type: 'LOAD_CART', payload: parsedGuestCart });
        } catch (error) {
          console.error('Error migrating guest cart:', error);
          dispatch({ type: 'CLEAR_CART' });
        }
      } else if (guestCart && userCart) {
        // Merge guest cart with existing user cart
        console.log('🛒 Merging guest cart with existing user cart');
        try {
          const parsedGuestCart = JSON.parse(guestCart);
          const parsedUserCart = JSON.parse(userCart);

          // Add guest cart items to user cart
          parsedGuestCart.forEach(guestItem => {
            const existingItem = parsedUserCart.find(userItem =>
              userItem.id === guestItem.id &&
              JSON.stringify(userItem.customizations) === JSON.stringify(guestItem.customizations)
            );

            if (existingItem) {
              existingItem.quantity += guestItem.quantity;
            } else {
              parsedUserCart.push(guestItem);
            }
          });

          localStorage.setItem(userCartKey, JSON.stringify(parsedUserCart));
          localStorage.removeItem(guestCartKey);
          dispatch({ type: 'LOAD_CART', payload: parsedUserCart });
        } catch (error) {
          console.error('Error merging carts:', error);
          dispatch({ type: 'CLEAR_CART' });
        }
      } else if (userCart) {
        // Load existing user cart
        console.log('🛒 Loading existing user cart');
        try {
          const parsedUserCart = JSON.parse(userCart);
          dispatch({ type: 'LOAD_CART', payload: parsedUserCart });
        } catch (error) {
          console.error('Error loading user cart:', error);
          dispatch({ type: 'CLEAR_CART' });
        }
      } else {
        // No cart found for user
        console.log('🛒 No cart found for user, clearing current cart');
        dispatch({ type: 'CLEAR_CART' });
      }
    } else {
      // User is not logged in - load guest cart
      const guestCartKey = 'sweetbite-cart-guest';
      const guestCart = localStorage.getItem(guestCartKey);

      if (guestCart) {
        console.log('🛒 Loading guest cart');
        try {
          const parsedGuestCart = JSON.parse(guestCart);
          dispatch({ type: 'LOAD_CART', payload: parsedGuestCart });
        } catch (error) {
          console.error('Error loading guest cart:', error);
          dispatch({ type: 'CLEAR_CART' });
        }
      } else {
        console.log('🛒 No guest cart found, clearing current cart');
        dispatch({ type: 'CLEAR_CART' });
      }
    }
  }, [user, isAuthenticated]);

  // Save cart to localStorage when items change
  useEffect(() => {
    const cartKey = getCartKey();
    console.log('🛒 Saving cart for key:', cartKey, 'items:', state.items);
    localStorage.setItem(cartKey, JSON.stringify(state.items));
  }, [state.items, user, isAuthenticated]);

  const addItem = (item, quantity = 1) => {
    console.log('🛒 addItem called with:', item, 'quantity:', quantity);

    // Validate item
    if (!item) {
      console.error('❌ addItem: item is null or undefined');
      return;
    }

    if (!item.id) {
      console.error('❌ addItem: item.id is missing');
      return;
    }

    if (!item.price) {
      console.error('❌ addItem: item.price is missing');
      return;
    }

    const cartItemId = `${item.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payload = {
      ...item,
      quantity,
      cartItemId
    };
    console.log('🛒 addItem payload:', payload);

    try {
      dispatch({
        type: 'ADD_ITEM',
        payload: payload
      });
      console.log('🛒 addItem dispatch completed successfully');
    } catch (error) {
      console.error('❌ Error in addItem dispatch:', error);
    }
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity > 0) {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } });
    } else {
      removeItem(cartItemId);
    }
  };

  const removeItem = (cartItemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: cartItemId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const getCartItems = () => {
    return state.items;
  };


  return (
    <CartContext.Provider value={{
      cartItems: state.items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getCartTotal,
      getItemCount,
      getCartItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
