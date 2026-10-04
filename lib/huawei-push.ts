import { requireOptionalNativeModule } from 'expo';
import { PermissionsAndroid, Platform } from 'react-native';

import { registerPushDevice } from '@/api/push-device';
import { createHuaweiRegistrar } from '@/lib/huawei-push-sync';

type NativeHuaweiPush = {
  getToken(): Promise<string>;
};

const native: NativeHuaweiPush | null =
  Platform.OS === 'android' ? requireOptionalNativeModule<NativeHuaweiPush>('HuaweiPush') : null;

const registrar = native
  ? createHuaweiRegistrar({
      getToken: () => native.getToken(),
      register: (token) => registerPushDevice(token),
    })
  : null;

let permissionAsked = false;

async function ensureNotificationPermission(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const version =
    typeof Platform.Version === 'number' ? Platform.Version : Number.parseInt(String(Platform.Version), 10);
  if (!Number.isFinite(version) || version < 33) return;
  const perm = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  if (await PermissionsAndroid.check(perm)) return;
  if (permissionAsked) return;
  const result = await PermissionsAndroid.request(perm);
  if (
    result === PermissionsAndroid.RESULTS.GRANTED ||
    result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
  ) {
    permissionAsked = true;
  }
}

/** Show the system notification prompt. Safe before login. Android 12 and below have no prompt. */
export function askHuaweiNotificationPermission(): Promise<void> {
  return ensureNotificationPermission().catch(() => undefined);
}

/** Ask for notification permission, then register the Huawei token when one exists. */
export function syncHuaweiPush(): Promise<void> {
  const permission = askHuaweiNotificationPermission();
  if (!registrar) return permission;
  return permission.then(() => registrar.sync());
}
