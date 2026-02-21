/**
 * Date Filter Dropdown Component - 日期筛选下拉组件
 *
 * 功能：
 * - 点击展开日期范围选择下拉
 * - 选项：全部时间、最近7天、最近30天、自定义范围
 * - 自定义范围使用日期选择器选择起止日期
 * - 选中的筛选条件在按钮上显示标签
 */

import { MaterialIcons } from "@expo/vector-icons";
import { view } from "@rabjs/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/hooks/use-theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export type DateFilterOption = "all" | "last7days" | "last30days" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

interface DateFilterDropdownProps {
  /** 当前选中的日期筛选选项 */
  selectedOption: DateFilterOption;
  /** 自定义日期范围（当 selectedOption 为 'custom' 时使用） */
  customRange?: DateRange;
  /** 选择日期筛选选项时的回调 */
  onSelectOption: (option: DateFilterOption, range?: DateRange) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

// 获取日期筛选选项的显示文本
const getOptionDisplayText = (option: DateFilterOption): string => {
  switch (option) {
    case "all":
      return "全部时间";
    case "last7days":
      return "7天内";
    case "last30days":
      return "30天内";
    case "custom":
      return "自定义";
    default:
      return "日期";
  }
};

// 获取日期筛选选项对应的日期范围
const getDateRangeForOption = (option: DateFilterOption): DateRange | undefined => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (option) {
    case "last7days": {
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "last30days": {
      const start = new Date(end);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    default:
      return undefined;
  }
};

export const DateFilterDropdown = view(
  ({
    selectedOption,
    customRange,
    onSelectOption,
    disabled = false,
  }: DateFilterDropdownProps) => {
    const theme = useTheme();
    const [visible, setVisible] = useState(false);
    const [tempCustomRange, setTempCustomRange] = useState<DateRange | undefined>(customRange);

    // 动画值
    const scaleY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    // 触发动画
    useEffect(() => {
      if (visible) {
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [visible, scaleY, opacity]);

    // 同步临时自定义范围
    useEffect(() => {
      if (visible) {
        setTempCustomRange(customRange);
      }
    }, [visible, customRange]);

    // 打开下拉
    const handleOpen = useCallback(() => {
      if (!disabled) {
        setVisible(true);
      }
    }, [disabled]);

    // 关闭下拉
    const handleClose = useCallback(() => {
      setVisible(false);
    }, []);

    // 处理选项选择
    const handleSelectOption = useCallback(
      (option: DateFilterOption) => {
        if (option === "custom") {
          // 自定义范围需要特殊处理，暂时不关闭下拉
          // 用户需要设置起止日期
          if (!tempCustomRange) {
            // 默认设置为最近7天
            const defaultRange = getDateRangeForOption("last7days");
            setTempCustomRange(defaultRange);
          }
        } else {
          const range = getDateRangeForOption(option);
          onSelectOption(option, range);
          handleClose();
        }
      },
      [onSelectOption, handleClose, tempCustomRange]
    );

    // 处理自定义范围确认
    const handleCustomRangeConfirm = useCallback(() => {
      if (tempCustomRange) {
        onSelectOption("custom", tempCustomRange);
        handleClose();
      }
    }, [onSelectOption, handleClose, tempCustomRange]);

    // 处理自定义范围取消
    const handleCustomRangeCancel = useCallback(() => {
      handleClose();
    }, [handleClose]);

    // 设置开始日期（简化版：使用预设天数）
    const handleSetStartDaysAgo = useCallback((days: number) => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(start.getDate() - days + 1);
      start.setHours(0, 0, 0, 0);
      setTempCustomRange({ start, end });
    }, []);

    // 获取按钮显示文本
    const getButtonText = (): string => {
      if (selectedOption === "custom" && customRange) {
        const formatDate = (date: Date) => {
          return `${date.getMonth() + 1}/${date.getDate()}`;
        };
        return `${formatDate(customRange.start)}-${formatDate(customRange.end)}`;
      }
      return getOptionDisplayText(selectedOption);
    };

    // 是否已选择非默认选项
    const isActive = selectedOption !== "all";

    // 格式化日期显示
    const formatDateDisplay = (date: Date) => {
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
    };

    return (
      <>
        {/* 触发按钮 */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            isActive && { borderColor: theme.colors.primary },
            disabled && styles.filterButtonDisabled,
          ]}
          onPress={handleOpen}
          activeOpacity={disabled ? 1 : 0.7}
          disabled={disabled}
        >
          <MaterialIcons
            name="calendar-today"
            size={16}
            color={isActive ? theme.colors.primary : theme.colors.foregroundSecondary}
          />
          <Text
            style={[
              styles.filterButtonText,
              { color: isActive ? theme.colors.primary : theme.colors.foregroundSecondary },
            ]}
            numberOfLines={1}
          >
            {getButtonText()}
          </Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={16}
            color={isActive ? theme.colors.primary : theme.colors.foregroundTertiary}
          />
        </TouchableOpacity>

        {/* 下拉菜单 Modal */}
        <Modal
          visible={visible}
          transparent
          animationType="none"
          onRequestClose={handleClose}
        >
          <View style={styles.modalContainer}>
            {/* 背景遮罩 */}
            <Pressable style={styles.backdrop} onPress={handleClose}>
              <Animated.View
                style={[
                  styles.backdropAnimated,
                  { opacity, backgroundColor: theme.colors.overlay },
                ]}
              />
            </Pressable>

            {/* 下拉内容 */}
            <Animated.View
              style={[
                styles.dropdownContainer,
                {
                  backgroundColor: theme.colors.card,
                  transform: [{ scaleY }],
                  opacity,
                },
              ]}
            >
              {/* 选项列表 */}
              {selectedOption !== "custom" && (
                <>
                  {(["all", "last7days", "last30days", "custom"] as DateFilterOption[]).map(
                    (option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.optionItem,
                          selectedOption === option && [
                            styles.optionItemSelected,
                            { backgroundColor: theme.colors.primary + "15" },
                          ],
                        ]}
                        onPress={() => handleSelectOption(option)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            {
                              color:
                                selectedOption === option
                                  ? theme.colors.primary
                                  : theme.colors.foreground,
                            },
                          ]}
                        >
                          {getOptionDisplayText(option)}
                        </Text>
                        {selectedOption === option && (
                          <MaterialIcons
                            name="check"
                            size={20}
                            color={theme.colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    )
                  )}
                </>
              )}

              {/* 自定义范围设置 */}
              {selectedOption === "custom" && tempCustomRange && (
                <View style={styles.customRangeContainer}>
                  <Text style={[styles.customRangeTitle, { color: theme.colors.foregroundSecondary }]}>
                    选择日期范围
                  </Text>

                  {/* 预设选项 */}
                  <View style={styles.presetButtons}>
                    {[3, 7, 14, 30].map((days) => (
                      <TouchableOpacity
                        key={days}
                        style={[
                          styles.presetButton,
                          { borderColor: theme.colors.border },
                        ]}
                        onPress={() => handleSetStartDaysAgo(days)}
                      >
                        <Text
                          style={[
                            styles.presetButtonText,
                            { color: theme.colors.foregroundSecondary },
                          ]}
                        >
                          {days}天
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* 日期显示 */}
                  <View style={styles.dateDisplayContainer}>
                    <View style={styles.dateDisplay}>
                      <Text style={[styles.dateLabel, { color: theme.colors.foregroundTertiary }]}>
                        开始
                      </Text>
                      <Text style={[styles.dateValue, { color: theme.colors.foreground }]}>
                        {formatDateDisplay(tempCustomRange.start)}
                      </Text>
                    </View>
                    <Text style={[styles.dateSeparator, { color: theme.colors.foregroundTertiary }]}>
                      -
                    </Text>
                    <View style={styles.dateDisplay}>
                      <Text style={[styles.dateLabel, { color: theme.colors.foregroundTertiary }]}>
                        结束
                      </Text>
                      <Text style={[styles.dateValue, { color: theme.colors.foreground }]}>
                        {formatDateDisplay(tempCustomRange.end)}
                      </Text>
                    </View>
                  </View>

                  {/* 操作按钮 */}
                  <View style={styles.customRangeActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={handleCustomRangeCancel}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.colors.foregroundSecondary }]}>
                        取消
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.confirmButton,
                        { backgroundColor: theme.colors.primary },
                      ]}
                      onPress={handleCustomRangeConfirm}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.colors.primaryForeground }]}>
                        确认
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Animated.View>
          </View>
        </Modal>
      </>
    );
  }
);

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    gap: 4,
    maxWidth: 120,
  },
  filterButtonDisabled: {
    opacity: 0.5,
  },
  filterButtonText: {
    fontSize: 13,
    marginHorizontal: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 140,
    paddingLeft: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropAnimated: {
    flex: 1,
  },
  dropdownContainer: {
    position: "absolute",
    left: 16,
    top: 130,
    minWidth: 160,
    maxWidth: SCREEN_WIDTH - 32,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionItemSelected: {
    borderRadius: 0,
  },
  optionText: {
    fontSize: 15,
  },
  customRangeContainer: {
    padding: 16,
  },
  customRangeTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  presetButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetButtonText: {
    fontSize: 13,
  },
  dateDisplayContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 12,
  },
  dateDisplay: {
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  dateSeparator: {
    fontSize: 16,
    fontWeight: "500",
  },
  customRangeActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  confirmButton: {},
  actionButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
});

export default DateFilterDropdown;
