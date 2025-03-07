import React, { useState, useEffect } from "react";
import { Stack, Pressable, Text, Center, Switch, Popover, VStack, HStack, Box } from "native-base";
import { Setting2,Moon,Sun1 } from "iconsax-react-native";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../store/themeSlice";
import { setLanguage } from "../store/languageSlice";
import { RootState } from "../store/store";
import i18n from "../Locale/i18n";

const Header = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showSetting, setShowSetting] = useState<boolean>(false);
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const currentLanguage = useSelector((state: RootState) => state.language.currentLanguage);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 1000);
  };

  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
  }, [currentLanguage]);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    const themeMessage = isDarkMode ? i18n.t("lightMode") : i18n.t("darkMode");
    showMessage(themeMessage);
  };
  const handleThemePress = () => {
    dispatch(toggleTheme());
    const themeMessage = isDarkMode ? i18n.t("lightMode") : i18n.t("darkMode");
    showMessage(themeMessage);
  };
  const handleLanguageChange = (lang: string) => {
    dispatch(setLanguage(lang));
    setShowDropdown(false);
    showMessage(i18n.t("language") + `: ${lang}`);
  };

  return (
    <Stack width="100%" paddingX={8} paddingY={8} backgroundColor={ isDarkMode? 'black':"#FFF6DF"} position="relative">
      <HStack w={'full'} alignItems={'center'} justifyContent={'space-between'}>
      <Pressable onPress={() => setShowSetting(!showSetting)}>
        <Setting2 size="26" color="#F7CF9D" />
      </Pressable>
      <Pressable onPress={handleThemePress}> 
           {isDarkMode ? <Sun1 size="26" color="#F7CF9D" /> : <Moon size="26" color="#F7CF9D" />}
        </Pressable>
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
            backgroundColor="#F9D77E"
            p={5}
            rounded="8px"
            width="60%"
          >
      

            <HStack alignItems="center" justifyContent="space-between">
              <Text color={isDarkMode ? "white" : "black"}>{i18n.t("language")}</Text>
              <Popover
                isOpen={showDropdown}
                onClose={() => setShowDropdown(false)}
                trigger={(triggerProps) => (
                  <Pressable {...triggerProps} onPress={() => setShowDropdown(true)} bg={isDarkMode ? "#D4AF37" : "white"} padding={2} rounded="md">
                    <Text color={isDarkMode ? "white" : "black"}>
                      {currentLanguage === "ar" ? "العربية" : "English"}
                    </Text>
                  </Pressable>
                )}
              >
                <Popover.Content width="150px">
                  <Popover.Body>
                    <Box>
                      <Pressable onPress={() => {
                        handleLanguageChange("ar")
                        setShowSetting(false)}} mb={4}>
                        <Text>العربية</Text>
                      </Pressable>
                      <Pressable onPress={() => {handleLanguageChange("en")
                         setShowSetting(false)
                      }}>
                        <Text>English</Text>
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

export default Header;
