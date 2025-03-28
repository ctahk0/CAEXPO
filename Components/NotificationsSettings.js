import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TimePickerComponent from './TimePicker';
import { saveData, getData } from '../utils/storage';
import { scheduleDailyNotification, cancelAllNotifications, listScheduledNotifications } from '../utils/notifications';
import Toast from 'react-native-toast-message';

export default function NotificationsSettings() {
  const [time1, setTime1] = useState({ hour: 8, minute: 0 });
  const [time2, setTime2] = useState({ hour: 14, minute: 30 });
  const [showPicker1, setShowPicker1] = useState(false);
  const [showPicker2, setShowPicker2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const daysOfWeek = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];
  const [selectedDays, setSelectedDays] = useState(["Pon", "Uto", "Sri", "Čet", "Pet"]);

  useEffect(() => {
    loadNotificationTimes();
  }, []);

  const loadNotificationTimes = async () => {
    try {
      const [stored1, stored2, storedDays] = await Promise.all([
        getData("notification1Time"),
        getData("notification2Time"),
        getData("notificationDays"),
      ]);

      if (stored1) setTime1(JSON.parse(stored1));
      if (stored2) setTime2(JSON.parse(stored2));
      if (storedDays) setSelectedDays(JSON.parse(storedDays));
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Greška', text2: `Neuspešno učitavanje vremena: ${error.message}` });
    }
  };

  const saveTimes = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        saveData("notification1Time", JSON.stringify(time1)),
        saveData("notification2Time", JSON.stringify(time2)),
        saveData("notificationDays", JSON.stringify(selectedDays)),
      ]);

      await cancelAllNotifications();

      if (!(time1.hour === 0 && time1.minute === 0)) {
        await scheduleDailyNotification(time1.hour, time1.minute, selectedDays);
      }
      if (!(time2.hour === 0 && time2.minute === 0)) {
        await scheduleDailyNotification(time2.hour, time2.minute, selectedDays);
      }
    //   listScheduledNotifications();
      Toast.show({ type: 'success', text1: 'Uspešno', text2: 'Notifikacije sačuvane i zakazane!' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Greška', text2: `Neuspešno snimanje notifikacija: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.daysContainer}>
        {daysOfWeek.map(day => (
          <TouchableOpacity
            key={day}
            onPress={() => {
              setSelectedDays(prev =>
                prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
              );
            }}
            style={[
              styles.dayButton,
              { backgroundColor: selectedDays.includes(day) ? 'blue' : '#ccc' },
            ]}
          >
            <Text style={styles.dayText}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vrijeme 1 */}
      <View style={styles.timeSection}>
        <Text style={styles.timeLabel}>
          ⏰ Vrijeme 1: {time1.hour}:{time1.minute.toString().padStart(2, '0')}
        </Text>
        <TouchableOpacity onPress={() => setTime1({ hour: 0, minute: 0 })}>
          <Text style={styles.resetIcon}>❌</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setShowPicker1(true)}>
        <Text style={styles.changeText}>Promijeni</Text>
      </TouchableOpacity>
      {showPicker1 && (
        <TimePickerComponent
          label="Vrijeme prve notifikacije"
          value={new Date(0, 0, 0, time1.hour, time1.minute)}
          onChange={(newTime) =>
            setTime1({ hour: newTime.getHours(), minute: newTime.getMinutes() })
          }
        />
      )}

      {/* Vrijeme 2 */}
      <View style={styles.timeSection}>
        <Text style={styles.timeLabel}>
          ⏰ Vrijeme 2: {time2.hour}:{time2.minute.toString().padStart(2, '0')}
        </Text>
        <TouchableOpacity onPress={() => setTime2({ hour: 0, minute: 0 })}>
          <Text style={styles.resetIcon}>❌</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setShowPicker2(true)}>
        <Text style={styles.changeText}>Promijeni</Text>
      </TouchableOpacity>
      {showPicker2 && (
        <TimePickerComponent
          label="Vrijeme druge notifikacije"
          value={new Date(0, 0, 0, time2.hour, time2.minute)}
          onChange={(newTime) =>
            setTime2({ hour: newTime.getHours(), minute: newTime.getMinutes() })
          }
        />
      )}

      <TouchableOpacity
        onPress={saveTimes}
        style={styles.btn1}
        disabled={isLoading}
      >
        <Text style={styles.btnText}>Sačuvaj i zakaži</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  dayButton: { padding: 5, margin: 5, borderRadius: 7 },
  dayText: { color: 'white' },
  timeSection: { marginTop: 20, flexDirection: 'row', alignItems: 'center' },
  timeLabel: { flex: 1, fontSize: 16 },
  resetIcon: { color: 'red', fontSize: 16, marginLeft: 10 },
  changeText: { color: 'blue', marginTop: 5 },
  btn1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: 'green',
    borderColor: 'green',
  },
  btnText: { fontSize: 18, lineHeight: 26, fontWeight: '600', color: '#fff' },
});