import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ⚙️ Postavi handler za Android (neophodno)
if (Platform.OS !== 'web') {
  console.log('Radi handler za notifikacije!!!');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH, // 🔊 Visok prioritet za zvuk
        sound: 'default', 
        vibrationPattern: [0, 250, 250, 250], // Dodaj vibraciju
        enableVibrate: true,
        enableLights: true,
        lightColor: '#FF231F7C',
      });
      console.log('✅ Android notifikacioni kanal kreiran!');
    } catch (error) {
      console.error('❌ Greška pri kreiranju notifikacionog kanala:', error);
    }
  }
}

// ✅ Funkcija za traženje dozvola za notifikacije
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') {
    console.warn('❌ Notifikacije nisu podržane na webu');
    return false;
  }

  await createNotificationChannel();

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.warn('📢 Dozvole za notifikacije nisu date');
    return false;
  }
  
  console.log('✅ Dozvole za notifikacije su date');
  return true;
}

export async function scheduleDailyNotification(hour, minute, days = null) {
  if (Platform.OS === 'web') return;

  const dayMap = {
    "Ned": 1,
    "Pon": 2,
    "Uto": 3,
    "Sri": 4,
    "Čet": 5,
    "Pet": 6,
    "Sub": 7,
  };

  if (days && Array.isArray(days) && days.length > 0) {
    for (const day of days) {
      const weekday = dayMap[day];
      if (!weekday) {
        console.warn(`❌ Nepoznat dan: ${day}`);
        continue;
      }

      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Podsjetnik!',
            body: `Ne zaboravi prijavu/odjavu. ✅ ${hour}:${minute.toString().padStart(2, '0')}`,
            sound: 'default', // Eksplicitno omogućavamo zvuk
          },
          trigger: {
            channelId: 'default', // Koristimo definisani kanal
            hour,
            minute,
            type: 'weekly',
            weekday,
            repeats: true,
          },
        });
        console.log(`✅ Notifikacija zakazana za ${day} u ${hour}:${minute}, ID: ${notificationId}`);
      } catch (error) {
        console.error(`❌ Greška pri zakazivanju notifikacije za ${day}:`, error);
      }
    }
  } else {
    console.log('🗑️ Otkazivanje svih notifikacija jer nema izabranih dana.');
    await cancelAllNotifications();
  }

  // await listScheduledNotifications();
}

// ✅ Funkcija za ispis svih zakazanih notifikacija (za debug)
export async function listScheduledNotifications() {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📋 Trenutno zakazane notifikacije: ${scheduledNotifications.length > 0 ? JSON.stringify(scheduledNotifications, null, 2) : '❌ Nema zakazanih notifikacija!'}`);
    return scheduledNotifications;
  } catch (error) {
    console.error('❌ Greška pri dohvatanju zakazanih notifikacija:', error);
    return [];
  }
}

// ✅ Funkcija za otkazivanje svih zakazanih notifikacija
export async function cancelAllNotifications() {
  if (Platform.OS === 'web') {
    console.warn('❌ Notifikacije nisu podržane na webu');
    return false;
  }
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🗑️ Sve zakazane notifikacije su obrisane.');
    return true;
  } catch (error) {
    console.error('❌ Greška pri otkazivanju notifikacija:', error);
    return false;
  }
}