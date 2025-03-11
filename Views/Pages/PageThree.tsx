import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "../../store/store";
import {
  incrementQuantity,
  decrementQuantity,
  clearCart,
  removeFromCart,
  emptyCart,
} from "../../store/cartSlice";
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  ScrollView,
  Icon,
  Pressable,
  Image,
  Checkbox,
  useToast,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import styles from "../Styles";
import { useNavigation } from "@react-navigation/native";

const PageThree = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalAmount = useSelector((state: RootState) => state.cart.totalAmount);
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const navigation: any = useNavigation();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);

  console.log(cartItems);

  useEffect(() => {
    const fetchDeliveryFees = async () => {
      try {
        const response = await axios.get('https://backend.j-byu.shop/api/settings/delivryFees');
        console.log('API Response:', response.data);
        const fee = Number(response?.data);
        setDeliveryPrice(fee);
      } catch (error) {
        console.error('Error fetching delivery fees:', error);
        setDeliveryPrice(0);
      }
    };

    fetchDeliveryFees();
  }, []);

  const selectedSubtotal = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedTotal = selectedItems.length > 0 ? selectedSubtotal + deliveryPrice : 0;

  const toggleItemSelection = (itemId: number) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const selectAllItems = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const submitOrder = async () => {
    if (selectedItems.length === 0) {
      toast.show({
        title: t("no_items_selected"),
        status: "warning",
        placement: "top",
      });
      return;
    }

    const sessionToken = await AsyncStorage.getItem("sessionToken");
    if (!sessionToken) {
      toast.show({
        title: t("login_required"),
        status: "error",
        placement: "top",
      });
      return;
    }

    const selectedOrderItems = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    const orderData = {
      session_token: sessionToken,
      orders: selectedOrderItems.map((item) => ({
        vendor_id: 1,
        product_id: item.id,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        status: "pending",
      })),
      delivery_price: deliveryPrice,
    };

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        "https://backend.j-byu.shop/api/orders",
        orderData
      );

      toast.show({
        title: t("order_submitted_success"),
        status: "success",
        placement: "top",
      });

      selectedItems.forEach((itemId) => {
        dispatch(removeFromCart({ id: itemId }));
      });
      setSelectedItems([]);
      navigation.navigate("page one");
    } catch (error) {
      console.error("Order submission error:", error.response?.data);
      toast.show({
        title: t("order_submission_failed"),
        description: error.response?.data?.message || t("unknown_error"),
        status: "error",
        placement: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define black-and-white color scheme
  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF";
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const mutedTextColor = isDarkMode ? "#CCCCCC" : "#333333";
  const cardBgColor = isDarkMode ? "#1A1A1A" : "#F5F5F5"; // Slightly off for contrast
  const borderColor = isDarkMode ? "#FFFFFF" : "#000000";
  const buttonBgColor = isDarkMode ? "#FFFFFF" : "#000000";
  const buttonTextColor = isDarkMode ? "#000000" : "#FFFFFF";
  const buttonPressedBgColor = isDarkMode ? "#CCCCCC" : "#333333";

  return (
    <VStack
      style={[styles.mainContainer, { backgroundColor: backgroundColor }]}
      flex={1}
    >
      <ScrollView flex={1}>
        {cartItems.length === 0 ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <VStack space={4} alignItems="center">
              <Text fontSize={18} color={textColor}>
                {t("no_orders")}
              </Text>
              <Button
                bg={buttonBgColor}
                onPress={() => navigation.navigate("page two")}
              >
                <Text color={buttonTextColor}>{t("explore_products")}</Text>
              </Button>
            </VStack>
          </Box>
        ) : (
          <>
            <Button
              variant="subtle"
              bg={buttonBgColor}
              onPress={selectAllItems}
              leftIcon={
                <Icon
                  as={MaterialIcons}
                  name={
                    selectedItems.length === cartItems.length
                      ? "check-box"
                      : "check-box-outline-blank"
                  }
                  size="sm"
                  color={buttonTextColor}
                />
              }
            >
              <Text color={buttonTextColor}>
                {selectedItems.length === cartItems.length
                  ? t("deselect_all")
                  : t("select_all")}
              </Text>
            </Button>
            {cartItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => toggleItemSelection(item.id)}
              >
                <Box
                  bg={cardBgColor}
                  shadow={4}
                  rounded="xl"
                  margin={4}
                  padding={4}
                  borderWidth={1}
                  borderColor={borderColor}
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <Checkbox
                      value={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      accessibilityLabel="Select item"
                      _checked={{ bg: buttonBgColor, borderColor: buttonBgColor }}
                      _icon={{ color: buttonTextColor }}
                    />
                    <VStack
                      justifyContent="space-between"
                      alignItems="center"
                      space={4}
                      flex={1}
                    >
                      <Image
                        source={{
                          uri: `https://backend.j-byu.shop/api/prudact/${item.id}/img/${item.image}`,
                        }}
                        alt={t("product_image")}
                        width={200}
                        height={200}
                        borderRadius={8}
                      />
                      <VStack
                        flex={1}
                        space={2}
                        alignItems={isArabic ? "flex-end" : "flex-start"}
                      >
                        <Text bold fontSize={16} color={textColor}>
                          {item.name}
                        </Text>
                        <Text color={mutedTextColor}>
                          {t("price_each", { price: item.price.toFixed(2) })}
                        </Text>
                        {item.size && (
                          <Text color={textColor}>
                            <Text bold>{t("size")}:</Text> {item.size}
                          </Text>
                        )}
                      </VStack>
                      <VStack alignItems="center" space={2}>
                        <HStack
                          alignItems="center"
                          space={2}
                          flexDirection={isArabic ? "row-reverse" : "row"}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() =>
                              dispatch(
                                decrementQuantity({
                                  id: item.id,
                                  size: item.size,
                                  color: item.color,
                                })
                              )
                            }
                            borderRadius="full"
                            width={8}
                            height={8}
                            padding={0}
                            borderColor={borderColor}
                          >
                            <Icon
                              as={MaterialIcons}
                              name="remove"
                              size="sm"
                              color={textColor}
                            />
                          </Button>
                          <Box
                            bg={isDarkMode ? "#333333" : "#E0E0E0"}
                            borderRadius="md"
                            paddingX={3}
                            paddingY={1}
                          >
                            <Text bold fontSize="md" color={textColor}>
                              {item.quantity}
                            </Text>
                          </Box>
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() =>
                              dispatch(
                                incrementQuantity({
                                  id: item.id,
                                  size: item.size,
                                  color: item.color,
                                })
                              )
                            }
                            borderRadius="full"
                            width={8}
                            height={8}
                            padding={0}
                            borderColor={borderColor}
                          >
                            <Icon
                              as={MaterialIcons}
                              name="add"
                              size="sm"
                              color={textColor}
                            />
                          </Button>
                        </HStack>
                        <Button
                          variant="subtle"
                          bg={buttonBgColor}
                          onPress={() =>
                            dispatch(
                              removeFromCart({
                                id: item.id,
                                size: item.size,
                                color: item.color,
                              })
                            )
                          }
                          leftIcon={
                            <Icon
                              as={MaterialIcons}
                              name="delete"
                              size="sm"
                              color={buttonTextColor}
                            />
                          }
                        >
                          <Text color={buttonTextColor}>{t("remove")}</Text>
                        </Button>
                      </VStack>
                    </VStack>
                  </HStack>
                </Box>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      {/* Sticky Footer */}
      {cartItems.length > 0 && (
        <Box
          bg={cardBgColor}
          shadow={6}
          padding={4}
          borderTopWidth={1}
          borderTopColor={borderColor}
        >
          <VStack space={2}>
            <HStack
              justifyContent="space-between"
              alignItems="center"
              flexDirection={isArabic ? "row-reverse" : "row"}
            >
              <Text bold fontSize="lg" color={textColor}>
                {t("subtotal")}
              </Text>
              <Text bold fontSize="lg" color={textColor}>
                ${selectedSubtotal.toFixed(2)}
              </Text>
            </HStack>
            <HStack
              justifyContent="space-between"
              alignItems="center"
              flexDirection={isArabic ? "row-reverse" : "row"}
            >
              <Text bold fontSize="lg" color={textColor}>
                {t("delivery_price")}
              </Text>
              <Text bold fontSize="lg" color={textColor}>
                JOD{deliveryPrice?.toFixed(2)}
              </Text>
            </HStack>
            <HStack
              justifyContent="space-between"
              alignItems="center"
              flexDirection={isArabic ? "row-reverse" : "row"}
            >
              <Text bold fontSize="xl" color={textColor}>
                {t("total")}
              </Text>
              <Text bold fontSize="xl" color={textColor}>
                ${selectedTotal.toFixed(2)}
              </Text>
            </HStack>
          </VStack>

          <HStack space={4} marginTop={4}>
            <Button
              variant="solid"
              bg={buttonBgColor}
              onPress={() => dispatch(clearCart())}
              leftIcon={
                <Icon
                  as={MaterialIcons}
                  name="delete-sweep"
                  size="sm"
                  color={buttonTextColor}
                />
              }
              flex={1}
            >
              <Text color={buttonTextColor} bold>
                {t("clear_cart")}
              </Text>
            </Button>
            <Button
              variant="solid"
              bg={isSubmitting ? buttonPressedBgColor : buttonBgColor}
              onPress={submitOrder}
              leftIcon={
                <Icon
                  as={MaterialIcons}
                  name="local-shipping"
                  size="sm"
                  color={buttonTextColor}
                />
              }
              flex={1}
              isDisabled={selectedItems.length === 0 || isSubmitting}
            >
              <Text color={buttonTextColor} bold>
                {isSubmitting ? t("submitting") : t("send_order")}
              </Text>
            </Button>
          </HStack>
        </Box>
      )}
    </VStack>
  );
};

export default PageThree;