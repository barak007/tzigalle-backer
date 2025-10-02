import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, UserProfile } from "@/lib/types/user";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { BREAD_CATEGORIES } from "@/lib/constants/bread-categories";
import { DEFAULT_CITY } from "@/lib/constants/cities";

export function useOrderState() {
  const { toast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  // User state
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Order state
  const [cart, setCart] = useState<Record<number, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState(DEFAULT_CITY);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [hasSavedOrder, setHasSavedOrder] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showEditFields, setShowEditFields] = useState(false);

  // Validation states
  const [phoneError, setPhoneError] = useState("");
  const [deliveryDateError, setDeliveryDateError] = useState("");

  // Save to localStorage with debounce
  const saveToLocalStorage = useCallback((orderData: any) => {
    const hasData =
      Object.keys(orderData.cart).length > 0 ||
      orderData.customerName.trim() !== "" ||
      orderData.customerPhone.trim() !== "" ||
      orderData.customerAddress.trim() !== "" ||
      orderData.deliveryDate !== "" ||
      orderData.notes.trim() !== "";

    if (hasData) {
      localStorage.setItem("currentOrder", JSON.stringify(orderData));
    } else {
      localStorage.removeItem("currentOrder");
    }
  }, []);

  const debouncedSaveToLocalStorage = useDebounce(saveToLocalStorage, 500);

  // Save order data to localStorage whenever form changes
  useEffect(() => {
    if (isInitialLoad) {
      return;
    }

    const orderData = {
      cart,
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      deliveryDate,
      notes,
    };

    debouncedSaveToLocalStorage(orderData);
    setHasSavedOrder(Object.keys(cart).length > 0);
  }, [
    cart,
    customerName,
    customerPhone,
    customerAddress,
    customerCity,
    deliveryDate,
    notes,
    isInitialLoad,
    debouncedSaveToLocalStorage,
  ]);

  // Load user data and saved orders on mount
  useEffect(() => {
    const initializeOrder = async () => {
      setLoading(true);

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        setUserProfile(profile);

        if (profile) {
          setCustomerName(profile.full_name || currentUser.email || "");
          setCustomerPhone(profile.phone || "");
          setCustomerAddress(profile.address || "");
          setCustomerCity(profile.city || DEFAULT_CITY);
        }
      }

      setLoading(false);

      // Load pending order if exists
      const pendingOrder = localStorage.getItem("pendingOrder");
      if (pendingOrder) {
        try {
          const orderData = JSON.parse(pendingOrder);
          setCart(orderData.cart || {});
          setCustomerName(orderData.customerName || "");
          setCustomerPhone(orderData.customerPhone || "");
          setCustomerAddress(orderData.customerAddress || "");
          setCustomerCity(orderData.customerCity || DEFAULT_CITY);
          setDeliveryDate(orderData.deliveryDate || "");
          setNotes(orderData.notes || "");
          localStorage.removeItem("pendingOrder");

          toast({
            title: "ההזמנה שלך נטענה",
            description: "המשך להזמין מהמקום שבו עצרת",
          });
        } catch (e) {
          console.error("Error loading pending order:", e);
        }
      } else {
        // Load current order from localStorage
        const currentOrder = localStorage.getItem("currentOrder");
        if (currentOrder) {
          try {
            const orderData = JSON.parse(currentOrder);
            setCart(orderData.cart || {});
            if (!currentUser) {
              setCustomerName(orderData.customerName || "");
              setCustomerPhone(orderData.customerPhone || "");
              setCustomerAddress(orderData.customerAddress || "");
              setCustomerCity(orderData.customerCity || DEFAULT_CITY);
            }
            setDeliveryDate(orderData.deliveryDate || "");
            setNotes(orderData.notes || "");
          } catch (e) {
            console.error("Error loading current order:", e);
          }
        }
      }

      setIsInitialLoad(false);
    };

    initializeOrder();
  }, [supabase, toast]);

  // Helper to find bread by ID
  const findBreadById = useCallback((id: number) => {
    for (const category of BREAD_CATEGORIES) {
      const bread = category.breads.find((b) => b.id === id);
      if (bread) {
        return {
          ...bread,
          price: category.price,
          categoryTitle: category.title,
        };
      }
    }
    return null;
  }, []);

  // Calculate totals
  const totalPrice = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, quantity]) => {
      const bread = findBreadById(Number(id));
      return sum + (bread?.price || 0) * quantity;
    }, 0);
  }, [cart, findBreadById]);

  const totalItems = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  // Check which fields have user profile values
  const hasUserName = useMemo(() => {
    return !!(userProfile?.full_name || user?.email);
  }, [userProfile, user]);

  const hasUserPhone = useMemo(() => {
    return !!userProfile?.phone;
  }, [userProfile]);

  const hasUserAddress = useMemo(() => {
    return !!userProfile?.address;
  }, [userProfile]);

  const hasUserCity = useMemo(() => {
    return !!userProfile?.city;
  }, [userProfile]);

  // Cart operations
  const addToCart = useCallback((breadId: number) => {
    setCart((prev) => ({
      ...prev,
      [breadId]: (prev[breadId] || 0) + 1,
    }));
  }, []);

  const removeFromCart = useCallback((breadId: number) => {
    setCart((prev) => {
      const newQuantity = (prev[breadId] || 0) - 1;
      if (newQuantity <= 0) {
        const { [breadId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [breadId]: newQuantity };
    });
  }, []);

  const clearOrder = useCallback(() => {
    setCart({});
    setDeliveryDate("");
    setNotes("");
    setPhoneError("");
    setDeliveryDateError("");

    if (userProfile) {
      setCustomerName(userProfile.full_name || user?.email || "");
      setCustomerPhone(userProfile.phone || "");
      setCustomerAddress(userProfile.address || "");
      setCustomerCity(userProfile.city || DEFAULT_CITY);
    } else {
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerCity(DEFAULT_CITY);
    }

    localStorage.removeItem("currentOrder");
    setHasSavedOrder(false);
  }, [user, userProfile]);

  const resetAfterSuccess = useCallback(() => {
    setOrderSuccess(true);
    setCart({});
    setCustomerName(user?.user_metadata?.full_name || user?.email || "");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerCity(DEFAULT_CITY);
    setDeliveryDate("");
    setNotes("");
    setPhoneError("");
    setDeliveryDateError("");
    localStorage.removeItem("currentOrder");
    setHasSavedOrder(false);
  }, [user]);

  return {
    // User
    user,
    userProfile,
    loading,

    // Order data
    cart,
    customerName,
    customerPhone,
    customerAddress,
    customerCity,
    deliveryDate,
    notes,

    // UI state
    isSubmitting,
    orderSuccess,
    hasSavedOrder,
    showEditFields,

    // Validation
    phoneError,
    deliveryDateError,

    // Calculated values
    totalPrice,
    totalItems,

    // Field availability from user profile
    hasUserName,
    hasUserPhone,
    hasUserAddress,
    hasUserCity,

    // Setters
    setCustomerName,
    setCustomerPhone,
    setCustomerAddress,
    setCustomerCity,
    setDeliveryDate,
    setNotes,
    setIsSubmitting,
    setPhoneError,
    setDeliveryDateError,
    setShowEditFields,

    // Actions
    addToCart,
    removeFromCart,
    clearOrder,
    resetAfterSuccess,
    findBreadById,
  };
}
