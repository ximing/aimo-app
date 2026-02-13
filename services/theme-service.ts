/**
 * 主题服务
 * 
 * 管理应用主题状态，支持强制设置主题模式
 * 
 * 功能：
 * - 跟随系统主题（默认）
 * - 强制浅色模式
 * - 强制深色模式
 * - 持久化主题设置
 */

import { Service } from '@rabjs/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const THEME_STORAGE_KEY = '@theme_mode';

export type ThemeMode = 'light' | 'dark' | 'auto';

class ThemeService extends Service {
  /**
   * 当前主题模式
   * - 'auto': 跟随系统（默认）
   * - 'light': 强制浅色
   * - 'dark': 强制深色
   */
  mode: ThemeMode = 'auto';

  /**
   * 系统当前颜色方案
   */
  systemColorScheme: 'light' | 'dark' = Appearance.getColorScheme() ?? 'light';

  /**
   * 实际使用的颜色方案（计算属性）
   */
  get colorScheme(): 'light' | 'dark' {
    if (this.mode === 'auto') {
      return this.systemColorScheme;
    }
    return this.mode;
  }

  /**
   * 是否为深色模式
   */
  get isDark(): boolean {
    return this.colorScheme === 'dark';
  }

  /**
   * 是否为浅色模式
   */
  get isLight(): boolean {
    return this.colorScheme === 'light';
  }

  /**
   * 初始化主题服务
   */
  async initialize() {
    try {
      // 从存储中加载主题设置
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && this.isValidMode(savedMode)) {
        this.mode = savedMode as ThemeMode;
      }

      // 监听系统主题变化
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        this.systemColorScheme = colorScheme ?? 'light';
      });

      // 返回清理函数
      return () => subscription.remove();
    } catch (error) {
      console.error('Failed to initialize theme service:', error);
    }
  }

  /**
   * 设置主题模式
   */
  async setMode(mode: ThemeMode) {
    try {
      this.mode = mode;
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  }

  /**
   * 切换到浅色模式
   */
  async setLightMode() {
    await this.setMode('light');
  }

  /**
   * 切换到深色模式
   */
  async setDarkMode() {
    await this.setMode('dark');
  }

  /**
   * 切换到自动模式（跟随系统）
   */
  async setAutoMode() {
    await this.setMode('auto');
  }

  /**
   * 切换主题（在浅色和深色之间）
   */
  async toggleTheme() {
    const newMode = this.colorScheme === 'light' ? 'dark' : 'light';
    await this.setMode(newMode);
  }

  /**
   * 验证主题模式是否有效
   */
  private isValidMode(mode: string): mode is ThemeMode {
    return mode === 'light' || mode === 'dark' || mode === 'auto';
  }
}

export default ThemeService;
