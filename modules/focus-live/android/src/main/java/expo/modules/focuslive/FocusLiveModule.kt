package expo.modules.focuslive

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Gobblo Plus: the focus timer on the lock screen (Android).
 * One ongoing, silent notification with a system countdown (Chronometer), so it keeps ticking
 * even while the app is asleep. No background JS needed. Tapping it reopens Focus.
 */
class FocusLiveModule : Module() {
  private val channelId = "focus-live"
  private val notificationId = 4217

  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("No React context")

  private val manager: NotificationManager
    get() = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

  override fun definition() = ModuleDefinition {
    Name("FocusLive")

    Function("isSupported") {
      manager.areNotificationsEnabled()
    }

    // running: endsAt is a wall-clock time in ms; the system counts down to it
    Function("showRunning") { endsAt: Double, title: String, text: String, uri: String ->
      notify(build(title, text, uri).apply {
        setWhen(endsAt.toLong())
        setShowWhen(true)
        setUsesChronometer(true)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) setChronometerCountDown(true)
        // leave at zero instead of counting into negative; the app's own "time's up" alert follows
        val left = endsAt.toLong() - System.currentTimeMillis()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && left > 0) setTimeoutAfter(left + 1000)
      })
    }

    // paused (or time's up): a still line, no ticking
    Function("showStill") { title: String, text: String, uri: String ->
      notify(build(title, text, uri).apply { setShowWhen(false) })
    }

    Function("hide") {
      manager.cancel(notificationId)
    }
  }

  private fun ensureChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    if (manager.getNotificationChannel(channelId) != null) return
    val channel = NotificationChannel(channelId, "Focus timer", NotificationManager.IMPORTANCE_LOW).apply {
      description = "Your focus timer on the lock screen while a session runs"
      setShowBadge(false)
      lockscreenVisibility = Notification.VISIBILITY_PUBLIC
    }
    manager.createNotificationChannel(channel)
  }

  @Suppress("DEPRECATION")
  private fun build(title: String, text: String, uri: String): Notification.Builder {
    ensureChannel()
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(context, channelId)
    } else {
      Notification.Builder(context).setPriority(Notification.PRIORITY_LOW)
    }
    val open = Intent(Intent.ACTION_VIEW, Uri.parse(uri)).apply {
      setPackage(context.packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }
    val pending = PendingIntent.getActivity(
      context, notificationId, open,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    builder
      .setSmallIcon(context.applicationInfo.icon)
      .setContentTitle(title)
      .setContentText(text)
      .setContentIntent(pending)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setCategory(Notification.CATEGORY_PROGRESS)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
    requestPromotedOngoing(builder)
    return builder
  }

  /** Android 16+ "Live Updates": ask to be promoted to the status bar chip / lock screen. */
  private fun requestPromotedOngoing(builder: Notification.Builder) {
    if (Build.VERSION.SDK_INT < 36) return
    try {
      builder.javaClass.getMethod("setRequestPromotedOngoing", Boolean::class.javaPrimitiveType).invoke(builder, true)
    } catch (_: Throwable) {
      // older SDK stubs or OEM builds without the API: a normal ongoing notification is fine
    }
  }

  private fun notify(builder: Notification.Builder) {
    if (!manager.areNotificationsEnabled()) return
    manager.notify(notificationId, builder.build())
  }
}
