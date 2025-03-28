import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// 🟢 Handler za prikaz notifikacija (za Android i iOS)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const createNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
      console.log('✅ Kanal za notifikacije kreiran!');
    } catch (error) {
      console.error('❌ Greška pri kreiranju kanala za notifikacije:', error);
    }
  }
};

// ✅ Funkcija za zakazivanje notifikacija svaki dan u isto vreme
export async function scheduleNotificationAt(hour, minute) {
  if (Platform.OS === 'web') {
    console.warn('📢 Notifikacije nisu podržane na webu!');
    return;
  }

  console.log(`📅 Zakazujem notifikaciju za ${hour}:${minute}`);

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏳ Podsjetnik!',
        body: `Ne zaboravi odjavu sa posla. ✅`,
        sound: null,
      },
      trigger: {
        hour,   // 🕒 Sat (lokalno vreme)
        minute, // ⏳ Minut (lokalno vreme)
        repeats: true, // 🔁 Ponavljaj svaki dan
      },
    });

    console.log(`✅ Notifikacija zakazana za ${hour}:${minute} svaki dan!`);
  } catch (error) {
    console.error('❌ Greška pri zakazivanju notifikacije:', error);
  }
}

// ✅ Funkcija za listanje svih zakazanih notifikacija (debug)
export async function listScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📋 Trenutno zakazane notifikacije:', notifications);

    if (notifications.length === 0) {
      console.log('❌ Nema zakazanih notifikacija!');
    } else {
      notifications.forEach((notification, index) => {
        console.log(`📌 Notifikacija ${index + 1}:`, {
          id: notification.identifier,
          content: notification.content,
          trigger: notification.trigger,
        });
      });
    }
  } catch (error) {
    console.error('❌ Greška pri dohvaćanju zakazanih notifikacija:', error);
  }
}

// ✅ Hook koji automatski zakazuje notifikaciju kada se aplikacija pokrene
export function useNotificationScheduler(hour, minute) {
  useEffect(() => {
    const setupNotifications = async () => {
      await createNotificationChannel();
      await scheduleNotificationAt(hour, minute);
      await listScheduledNotifications(); // Provjeri nakon zakazivanja
    };

    setupNotifications();
  }, [hour, minute]);
}