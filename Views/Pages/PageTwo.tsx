import { View, Text, VStack, HStack, ScrollView, Pressable } from "native-base";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../Styles";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { useTranslation } from "react-i18next";
import { fetchCategories } from "../../store/categories/categoriesSlice";
import { ArrowLeft, ArrowDown2, ArrowUp2 } from "iconsax-react-native";
import { useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";

interface Category {
  id: string;
  name: string;
  parentId?: string;
  children?: Category[];
}

const PageTwo = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const categories = useSelector((state: RootState) => state.categories.items);
  const loading = useSelector((state: RootState) => state.categories.loading);

  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [childCategories, setChildCategories] = useState<{
    [key: string]: Category[];
  }>({});
  const [loadingChildren, setLoadingChildren] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("page one");
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    dispatch(fetchCategories())
      .unwrap()
      .catch((error) => console.error("Failed to fetch categories:", error));
  }, [dispatch]);

  const fetchChildCategories = async (categoryId: string) => {
    if (loadingChildren[categoryId]) return;

    try {
      setLoadingChildren((prev) => ({
        ...prev,
        [categoryId]: true,
      }));

      const response = await axios.get(
        `https://backend.j-byu.shop/api/categories/children/${categoryId}`
      );

      setChildCategories((prev) => ({
        ...prev,
        [categoryId]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching child categories:", error);
    } finally {
      setLoadingChildren((prev) => ({
        ...prev,
        [categoryId]: false,
      }));
    }
  };

  const toggleCategory = (category: Category) => {
    const categoryId = category.id;

    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));

    if (
      !expandedCategories[categoryId] &&
      (!childCategories[categoryId] || childCategories[categoryId].length === 0)
    ) {
      fetchChildCategories(categoryId);
    }
  };

  return (
    <ScrollView
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}
    >
      <VStack space={4} py={8}>
        {loading && <Text textAlign="center">{t("loading")}</Text>}

        {!loading &&
          categories.length > 0 &&
          categories.map((category) => (
            <View key={category.id}>
              <Pressable onPress={() => toggleCategory(category)}>
                <HStack
                  w={"full"}
                  px={4}
                  py={2}
                  rounded={4}
                  bgColor={"#171717"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <ArrowLeft size="24" color="#fff" variant="Bold" />
                  <Text fontWeight={"bold"} fontSize={16} color={"white"}>
                    {category.name}
                  </Text>
                  {category.children?.length > 0 &&
                    (expandedCategories[category.id] ? (
                      <ArrowUp2 size="24" color="#000" />
                    ) : (
                      <ArrowDown2 size="24" color="#000" />
                    ))}
                </HStack>
              </Pressable>

              {expandedCategories[category.id] && (
                <View>
                  {loadingChildren[category.id] ? (
                    <Text textAlign="center" py={2} color="amber.700">
                      {t("loading")}
                    </Text>
                  ) : childCategories[category.id]?.length > 0 ? (
                    childCategories[category.id].map((child: Category) => (
                      <Pressable
                        width={"full"}
                        alignItems={"flex-end"}
                        onPress={() =>
                          navigation.navigate("page two", {
                            screen: "men",
                            params: { categoryId: child.id },
                          })
                        }
                      >
                        <HStack
                          key={child.id}
                          w={"70%"}
                          px={8}
                          py={2}
                          rounded={4}
                          my={2}
                          bgColor={"#212121"}
                          alignItems={"center"}
                          justifyContent={"space-between"}
                        >
                          <ArrowLeft size="20" color="#fff" variant="Bold" />
                          <Text fontWeight={"bold"} fontSize={12} color={"white"}>
                            {child.name}
                          </Text>
                        </HStack>
                      </Pressable>
                    ))
                  ) : (
                    <Text textAlign="center" py={2} color="red.500">
                      {t("no_sections")}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
      </VStack>
    </ScrollView>
  );
};

export default PageTwo;