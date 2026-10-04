import { requireOptionalNativeModule } from 'expo';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

import { registerPushDevice } from '@/api/push-device';
import { createHuaweiRegistrar } from '@/lib/huawei-push-sync';

type NativeHuaweiPush = {
  getToken(): Promise<string>;
  notificationsEnabled(): boolean;
  openNotificationSettings(): void;
};

const native: NativeHuaweiPush | null =
  Platform.OS === 'android' ? requireOptionalNativeModule<NativeHuaweiPush>('HuaweiPush') : null;

const registrar = native
  ? createHuaweiRegistrar({
      getToken: () => native.getToken(),
      register: (token) => registerPushDevice(token),
    })
  : null;

let promptShown = false;

function androidApi(): number {
  const version = Platform.Version;
  return typeof version === 'number' ? version : Number.parseInt(String(version), 10);
}

function notificationsEnabled(): boolean {
  if (native) {
    try {
      return native.notificationsEnabled();
    } catch {
      return false;
    }
  }
  return false;
}

async function requestSystemPermission(): Promise<void> {
  const version = androidApi();
  if (Number.isFinite(version) && version >= 33) {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }
  if (notificationsEnabled()) return;
  native?.openNotificationSettings();
}

/**
 * Show an in-app prompt first. The system dialog is requested from the button tap,
 * because Huawei and other vendors drop a permission request that fires on launch.
 */
export function askHuaweiNotificationPermission(): Promise<void> {
  if (Platform.OS !== 'android' || promptShown) return Promise.resolve();
  if (notificationsEnabled()) return Promise.resolve();
  promptShown = true;
  Alert.alert('开启通知', '复习提醒需要系统通知权限。请点「允许」，再在系统弹窗里确认。', [
    { text: '以后再说', style: 'cancel' },
    {
      text: '允许',
      onPress: () => {
        void requestSystemPermission().catch(() => undefined);
      },
    },
  ]);
  return Promise.resolve();
}

/** Register the Huawei token when one exists. Permission is asked separately. */
export function syncHuaweiPush(): Promise<void> {
  if (!registrar) return Promise.resolve();
  return registrar.sync();
}
