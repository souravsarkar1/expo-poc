import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../../stores/authStore";

import { appConstant } from "../../constants/appText";
import { storageKey } from "../../constants/storageKey";
import { useTheme } from "./theme/useTheme";

const Login = () => {
  const { theme, palette } = useTheme();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        appConstant.MISSING_FIELDS,
        appConstant.PLEASE_ENTER_BOTH_EMAIL_AND_PASSWORD
      );
      return;
    }

    setLoading(true);

    try {
      await login(email, password);

      await AsyncStorage.setItem(storageKey.SAVED_EMAIL, email);
      await AsyncStorage.setItem(storageKey.SAVED_PASSWORD, password);

      setHasSavedCredentials(true);

      router.replace("/(tabs)/course");
    } catch (err: any) {
      Alert.alert(
        appConstant.LOGIN_FAILED,
        err?.message || appConstant.SOMETHING_WENT_WRONG
      );
    } finally {
      setLoading(false);
    }

  };

  const handleBiometricLogin = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem(storageKey.SAVED_EMAIL);
      const savedPassword = await AsyncStorage.getItem(storageKey.SAVED_PASSWORD);

      if (!savedEmail || !savedPassword) {
        Alert.alert(
          appConstant.BIOMETRIC_LOGIN,
          appConstant.BIOMETRIC_LOGIN_MESSAGE
        );
        return;
      }

      const hasHardware =
        await LocalAuthentication.hasHardwareAsync();

      const isEnrolled =
        await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          appConstant.BIOMETRIC_UNAVAILABLE,
          appConstant.BIOMETRIC_UNAVAILABLE_MESSAGE
        );
        return;
      }

      const result =
        await LocalAuthentication.authenticateAsync({
          promptMessage: appConstant.LOGIN_BIOMETRICS,
          cancelLabel: appConstant.CANCEL,
          disableDeviceFallback: true,
        });

      if (!result.success) {
        return;
      }

      setLoading(true);

      await login(savedEmail, savedPassword);

      router.replace("/(tabs)/course");
    } catch (err: any) {
      Alert.alert(
        appConstant.AUTHENTICATION_FAILED,
        err?.message || appConstant.UNABLE_TO_LOGIN
      );
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    const initialize = async () => {
      const savedEmail = await AsyncStorage.getItem(storageKey.SAVED_EMAIL);
      const savedPassword = await AsyncStorage.getItem(storageKey.SAVED_PASSWORD);
      const credentialsExist =
        !!savedEmail && !!savedPassword;

      setHasSavedCredentials(credentialsExist);

      if (!credentialsExist) return;

      const hasHardware =
        await LocalAuthentication.hasHardwareAsync();

      const isEnrolled =
        await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) return;

      const result =
        await LocalAuthentication.authenticateAsync({
          promptMessage: appConstant.LOGIN_BIOMETRICS,
          cancelLabel: appConstant.CANCEL,
          disableDeviceFallback: true,
        });

      if (result.success) {
        try {
          setLoading(true);

          await login(savedEmail, savedPassword);

          router.replace("/(tabs)/course");
        } catch (error) {
          console.log(error);
          router.push("/register")
        } finally {
          setLoading(false);
        }
      }
    };

    initialize();

  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/course");
    }
  }, [isAuthenticated]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ backgroundColor: palette.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 justify-center">
          <View className="mb-10 items-center">
            <View className="w-16 h-16 bg-blue-500 items-center justify-center mb-4">
              <Image
                source={require("../../assets/images/house_ed_tech.png")}
                style={{ height: 100, width: 200 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-bold" style={{ color: palette.textPrimary }}>
              {appConstant.WELCOME_BACK}
            </Text>

            <Text className="mt-2 text-center" style={{ color: palette.textSecondary }}>
              {appConstant.SIGN_IN_TO_CONTINUE_LEARNING}
            </Text>
          </View>

          {hasSavedCredentials && (
            <View className="mb-6 items-center">
              <TouchableOpacity
                onPress={handleBiometricLogin}
                disabled={loading}
                className="border border-blue-500 rounded-xl px-4 py-3 bg-blue-500"
              >
                <Text className="text-white font-medium">
                  {appConstant.LOGIN_BIOMETRICS}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="mb-4">
            <Text className="font-medium mb-2 ml-1" style={{ color: palette.textPrimary }}>
              {appConstant.EMAIL}
            </Text>

            <View className="flex-row items-center rounded-xl px-4 border" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
              <TextInput
                className="flex-1 py-4 px-3"
                style={{ color: palette.textPrimary }}
                placeholder={appConstant.EMIL_PLACEHOLDER}
                placeholderTextColor={palette.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View className="mb-2">
            <Text className="font-medium mb-2 ml-1" style={{ color: palette.textPrimary }}>
              {appConstant.PASSWORD}
            </Text>

            <View className="flex-row items-center rounded-xl px-4 border" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
              <TextInput
                className="flex-1 py-4 px-3"
                style={{ color: palette.textPrimary }}
                placeholder="••••••••"
                placeholderTextColor={palette.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity className="flex-row items-center" onPress={() => setShowPassword((p) => !p)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={palette.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity className="mb-6 self-end">
            <Text className="text-blue-500 font-medium">
              {appConstant.FORGOT_PASSWORD}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-blue-500 rounded-xl py-4 items-center mb-4"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                {appConstant.SIGN_IN}
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px" style={{ backgroundColor: palette.border }} />
            <Text className="mx-3 text-sm" style={{ color: palette.textSecondary }}>
              or
            </Text>
            <View className="flex-1 h-px" style={{ backgroundColor: palette.border }} />
          </View>

          <View className="flex-row justify-center">
            <Text style={{ color: palette.textSecondary }}>
              {appConstant.DON_T_HAVE_AN_ACCOUNT}
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/register")}
            >
              <Text className="text-blue-500 font-semibold ml-1">
                {appConstant.SIGN_UP}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>

  );
};

export default Login;
