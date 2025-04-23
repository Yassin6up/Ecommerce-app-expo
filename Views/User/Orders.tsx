import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "../../store/store";
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
  useToast,
  Stack
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import styles from "../Styles";
import { BackHandler } from "react-native";
import { ArrowLeft } from "iconsax-react-native";

interface Order {
  id: number;
  userId: number;
  productId: number;
  vendorId: number;
  price: number;
  status: string;
  createdAt: string;
  productName: string;
  productImageUrl: string;
  storeName: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const navigation: any = useNavigation();
  const toast = useToast();
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000"; // Icons

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) throw new Error("No user ID found");

        const response = await axios.get(
          `https://backend.j-byu.shop/api/orders/byUser/${userId}`
        );

        console.log("Fetched Orders:", response.data.orders);
        setOrders(response.data.orders);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        toast.show({ title: t("error_fetching_orders"), status: "error" });
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("UserPage");
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const handleCancelOrder = async (orderId: number) => {
    try {
      await axios.put(`https://backend.j-byu.shop/api/orders/cancel/${orderId}`);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "غير مكتمل" } : order
        )
      );
      toast.show({ title: t("order_cancelled_success"), status: "success" });
    } catch (error) {
      console.error("Error cancelling order:", error.response?.data);
      toast.show({ title: t("error_cancelling_order"), status: "error" });
    }
  };

  // Normalize status to a consistent key
  const normalizeStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      "قيد الانتظار": "pending",
      pending: "pending",
      "قيد التوصيل": "on_the_way",
      on_the_way: "on_the_way",
      cancelled: "cancelled",
      ملغى: "cancelled",
    };
    return statusMap[status.toLowerCase()] || status.toLowerCase();
  };

  // Filter orders based on normalized status
  const filteredOrders = orders.filter((order) => {
    const normalizedStatus = normalizeStatus(order.status);
    if (statusFilter === "All") return true;
    return normalizedStatus === normalizeStatus(statusFilter);
  });

  if (isLoading) {
    return (
      <VStack
        style={[styles.mainContainer, isDarkMode ? styles.darkBckground : styles.lightBckground]}
        flex={1}
        justifyContent="center"
        alignItems="center"
      >
        <Text>{t("loading")}</Text>
      </VStack>
    );
  }

  return (
    <VStack
      style={[styles.mainContainer, isDarkMode ? styles.darkBckground : styles.lightBckground]}
      flex={1}
      alignItems="center"
      // Remove justifyContent="center" from here to allow top alignment
    >
      {/* Filter Buttons - Always at the top */}
      <Stack w={"full"} mb={4} position={"fixed"}>
              <Pressable onPress={() => navigation.goBack()}>
                <ArrowLeft size="32" color={iconColor} />
              </Pressable>
            </Stack>
      <HStack space={2} mt={4} mb={4} justifyContent="center" flexWrap="wrap" width="100%">
        <Button
          size="sm"
          variant={statusFilter === "All" ? "solid" : "outline"}
          colorScheme="blue"
          onPress={() => setStatusFilter("All")}
        >
          {t("all")}
        </Button>
        <Button
          size="sm"
          variant={normalizeStatus(statusFilter) === "pending" ? "solid" : "outline"}
          colorScheme="orange"
          onPress={() => setStatusFilter("pending")}
        >
          {t("pending")}
        </Button>
        <Button
          size="sm"
          variant={normalizeStatus(statusFilter) === "on_the_way" ? "solid" : "outline"}
          colorScheme="green"
          onPress={() => setStatusFilter("on_the_way")}
        >
          {t("on_the_way")}
        </Button>
        <Button
          size="sm"
          variant={normalizeStatus(statusFilter) === "cancelled" ? "solid" : "outline"}
          colorScheme="red"
          onPress={() => setStatusFilter("cancelled")}
        >
          {t("cancelled")}
        </Button>
      </HStack>

      {/* Content Area - Takes remaining space */}
      {filteredOrders.length === 0 ? (
        <VStack flex={1} justifyContent="center" alignItems="center" width="100%">
          <Text fontSize={18} color={isDarkMode ? "white" : "gray.900"}>
            {statusFilter === "All" ? t("no_orders") : t("no_orders_for_status")}
          </Text>
          <Button mt={4} colorScheme="blue" onPress={() => navigation.navigate("page two")}>
            <Text>{t("explore_products")}</Text>
          </Button>
        </VStack>
      ) : (
        <ScrollView flex={1} width="100%">
          {filteredOrders.map((order) => {
            const normalizedStatus = normalizeStatus(order.status);
            let displayStatus = "";
            let statusColor = "orange.500";

            switch (normalizedStatus) {
              case "pending":
                displayStatus = t("pending");
                statusColor = "orange.500";
                break;
              case "on_the_way":
                displayStatus = t("on_the_way");
                statusColor = "green.500";
                break;
              case "cancelled":
                displayStatus = t("cancelled");
                statusColor = "red.500";
                break;
              default:
                displayStatus = order.status; // Fallback
            }

            return (
              <Pressable key={order.id} onPress={() => {}}>
                <Box
                  bg={isDarkMode ? "gray.800" : "white"}
                  shadow={4}
                  rounded="xl"
                  margin={4}
                  padding={4}
                  borderWidth={1}
                  borderColor={isDarkMode ? "gray.700" : "gray.200"}
                >
                  <VStack justifyContent="space-between" alignItems="center" space={4}>
                    <Image
                      source={{
                        uri: (() => {
                          try {
                            let imageSource;
                            if (Array.isArray(order.productImageUrl)) {
                              imageSource = order.productImageUrl[0];
                            } else if (typeof order.productImageUrl === "string") {
                              try {
                                const parsedImages = JSON.parse(order.productImageUrl);
                                imageSource = parsedImages[0];
                              } catch {
                                imageSource = order.productImageUrl;
                              }
                            }
                            return `https://backend.j-byu.shop/api/prudact/${order.productId}/img/${imageSource}`;
                          } catch (error) {
                            console.error("Image URL Error:", error);
                            return null;
                          }
                        })(),
                      }}
                      alt={t("product_image")}
                      width={200}
                      height={200}
                      borderRadius={8}
                    />
                    <VStack flex={1} space={2} alignItems={isArabic ? "flex-end" : "flex-start"}>
                      <Text bold fontSize={16} color={isDarkMode ? "white" : "gray.900"}>
                        {order.productName}
                      </Text>
                      <Text color={isDarkMode ? "gray.400" : "gray.600"}>
                        {order.price.toFixed(2)} JOD
                      </Text>
                      <Text bold color={statusColor}>
                        {t("status")}: {displayStatus}
                      </Text>
                      {normalizedStatus === "pending" && (
                        <Button
                          colorScheme="red"
                          size="sm"
                          onPress={() => handleCancelOrder(order.id)}
                          leftIcon={<Icon as={MaterialIcons} name="cancel" size="sm" color="white" />}
                          mt={2}
                        >
                          {t("cancel_order")}
                        </Button>
                      )}
                    </VStack>
                  </VStack>
                </Box>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </VStack>
  );
};

export default Orders;