/**
 * Memos Layout - 单一 Memo 列表布局
 */

import { Stack } from "expo-router";
import React from "react";

export default function MemosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
    </Stack>
  );
}
