/**
 * Authentication Page - 登录/注册页面
 */

import { useTheme } from "@/hooks/use-theme";
import AuthService from "@/services/auth-service";
import type { LoginRequest, RegisterRequest } from "@/types/auth";
import { bindServices, useService } from "@rabjs/react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type AuthMode = "login" | "register";

const AuthContent = () => {
  const router = useRouter();
  const theme = useTheme();
  const authService = useService(AuthService);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("提示", "请填写邮箱和密码");
      return;
    }

    try {
      const loginRequest: LoginRequest = {
        email: email.trim(),
        password: password.trim(),
      };
      await authService.login(loginRequest);

      // 登录成功，跳转到 memos 列表
      router.replace("/(memos)");
    } catch (error) {
      Alert.alert("登录失败", authService.error || "请检查邮箱和密码");
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("提示", "请填写所有必填项");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("提示", "两次输入的密码不一致");
      return;
    }

    if (password.length < 6) {
      Alert.alert("提示", "密码长度至少为 6 位");
      return;
    }

    try {
      const registerRequest: RegisterRequest = {
        email: email.trim(),
        password: password.trim(),
        nickname: nickname.trim() || undefined,
      };
      await authService.register(registerRequest);

      Alert.alert("注册成功", "请使用注册邮箱和密码登录", [
        {
          text: "前往登录",
          onPress: () => {
            setMode("login");
            setPassword("");
            setConfirmPassword("");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("注册失败", authService.error || "请稍后重试");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>Memo App</Text>
        <Text style={[styles.subtitle, { color: theme.colors.foregroundSecondary }]}>
          {mode === "login" ? "登录您的账户" : "创建新账户"}
        </Text>
      </View>

      <View style={styles.form}>
        {/* 邮箱输入框 */}
        <TextInput
          style={[styles.input, { color: theme.colors.foreground, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
          placeholder="邮箱"
          placeholderTextColor={theme.colors.foregroundTertiary}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!authService.loading}
        />

        {/* 密码输入框 */}
        <TextInput
          style={[styles.input, { color: theme.colors.foreground, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
          placeholder="密码"
          placeholderTextColor={theme.colors.foregroundTertiary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!authService.loading}
        />

        {/* 注册模式下的额外字段 */}
        {mode === "register" && (
          <>
            <TextInput
              style={[styles.input, { color: theme.colors.foreground, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
              placeholder="确认密码"
              placeholderTextColor={theme.colors.foregroundTertiary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!authService.loading}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.foreground, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
              placeholder="昵称（可选）"
              placeholderTextColor={theme.colors.foregroundTertiary}
              value={nickname}
              onChangeText={setNickname}
              editable={!authService.loading}
            />
          </>
        )}

        {/* 错误提示 */}
        {authService.error && (
          <Text style={[styles.errorText, { color: theme.colors.destructive }]}>{authService.error}</Text>
        )}

        {/* 提交按钮 */}
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
            authService.loading && styles.buttonDisabled,
          ]}
          onPress={mode === "login" ? handleLogin : handleRegister}
          disabled={authService.loading}
        >
          {authService.loading ? (
            <ActivityIndicator color={theme.colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.colors.primaryForeground }]}>
              {mode === "login" ? "登录" : "注册"}
            </Text>
          )}
        </TouchableOpacity>

        {/* 模式切换 */}
        <View style={styles.switchMode}>
          <Text style={[styles.switchText, { color: theme.colors.foreground }]}>
            {mode === "login" ? "还没有账户？" : "已有账户？"}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setMode(mode === "login" ? "register" : "login");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setNickname("");
              authService.clearError();
            }}
            disabled={authService.loading}
          >
            <Text style={[styles.switchLink, { color: theme.colors.primary }]}>
              {mode === "login" ? "立即注册" : "前往登录"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default bindServices(AuthContent, []);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    marginBottom: 12,
    fontSize: 14,
  },
  switchMode: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  switchText: {
    fontSize: 14,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
