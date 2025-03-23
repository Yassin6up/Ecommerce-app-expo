import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "../../store/store";
import { removeFromCart, markAsRemoved } from "../../store/cartSlice";
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
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import styles from "../Styles";

// Define interface for Order
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

  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const navigation: any = useNavigation();
  const toast = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");

        if (!userId) {
          throw new Error("No user ID found");
        }

        const response = await axios.get(
          `https://backend.j-byu.shop/api/orders/byUser/${userId}`
        );

        console.log("Fetched Orders:", response.data.orders);
        setOrders(response.data.orders);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        toast.show({
          title: t("error_fetching_orders"),
          status: "error",
        });
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    try {
      await axios.put(`https://backend.j-byu.shop/api/orders/cancel/${orderId}`);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "cancelled" } : order
        )
      );

      toast.show({
        title: t("order_cancelled_success"),
        status: "success",
      });
    } catch (error) {
      console.error("Error cancelling order:", error.response?.data);
      toast.show({
        title: t("error_cancelling_order"),
        status: "error",
      });
    }
  };

  // Filter orders based on status
  const filteredOrders = orders.filter((order) => {
    console.log("Order Status:", order.status, "Filter:", statusFilter);
    if (statusFilter === "All") return true;
    return order.status.toLowerCase() === statusFilter.toLowerCase(); // Case-insensitive comparison
  });

  if (isLoading) {
    return (
      <VStack
        style={[
          styles.mainContainer,
          isDarkMode ? styles.darkBckground : styles.lightBckground,
        ]}
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
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}
      flex={1}
      justifyContent="center"
      alignItems="center"
    >
      {/* Status Filter Buttons */}
      <HStack space={2} mb={4} justifyContent="center" flexWrap="wrap">
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
          variant={statusFilter === "قيد الانتظار" ? "solid" : "outline"}
          colorScheme="orange"
          onPress={() => setStatusFilter("قيد الانتظار")}
        >
          {t("pending")}
        </Button>
        <Button
          size="sm"
          variant={statusFilter === "قيد التوصيل" ? "solid" : "outline"}
          colorScheme="green"
          onPress={() => setStatusFilter("قيد التوصيل")}
        >
          {t("on_the_way")}
        </Button>
        <Button
          size="sm"
          variant={statusFilter === "cancelled" ? "solid" : "outline"}
          colorScheme="red"
          onPress={() => setStatusFilter("cancelled")}
        >
          {t("cancelled")}
        </Button>
      </HStack>

      {filteredOrders.length === 0 ? (
        <VStack space={4} alignItems="center">
          <Text fontSize={18} color={isDarkMode ? "white" : "gray.900"}>
            {statusFilter === "All" ? t("no_orders") : t("no_orders_for_status")}
          </Text>
          <Button
            colorScheme="blue"
            onPress={() => navigation.navigate("page two")}
          >
            <Text>{t("explore_products")}</Text>
          </Button>
        </VStack>
      ) : (
        <ScrollView flex={1} width="100%">
          {filteredOrders.map((order) => {
            let orderStatus = order.status;
            let statusColor = "orange.500";

            switch (order.status.toLowerCase()) {
              case "قيد التوصيل":
                orderStatus = t("on_the_way");
                statusColor = "green.500";
                break;
              case "cancelled":
                orderStatus = t("cancelled");
                statusColor = "red.500";
                break;
              case "قيد الانتظار":
                orderStatus = t("pending");
                statusColor = "orange.500";
                break;
              default:
                orderStatus = order.status; // Fallback to raw status
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
                  <VStack
                    justifyContent="space-between"
                    alignItems="center"
                    space={4}
                  >
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
                            const imageUrl = `https://backend.j-byu.shop/api/prudact/${order.productId}/img/${imageSource}`;
                            return imageUrl;
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

                    <VStack
                      flex={1}
                      space={2}
                      alignItems={isArabic ? "flex-end" : "flex-start"}
                    >
                      <Text
                        bold
                        fontSize={16}
                        color={isDarkMode ? "white" : "gray.900"}
                      >
                        {order.productName}
                      </Text>
                      <Text color={isDarkMode ? "gray.400" : "gray.600"}>
                        {order.price.toFixed(2)} JOD
                      </Text>
                      <Text bold color={statusColor}>
                        {t("status")}: {orderStatus}
                      </Text>

                      {order.status.toLowerCase() === "قيد الانتظار" && (
                        <Button
                          colorScheme="red"
                          size="sm"
                          onPress={() => handleCancelOrder(order.id)}
                          leftIcon={
                            <Icon
                              as={MaterialIcons}
                              name="cancel"
                              size="sm"
                              color="white"
                            />
                          }
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