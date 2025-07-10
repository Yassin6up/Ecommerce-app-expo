import React, { useState, useEffect, useCallback } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Swiper from "react-native-swiper";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { VStack, Image, Text, Pressable, Box, Button } from "native-base";
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import logo from "../../assets/logo.png";
import axios from "axios";

const { width } = Dimensions.get("window");

export default function Adds() {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t, i18n } = useTranslation();
  const navigation: any = useNavigation();
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isArabic = i18n.language === "ar";

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await axios.get("https://backend.j-byu.shop/api/sliders/all");
        setSliders(response.data);
      } catch (err) {
        setError("Failed to load sliders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSliders();
  }, []);

  const handleBannerPress = useCallback(
    (item: any) => {
      if (item.link && item.link !== "null" && typeof item.link === "string") {
        const productIdMatch = item.link.match(/\/products\/(\d+)/);
        const productId = productIdMatch ? productIdMatch[1] : null;
        if (productId) {
          navigation.navigate("page two", {
            screen: "ProductDetails",
            params: { item, id: productId },
          });
        } else {
          console.log("No valid product ID found in link:", item.link);
        }
      } else {
        console.log("No valid link for slider:", item.id);
      }
    },
    [navigation]
  );

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" backgroundColor={'black'}>
        <Image
          source={logo}
          alt="App Logo"
          width={100}
          height={100}
          resizeMode="contain"
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <VStack
      style={[
        styles.container,
        isDarkMode ? styles.darkBackground : styles.lightBackground,
      ]}
      space={4}
      alignItems="center"
      justifyContent="center"
    >
      <VStack
        w={"full"}
        alignItems={"center"}
        justifyContent={"center"}
        mb={8}
      >
        <Text
          style={[
            isDarkMode ? styles.darkText : styles.lightText,
            { fontSize: 22,  letterSpacing: 1,lineHeight:30 },
          ]}
        >
          {t("Sales")}
        </Text>
      </VStack>
      <Box style={styles.swiperContainer}>
        <Swiper
          loop
          autoplay
          autoplayTimeout={3}
          showsPagination
          dotStyle={{ backgroundColor: isDarkMode ? "#333" : "rgba(0,0,0,0.2)", width: 8, height: 8, borderRadius: 4 }}
          activeDotStyle={{ backgroundColor: "#F7CF9D", width: 12, height: 12, borderRadius: 6 }}
          width={width}
          height={250}
        >
          {sliders.map((slider: any) => (
            <Pressable
              key={slider.id}
              onPress={() => handleBannerPress(slider)}
              style={styles.bannerContainer}
            >
              <Image
                source={{
                  uri: `https://backend.j-byu.shop/api/slider/img/${slider.image}`,
                }}
                alt={slider.text}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              {/* Gradient overlay for text and button */}
              <LinearGradient
                colors={['transparent', isDarkMode ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.55)']}
                style={styles.gradientOverlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <VStack px={5} pb={4} pt={12} alignItems={isArabic ? 'flex-end' : 'flex-start'}>
                  {slider.text ? (
                    <Text
                      style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6, textAlign: isArabic ? 'right' : 'left' }}
                      numberOfLines={2}
                    >
                      {slider.text}
                    </Text>
                  ) : null}
                  {/* <Button
                    size="sm"
                    borderRadius={20}
                    px={6}
                    bg="#F7CF9D"
                    _text={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}
                    shadow={2}
                    mt={2}
                  >
                    {t('View')}
                  </Button> */}
                </VStack>
              </LinearGradient>
            </Pressable>
          ))}
        </Swiper>
      </Box>
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  darkBackground: {
    backgroundColor: "#121212",
  },
  lightBackground: {
    backgroundColor: "#f9f9f9",
  },
  swiperContainer: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  bannerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    width: width,
  },
  bannerImage: {
    width: width,
    height: 250,
    borderRadius: 18,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    justifyContent: 'flex-end',
  },
  lightText: {
    color: "black",
  },
  darkText: {
    color: "white",
  },
});