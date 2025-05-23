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
import { Alert, BackHandler } from "react-native"; // Import Alert
import { setPassHome } from "../../store/PassHomeSlice";

const PageThree = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const navigation: any = useNavigation();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const [deliveryPrice, setDeliveryPrice] = useState(0);

  useEffect(() => {
    const fetchDeliveryFees = async () => {
      try {
        const response = await axios.get(
          "https://backend.j-byu.shop/api/settings/delivryFees"
        );
        const fee = Number(response?.data);
        setDeliveryPrice(fee);
      } catch (error) {
        console.error("Error fetching delivery fees:", error);
        setDeliveryPrice(0);
      }
    };
    fetchDeliveryFees();
  }, []);

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("page one");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const selectedSubtotal = cartItems
    .filter((item: any) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedTotal =
    selectedItems.length > 0 ? selectedSubtotal + deliveryPrice : 0;

  const toggleItemSelection = (itemId: any) => {
    setSelectedItems((prev: any) =>
      prev.includes(itemId)
        ? prev.filter((id: any) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === cartItems.length) {
      console.log("Deselecting all items");
      setSelectedItems([]);
    } else {
      const allIds: any = cartItems.map((item) => item.id);
      console.log("Selecting all items:", allIds);
      setSelectedItems(allIds);
    }
  };

  const submitOrder = async () => {
    if (selectedItems.length === 0) {
      toast.show({
        placement: "top",
        render: () => (
          <Box bg="yellow.500" px="2" py="1" rounded="sm" _text={{ color: "#FFFFFF" }}>
            {t("no_items_selected")}
          </Box>
        ),
      });
      return;
    }

    try {
      const sessionToken = await AsyncStorage.getItem("sessionToken");

      if (!sessionToken || sessionToken === "") {
        console.log("No session token, prompting login");
        toast.show({
          placement: "top",
          render: () => (
            <Box bg="red.500" px="2" py="1" rounded="sm" _text={{ color: "#FFFFFF" }}>
              {t("please_login")}
            </Box>
          ),
        });
        navigation.navigate("page Four");
        return;
      }

      const selectedOrderItems = cartItems.filter((item: any) =>
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

      setIsSubmitting(true);
      const response = await axios.post(
        "https://backend.j-byu.shop/api/orders",
        orderData
      );

      if (response.status === 200 || response.status === 201) {
        selectedItems.forEach((itemId) => {
          const item = cartItems.find((i) => i.id === itemId);
          if (item) {
            dispatch(
              removeFromCart({ id: itemId, size: item.size, color: item.color })
            );
          }
        });

        setSelectedItems([]);

        const toastId = toast.show({
          placement: "top",
          duration: null,
          render: () => (
            <Box
              bg="green.500"
              px={4}
              py={3}
              rounded="md"
              shadow={4}
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text color="white" bold mr={4}>
                {t("order_submitted_success")}
              </Text>
              <Pressable
                onPress={() => {
                  toast.close(toastId);
                  navigation.navigate("page one");
                }}
                _pressed={{ opacity: 0.7 }}
              >
                <Icon
                  as={MaterialIcons}
                  name="close"
                  size="sm"
                  color="white"
                />
              </Pressable>
            </Box>
          ),
        });
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Order submission error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || t("unknown_error");
      if (errorMessage.includes("session token")) {
        console.log("Invalid session token, prompting login");
        toast.show({
          placement: "top",
          render: () => (
            <Box bg="red.500" px="2" py="1" rounded="sm" _text={{ color: "#FFFFFF" }}>
              {t("please_login")}
            </Box>
          ),
        });
        navigation.navigate("page Four");
      } else {
        toast.show({
          placement: "top",
          render: () => (
            <Box bg="red.500" px="2" py="1" rounded="sm" _text={{ color: "#FFFFFF" }}>
              {t("order_submission_failed")}: {errorMessage}
            </Box>
          ),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = () => {
    // Show confirmation alert before submitting the order
    Alert.alert(
      t("confirm_order_title"), // Title: "Confirm Order"
      t("confirm_order_message"), // Message: "Are you sure you want to send this order?"
      [
        {
          text: t("cancel"), // Cancel button
          style: "cancel",
        },
        {
          text: t("ok"), // OK button
          onPress: submitOrder, // Call submitOrder if user confirms
        },
      ],
      { cancelable: true }
    );
  };

  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF";
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const mutedTextColor = isDarkMode ? "#CCCCCC" : "#333333";
  const cardBgColor = isDarkMode ? "#1A1A1A" : "#F5F5F5";
  const borderColor = isDarkMode ? "#FFFFFF" : "#000000";
  const buttonBgColor = isDarkMode ? "#FFFFFF" : "#000000";
  const buttonTextColor = isDarkMode ? "#000000" : "#FFFFFF";
  const buttonPressedBgColor = isDarkMode ? "#CCCCCC" : "#333333";

  return (
    <VStack style={[styles.mainContainer, { backgroundColor }]} flex={1}>
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
                      isChecked={selectedItems.includes(item.id)}
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
                        <Text
                          bold
                          fontSize={16}
                          color={textColor}
                          textAlign={isArabic ? "right" : "left"}
                        >
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
                {selectedSubtotal.toFixed(2)} JOD
              </Text>
            </HStack>
            <HStack
              justifyContent="space-between"
              alignItems="center"
              flexDirection={isArabic ? "row-reverse" : "row"}
            >
              <Text bold fontSize="lg" color={textColor}>
                {t("delivery_price")} JOD
              </Text>
              <Text bold fontSize="lg" color={textColor}>
                {deliveryPrice?.toFixed(2)} JOD
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
                {selectedTotal.toFixed(2)} JOD
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
              onPress={handleSubmitOrder} // Use handleSubmitOrder instead of submitOrder
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