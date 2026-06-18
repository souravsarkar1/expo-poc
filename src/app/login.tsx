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

const Login = () => {
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
        "Missing fields",
        "Please enter both email and password"
      );
      return;
    }

    setLoading(true);

    try {
      await login(email, password);

      // Save credentials for biometric login
      await AsyncStorage.setItem("savedEmail", email);
      await AsyncStorage.setItem("savedPassword", password);

      setHasSavedCredentials(true);

      router.replace("/(tabs)/course");
    } catch (err: any) {
      Alert.alert(
        "Login failed",
        err?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }

  };

  const handleBiometricLogin = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("savedEmail");
      const savedPassword = await AsyncStorage.getItem("savedPassword");

      if (!savedEmail || !savedPassword) {
        Alert.alert(
          "Biometric Login",
          "Please login with email and password first."
        );
        return;
      }

      const hasHardware =
        await LocalAuthentication.hasHardwareAsync();

      const isEnrolled =
        await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Biometric unavailable",
          "No biometric authentication is configured on this device."
        );
        return;
      }

      const result =
        await LocalAuthentication.authenticateAsync({
          promptMessage: "Login with Biometrics",
          cancelLabel: "Cancel",
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
        "Authentication failed",
        err?.message || "Unable to login with biometrics."
      );
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    const initialize = async () => {
      const savedEmail = await AsyncStorage.getItem("savedEmail");
      const savedPassword = await AsyncStorage.getItem("savedPassword");
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
          promptMessage: "Login with Biometrics",
          cancelLabel: "Cancel",
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
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      > <View className="flex-1 px-6 justify-center">
          <View className="mb-10 items-center">
            <View className="w-16 h-16 bg-blue-500 items-center justify-center mb-4">
              <Image
                source={require("../../assets/images/house_ed_tech.png")}
                style={{ height: 100, width: 200 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-bold text-gray-900">
              Welcome back
            </Text>

            <Text className="text-gray-500 mt-2 text-center">
              Sign in to continue learning
            </Text>
          </View>

          {/* Biometric Login */}
          {hasSavedCredentials && (
            <View className="mb-6 items-center">
              <TouchableOpacity
                onPress={handleBiometricLogin}
                disabled={loading}
                className="border border-blue-500 rounded-xl px-4 py-3 bg-blue-500"
              >
                <Text className="text-white font-medium">
                  Login with Biometrics
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Email */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2 ml-1">
              Email
            </Text>

            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 border border-gray-200">
              <TextInput
                className="flex-1 py-4 px-3 text-gray-900"
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mb-2">
            <Text className="text-gray-700 font-medium mb-2 ml-1">
              Password
            </Text>

            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 border border-gray-200">
              <TextInput
                className="flex-1 py-4 px-3 text-gray-900"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity className="flex-row items-center" onPress={() => setShowPassword((p) => !p)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity className="mb-6 self-end">
            <Text className="text-blue-500 font-medium">
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-blue-500 rounded-xl py-4 items-center mb-4"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-3 text-gray-400 text-sm">
              or
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Register */}
          <View className="flex-row justify-center">
            <Text className="text-gray-500">
              Don't have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/register")}
            >
              <Text className="text-blue-500 font-semibold ml-1">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>

  );
};

export default Login;
