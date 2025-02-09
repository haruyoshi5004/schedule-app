// App.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const addSchedule = (hour) => {
    setSchedules([...schedules, { date: selectedDate, hour, image: selectedImage }]);
    setSelectedImage(null);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setSelectedImage(result.uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>スケジュール管理アプリ</Text>
      <Button title="日付を選択" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <Text style={styles.selectedDate}>{selectedDate.toDateString()}</Text>
      <FlatList
        data={Array.from({ length: 24 }, (_, i) => i)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.timeSlot} onPress={() => addSchedule(item)}>
            <Text>{item}:00</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.toString()}
        numColumns={4}
      />
      <Button title="画像を選択" onPress={pickImage} />
      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.image} />}
      <FlatList
        data={schedules}
        renderItem={({ item }) => (
          <View style={styles.scheduleItem}>
            <Text>{item.date.toDateString()} {item.hour}:00</Text>
            {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  selectedDate: {
    fontSize: 18,
    marginVertical: 10,
  },
  timeSlot: {
    padding: 10,
    margin: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  scheduleItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    alignItems: 'center',
  },
});