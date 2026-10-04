package expo.modules.huaweipush

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class HuaweiPushModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HuaweiPush")

    Function("notificationsEnabled") {
      val ctx = appContext.reactContext
      if (ctx == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
        false
      } else {
        val manager = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.areNotificationsEnabled()
      }
    }

    Function("openNotificationSettings") {
      val ctx = appContext.currentActivity ?: appContext.reactContext
      if (ctx != null) {
        val packageName = ctx.packageName
        val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
          putExtra(Settings.EXTRA_APP_PACKAGE, packageName)
          putExtra("app_package", packageName)
          putExtra("app_uid", ctx.applicationInfo.uid)
          if (ctx !is android.app.Activity) addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        ctx.startActivity(intent)
      }
    }

    AsyncFunction("getToken") { promise: Promise ->
      val ctx = appContext.reactContext
      if (ctx == null) {
        promise.resolve("")
        return@AsyncFunction
      }
      Thread {
        promise.resolve(fetchHuaweiToken(ctx))
      }.start()
    }
  }
}
