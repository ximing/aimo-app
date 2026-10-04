import { apiPost } from '@/api/common';

/** Register this install's Huawei push token with the signed-in account. */
export async function registerPushDevice(token: string): Promise<void> {
  const response = await apiPost('/push-devices', { provider: 'huawei', token });
  if (response.code !== 0) {
    throw new Error(response.msg || '华为推送登记失败');
  }
}
