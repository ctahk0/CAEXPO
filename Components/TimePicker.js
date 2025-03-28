import React from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TimePickerComponent({ value, onChange, label }) {
  const [show, setShow] = React.useState(false);

  const showPicker = () => setShow(true);
  const handleChange = (event, selectedTime) => {
    setShow(false);
    if (selectedTime) onChange(selectedTime);
  };

  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={{ marginBottom: 5 }}>{label}</Text>

      {Platform.OS === 'web' ? (
        <input
          type="time"
          value={value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          onChange={(e) => {
            const [hours, minutes] = e.target.value.split(':');
            const newDate = new Date(value);
            newDate.setHours(hours);
            newDate.setMinutes(minutes);
            onChange(newDate);
          }}
          style={{
            padding: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            backgroundColor: '#fff',
            fontSize: 16,
          }}
        />
      ) : (
        <>
          <TouchableOpacity
            onPress={showPicker}
            style={{
              backgroundColor: '#fff',
              padding: 10,
              borderRadius: 5,
              borderColor: '#ccc',
              borderWidth: 1,
            }}
          >
            <Text>{value.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>

          {show && (
            <DateTimePicker
              value={value}
              mode="time"
              display="default"
              is24Hour={true}
              onChange={handleChange}
            />
          )}
        </>
      )}
    </View>
  );
}
