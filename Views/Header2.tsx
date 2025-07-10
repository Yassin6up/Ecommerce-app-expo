import React, { useState, useEffect } from "react";
import { Stack, Pressable, Text, Center, Switch, Popover, VStack, HStack, Box, Input, Icon } from "native-base";
import { Setting2, Moon, Sun1, SearchNormal1, Notification } from "iconsax-react-native";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../store/themeSlice";
import { setLanguage } from "../store/languageSlice";
import { RootState } from "../store/store";
import i18n from "../Locale/i18n";
import { Keyboard } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { I18nManager } from "react-native";

const Header2 = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showSetting, setShowSetting] = useState<boolean>(false);
  const navigation = useNavigation<any>();
 
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const currentLanguage = useSelector((state: RootState) => state.language.currentLanguage);

  const [searchQuery, setSearchQuery] = useState("");

  // Define black-and-white color scheme
  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF";
  const primaryTextColor = isDarkMode ? "#FFFFFF" : "#000000"; // Titles, input text
  const secondaryTextColor = isDarkMode ? "#CCCCCC" : "#333333"; // Placeholders
  const dropdownBgColor = isDarkMode ? "#1A1A1A" : "#F5F5F5"; // Slightly off for contrast
  const inputBgColor = isDarkMode ? "#1A1A1A" : "#F5F5F5"; // Input background
  const borderColor = isDarkMode ? "#FFFFFF" : "#000000";
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000";

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    navigation.navigate("page two", { 
      screen: "men", 
      params: { 
        isSearch: true, 
        searchText: text,
        // Add timestamp to force re-render
        timestamp: Date.now() 
      } 
    });
  };

  const handleSearchSubmit = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigation.navigate("page two", { 
        screen: "men", 
        params: { 
          isSearch: true, 
          searchText: trimmedQuery,
          timestamp: Date.now()
        } 
      });
      Keyboard.dismiss();
    }
  };

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 1000);
  };

  const handleThemePress = () => {
    dispatch(toggleTheme());
    const themeMessage = isDarkMode ? i18n.t("lightMode") : i18n.t("darkMode");
    showMessage(themeMessage);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    dispatch(setLanguage(lang));
    setShowDropdown(false);
    showMessage(i18n.t("language") + `: ${lang}`);
  };

  const isRTL = currentLanguage === "ar" || I18nManager.isRTL;

  return (
    <Stack 
      width="100%" 
      paddingX={8} 
      paddingTop={12} 
      paddingBottom={2} 
      backgroundColor={backgroundColor} 
      position="relative"
    > 
      <HStack w={'full'} alignItems={'center'} justifyContent={'space-between'}>
        {/* Notification Icon (RTL/LTR aware) */}
        {isRTL ? null : (
          <Pressable onPress={() => navigation.navigate('NotificationScreen')}>
            <Notification size="26" color={iconColor} variant="Bold" />
          </Pressable>
        )}
        {/* Settings Icon */}
        <Pressable onPress={() => setShowSetting(!showSetting)}>
          <Setting2 size="26" color={iconColor} />
        </Pressable>
        {/* Search Box */}
        <Box 
          width="70%" 
          variant="filled" 
          bgColor={inputBgColor} 
          borderRadius="8" 
          borderWidth={1} 
          borderColor={borderColor}
        >
          <Input
            variant="unstyled"
            _focus={{ backgroundColor: "transparent", borderColor: primaryTextColor }}
            bg="transparent"
            borderWidth={0}
            placeholder={i18n.t("searchPlaceholder") || "Search..."}
            placeholderTextColor={secondaryTextColor}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            InputLeftElement={
              <Icon 
                as={<SearchNormal1 />} 
                size={5} 
                ml={2} 
                color={iconColor} 
              />
            }
            color={primaryTextColor}
          />
        </Box>
        {/* Theme Toggle Icon */}
        <Pressable onPress={handleThemePress}>
          {isDarkMode ? <Sun1 size="26" color={iconColor} /> : <Moon size="26" color={iconColor} />}
        </Pressable>
        {/* Notification Icon for RTL */}
        {isRTL ? (
          <Pressable onPress={() => navigation.navigate('NotificationScreen')}>
            <Notification size="26" color={iconColor} variant="Bold" />
          </Pressable>
        ) : null}
      </HStack>

      {showSetting && (
        <Box 
          position="absolute" 
          top={20}
          left={5}
          zIndex={10}
          width="100%"
        >
          <VStack
            space={4}
            backgroundColor={dropdownBgColor}
            p={5}
            rounded="8px"
            width="60%"
          >
            <HStack alignItems="center" justifyContent="space-between">
              <Text color={primaryTextColor}>{i18n.t("language")}</Text>
              <Popover
                isOpen={showDropdown}
                onClose={() => setShowDropdown(false)}
                trigger={(triggerProps) => (
                  <Pressable 
                    {...triggerProps} 
                    onPress={() => setShowDropdown(true)} 
                    bg={dropdownBgColor} 
                    padding={2} 
                    rounded="md"
                    borderWidth={1}
                    borderColor={primaryTextColor}
                  >
                    <Text color={primaryTextColor}>
                      {currentLanguage === "ar" ? "العربية" : "English"}
                    </Text>
                  </Pressable>
                )}
              >
                <Popover.Content width="150px" bg={dropdownBgColor}>
                  <Popover.Body bg={dropdownBgColor}>
                    <Box  bg={dropdownBgColor} >
                      <Pressable 
                        onPress={() => {
                          handleLanguageChange("ar");
                          setShowSetting(false);
                        }} 
                        mb={4}
                    
                      >
                        <Text color={primaryTextColor}>العربية</Text>
                      </Pressable>
                      <Pressable 
                           
                        onPress={() => {
                          handleLanguageChange("en");
                          setShowSetting(false);
                        }}
                      >
                        <Text color={primaryTextColor}>English</Text>
                      </Pressable>
                    </Box>
                  </Popover.Body>
                </Popover.Content>
              </Popover>
            </HStack>
          </VStack>
        </Box>
      )}
    </Stack>
  );
};

export default Header2;