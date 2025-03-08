import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const resources = {
  en: {
    translation: {
      switchTheme: "Switch Theme",
      lightMode: "Switched to Light Mode",
      darkMode: "Switched to Dark Mode",
      language: "Language",
      Home: "Home",
      Explore: "Explore",
      Carte: "Carte",
      setting: "Settinges",
      myProfil: "Me",
      product_1: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
      product_13: "Men Green Solid Zippered Full-Zip Slim Fit Bomber Jacket",
      product_25: "Boys Orange Colourblocked Hooded Sweatshirt",
      Add_to_cart: "Add to cart",
      new_registration: "New Registration",
      username: "Username",
      username_placeholder: "Enter your username",
      phone_number: "Phone Number",
      phone_placeholder: "9876543210",
      terms_conditions: "Terms and Conditions",
      accept: "Accept",
      username_required: "Please enter a username",
      phone_required: "Please enter a phone number",
      registration_successful: "Registration successful",
      register: "Register",
      login: "Login",
      confirm_code: "Confirm Code",
      enter_code: "Enter the code sent to {{phone}}",
      otp_required: "OTP is required",
      otp_invalid: "Invalid OTP",
      confirmation_success: "Confirmation successful",
      did_not_receive_code: "Didn't receive the OTP?",
      resend: "Resend",
      confirm: "Confirm",
      have_account: "Do you have an account?",
      visit_as_a_guest: "visit as a guest",
      searchPlaceholder: "Search...",
      newProductsLabel: "New",
      productsLabel: "Products",
      show_all: "show all",
      Select_Size: "Select Size",
      Select_Color: "Select Color",
      Please_select_size_and_color: "Please select size and color",
      "Guest User": "Guest User",
      "Email not available": "Email not available",
      Edit: "Edit",
      "Saved Addresses": "Saved Addresses",
      "No Addresses Found": "No Addresses Found",
      Policy: "Policy",
      "Privacy Policy": "Privacy Policy",
      View: "View",
      "Terms and Conditions": "Terms and Conditions",
      "Order Tracking": "Order Tracking",
      "Current Orders": "Current Orders",
      Track: "Track",
      "Past Orders": "Past Orders",
      Logout: "Logout",
      New: "New",
      Products: "Products",
      product_image: "Product Image",
      price_each: "${{price}} each",
      color: "Color",
      "N/A": "N/A",
      size: "Size",
      remove: "Remove",
      total: "Total",
      clear_cart: "Clear Cart",
      password: "Password",
      password_placeholder: "Enter password",
      password_required: "Password is required",
      forgot_password: "Forgot Password?",
      recovery_password: "Recovery Password",
      new_password: "New Password",
      back_to_login: "Back to Login Page",
      area: "Area",
      area_placeholder: "Enter area",
      address: "Address",
      address_placeholder: "Enter address",
      Sales: "Sales",
      profile: "Profile",
      edit_name: "Edit Name",
      name: "Name",
      update: "Update",
      edit_address: "Edit Address",
      upload_image: "Upload Image",
      change_image: "Change Image",
      save_changes: "Save Changes",
      edit_profile: "Edit Profile",
      cancel: "Cancel",
      policy_title: "Usage Policy",
      privacy_policy_title: "Privacy Policy",
      privacy_policy_content:
        "We are committed to protecting your privacy and ensuring your data is secure.",
      terms_conditions_title: "Terms and Conditions",
      terms_conditions_content:
        "Please read the terms and conditions carefully before using our services.",
      data_usage_title: "Data Usage",
      data_usage_content:
        "Data is used to improve user experience and ensure efficient performance.",
      terms_title: "Terms and Conditions",
      acceptance_of_terms_title: "Acceptance of Terms",
      acceptance_of_terms_content:
        "By using the app, you agree to be bound by these terms.",
      user_responsibilities_title: "User Responsibilities",
      user_responsibilities_content:
        "Users must comply with all local laws and use the app lawfully.",
      modifications_title: "Modifications",
      modifications_content:
        "We reserve the right to modify these terms at any time without prior notice.",
      no_orders: "No Orders",
      my_orders: "My orders",
      send_order: "Send order",
      on_the_way: "On the way",
      in_cart: "In Cart",
      removed: "Removed",
      status: "status",
      cancel_order: "Cancel Order",
      explore_products: "Explore Products",
      resend_in: "Resend in",
      enter_phone: "Enter your phone number",
      next: "Next",
      save_changes_error: "Failed to save changes",
      error_no_token: "No session token found",
      error_fetch_profile: "Failed to fetch profile",
      save_changes_success: "Changes saved successfully",
      select_all: "Select All",
      deselect_all: "Deselect All",
      subtotal: "Subtotal",
      delivery_price: "Delivery Price",
      code_placeholder: "Enter verification code",
      resend_code: "Resend Code",
      reset_password: "Reset Password",
      code_required: "Verification code is required",
      invalid_phone_number: "Invalid phone number",
      code_resent: "Code resent successfully",
      login_successful: "Login successful",
      order_submitted_success: "Order submitted successfully",
      order_submission_failed: "Order submission failed",
      order_cancelled_success: "Order cancelled successfully",
      "No Connection": "No Connection",
      NoProductsAvailable: "No Products Available",
    },
  },
  ar: {
    translation: {
      switchTheme: "تبديل الوضع",
      lightMode: "الوضع الفاتح مفعل",
      darkMode: "الوضع الداكن مفعل",
      language: "اللغة",
      Home: "الرئيسة",
      Explore: "استكشف",
      Carte: "السلة",
      setting: "الاعدادات",
      myProfil: "حسابي",
      product_1: "بلوزة بأكمام مخططة وياقة ملتفة بحافة بيبلوم",
      product_13: "جاكيت بومبر أخضر بسحاب كامل ضيق للرجال",
      product_25: "هودي ملون للأطفال باللون البرتقالي",
      Add_to_cart: "اضف الى السلة",
      new_registration: "تسجيل جديد",
      username: "اسم المستخدم",
      username_placeholder: "أدخل اسم المستخدم",
      phone_number: "رقم الهاتف",
      phone_placeholder: "9876543210",
      terms_conditions: "الشروط و الاحكام",
      accept: "قبول",
      username_required: "يرجى إدخال اسم المستخدم",
      phone_required: "يرجى إدخال رقم الهاتف",
      registration_successful: "تم التسجيل",
      register: "تسجيل",
      login: "تسجيل دخول",
      confirm_code: "تأكيد الرمز",
      enter_code: "ادخل الرمز المرسل الي {{phone}}",
      otp_required: "رمز OTP مطلوب",
      otp_invalid: "رمز OTP غير صالح",
      confirmation_success: "تم التأكيد",
      did_not_receive_code: "الم تتلقي رمز ال OTP؟",
      resend: "اعادة ارسال",
      confirm: "تأكيد",
      have_account: "هل لديك حساب؟",
      visit_as_a_guest: "زيارة كضيف",
      searchPlaceholder: "ابحث...",
      newProductsLabel: "جديدة",
      productsLabel: "منتجات",
      show_all: "إظهار الكل",
      Select_Size: "اختر الحجم",
      Select_Color: "اختر اللون",
      Please_select_size_and_color: "يرجى اختيار الحجم واللون",
      "Guest User": "ضيف",
      "Email not available": "البريد الإلكتروني غير متوفر",
      Edit: "تعديل",
      "Saved Addresses": "العناوين المحفوظة",
      "No Addresses Found": "لا توجد عناوين محفوظة",
      Policy: "السياسة",
      "Privacy Policy": "سياسة الخصوصية",
      View: "عرض",
      "Terms and Conditions": "الشروط والأحكام",
      "Order Tracking": "تتبع الطلبات",
      "Current Orders": "الطلبات الحالية",
      Track: "تتبع",
      "Past Orders": "الطلبات السابقة",
      Logout: "تسجيل الخروج",
      New: "جديد",
      Products: "المنتجات",
      product_image: "صورة المنتج",
      price_each: "${{price}} لكل قطعة",
      color: "اللون",
      "N/A": "غير متوفر",
      size: "الحجم",
      remove: "إزالة",
      total: "الإجمالي",
      clear_cart: "تفريغ السلة",
      password: "كلمة المرور",
      password_placeholder: "أدخل كلمة المرور",
      password_required: "كلمة المرور مطلوبة",
      forgot_password: "هل نسيت كلمة المرور؟",
      recovery_password: "استعادة كلمة المرور",
      new_password: "كلمة مرور جديدة",
      back_to_login: "العودة إلى صفحة تسجيل الدخول",
      area: "المنطقة",
      area_placeholder: "أدخل المنطقة",
      address: "العنوان",
      address_placeholder: "أدخل العنوان",
      Sales: "تخفيضات",
      profile: "الملف الشخصي",
      edit_name: "تعديل الاسم",
      name: "الاسم",
      update: "تحديث",
      edit_address: "تعديل العنوان",
      upload_image: "رفع صورة",
      change_image: "تغيير الصورة",
      save_changes: "حفظ التغييرات",
      edit_profile: "تعديل الملف الشخصي",
      cancel: "إلغاء",
      policy_title: "سياسة الاستخدام",
      privacy_policy_title: "سياسة الخصوصية",
      privacy_policy_content:
        "نحن ملتزمون بحماية خصوصيتك وضمان أن بياناتك آمنة.",
      terms_conditions_title: "الشروط والأحكام",
      terms_conditions_content:
        "يرجى قراءة الشروط والأحكام بعناية قبل استخدام خدماتنا.",
      data_usage_title: "استخدام البيانات",
      data_usage_content:
        "يتم استخدام البيانات لتحسين تجربة المستخدم وضمان الأداء الفعال.",
      terms_title: "الشروط والأحكام",
      acceptance_of_terms_title: "قبول الشروط",
      acceptance_of_terms_content:
        "باستخدامك للتطبيق، فإنك توافق على الالتزام بهذه الشروط.",
      user_responsibilities_title: "مسؤوليات المستخدم",
      user_responsibilities_content:
        "يتعين على المستخدم الالتزام بجميع القوانين المحلية واستخدام التطبيق بشكل قانوني.",
      modifications_title: "التعديلات",
      modifications_content:
        "نحتفظ بالحق في تعديل هذه الشروط في أي وقت دون إشعار مسبق.",
      no_orders: "لا يوجد طلبات",
      my_orders: "طلبياتي",
      send_order: "إرسال الطلب",
      on_the_way: "في الطريق",
      in_cart: "في السلة",
      removed: "تمت ازالته",
      status: "الحالة",
      cancel_order: "الغاء الطلب",
      explore_products: "استكشف منتجاتنا",
      resend_in: "إعادة الإرسال في",
      enter_phone: "أدخل رقم هاتفك",
      next: "التالي",
      save_changes_error: "فشل حفظ التغييرات",
      error_no_token: "لم يتم العثور على رمز الجلسة",
      error_fetch_profile: "فشل في جلب الملف الشخصي",
      save_changes_success: "تم حفظ التغييرات بنجاح",
      select_all: "اختر الكل",
      deselect_all: "إلغاء اختيار الكل",
      subtotal: "المجموع الفرعي",
      delivery_price: "سعر التوصيل",
      code_placeholder: "أدخل رمز التحقق",
      resend_code: "إعادة إرسال الرمز",
      reset_password: "إعادة تعيين كلمة المرور",
      code_required: "رمز التحقق مطلوب",
      invalid_phone_number: "رقم الهاتف غير صالح",
      code_resent: "تم إعادة إرسال الرمز بنجاح",
      login_successful: "تم تسجيل الدخول بنجاح",
      order_submitted_success: "تم تقديم الطلب بنجاح",
      order_submission_failed: "فشل تقديم الطلب",
      order_cancelled_success: "تم إلغاء الطلب بنجاح",
      "No Connection": "لا يوجد اتصال",
      NoProductsAvailable: "لا توجد منتجات متاحة",
    },
  },
};
const getInitialLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem("language");
    return savedLanguage || "ar";
  } catch (error) {
    console.error("Error loading language from AsyncStorage:", error);
    return "ar"; // Fallback to 'ar'
  }
};
const initializeI18n = async () => {
  const lng = await getInitialLanguage();
  await i18n.use(initReactI18next).init({
    resources,
    lng, // Use saved language instead of hardcoded "ar"
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false,
    },
  });
};

// Call initialization (this runs once when the module is imported)
initializeI18n();

export default i18n;
