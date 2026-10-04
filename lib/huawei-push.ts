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
let asking = false;

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

async function requestSystemPermission(): Promise<boolean> {
  const version = androidApi();
  if (Number.isFinite(version) && version >= 33) {
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (result === PermissionsAndroid.RESULTS.GRANTED) return true;
  }
  return notificationsEnabled();
}

function confirmNotificationPermission(): void {
  if (promptShown) return;
  promptShown = true;
  Alert.alert('开启通知', '复习提醒需要通知权限。', [
    { text: '以后再说', style: 'cancel' },
    {
      text: '允许',
      onPress: () => {
        void requestSystemPermission()
          .then((granted) => {
            if (!granted) native?.openNotificationSettings();
          })
          .catch(() => undefined);
      },
    },
  ]);
}

/** Try the system prompt first. Show an in-app confirmation only when that does not grant access. */
export function askHuaweiNotificationPermission(): Promise<void> {
  if (Platform.OS !== 'android' || asking || promptShown) return Promise.resolve();
  if (notificationsEnabled()) return Promise.resolve();
  asking = true;
  return requestSystemPermission()
    .then((granted) => {
      if (!granted) confirmNotificationPermission();
    })
    .catch(() => confirmNotificationPermission())
    .finally(() => {
      asking = false;
    });
}

/** Register the Huawei token when one exists. Permission is asked separately. */
export function syncHuaweiPush(): Promise<void> {
  if (!registrar) return Promise.resolve();
  return registrar.sync();
}
