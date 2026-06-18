// import { Ionicons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
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

import { alertKeys } from "../../constants/alertKeys";
import { appConstant } from "../../constants/appText";
import { storageKey } from "../../constants/storageKey";
import { useTheme } from "./theme/useTheme";

const Register = () => {
  const { theme, palette } = useTheme();
  const register = useAuthStore((s) => s.register);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert(appConstant.MISSING_FIELDS, appConstant.PLEASE_FILL_IN_ALL_FIELDS);
      return;
    }

    setLoading(true);
    try {
      await register(email, password, username);
      await AsyncStorage.setItem(storageKey.SAVED_EMAIL, email);
      await AsyncStorage.setItem(storageKey.SAVED_PASSWORD, password);

      Alert.alert(alertKeys.SUCCESS, appConstant.ACCOUNT_CREATED_SUCCESS, [
        { text: appConstant.OK, onPress: () => router.replace("/login") },
      ]);
    } catch (err: any) {
      Alert.alert(appConstant.ACCOUNT_CREATED_FAILED, err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
            <Text className="text-3xl font-bold" style={{ color: palette.textPrimary }}>Create account</Text>
            <Text className="mt-2 text-center" style={{ color: palette.textSecondary }}>
              {appConstant.STARTING_YOUR_JOURNEY}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="font-medium mb-2 ml-1" style={{ color: palette.textPrimary }}>{appConstant.USERNAME}</Text>
            <View className="flex-row items-center rounded-xl px-4 border" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
              <TextInput
                className="flex-1 py-4 px-3"
                style={{ color: palette.textPrimary }}
                placeholder="johndoe"
                placeholderTextColor={palette.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="font-medium mb-2 ml-1" style={{ color: palette.textPrimary }}>{appConstant.EMAIL}</Text>
            <View className="flex-row items-center rounded-xl px-4 border" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
              <Ionicons name="mail-outline" size={20} color={palette.textSecondary} />
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

          <View className="mb-6">
            <Text className="font-medium mb-2 ml-1" style={{ color: palette.textPrimary }}>{appConstant.PASSWORD}</Text>
            <View className="flex-row items-center rounded-xl px-4 border" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
              <Ionicons name="lock-closed-outline" size={20} color={palette.textSecondary} />
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
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={palette.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-blue-500 rounded-xl py-4 items-center mb-4 active:bg-blue-600"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">{appConstant.SIGN_UP}</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text style={{ color: palette.textSecondary }}>{appConstant.ALREADY_HAVE_AN_ACCOUNT}</Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text className="text-blue-500 font-semibold">{appConstant.SIGN_IN}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;