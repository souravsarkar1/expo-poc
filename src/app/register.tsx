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

const Register = () => {
  const register = useAuthStore((s) => s.register);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Missing fields", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, username);
      await AsyncStorage.setItem("savedEmail", email);
      await AsyncStorage.setItem("savedPassword", password);

      Alert.alert("Success", "Account created! Please sign in.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (err: any) {
      Alert.alert("Registration failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Header */}
          <View className="mb-10 items-center">
            <View className="w-16 h-16 bg-blue-500 items-center justify-center mb-4">
              <Image
                source={require("../../assets/images/house_ed_tech.png")}
                style={{ height: 100, width: 200 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-bold text-gray-900">Create account</Text>
            <Text className="text-gray-500 mt-2 text-center">
              Start your learning journey today
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2 ml-1">Username</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 border border-gray-200">
              <TextInput
                className="flex-1 py-4 px-3 text-gray-900"
                placeholder="johndoe"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2 ml-1">Email</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 border border-gray-200">
              <Ionicons name="mail-outline" size={20} color="#9ca3af" />
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
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2 ml-1">Password</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 border border-gray-200">
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 py-4 px-3 text-gray-900"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9ca3af"
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
              <Text className="text-white font-semibold text-base">Sign Up</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text className="text-blue-500 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;