import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Platform, View, Text, Button, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [schedules, setSchedules] = useState<{ date: Date; hour: number; image: string | null; text: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scheduleText, setScheduleText] = useState('');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('通知の許可が必要です。');
    }
  };

  const onDateChange = (event: any, date: Date | undefined) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const addSchedule = () => {
    if (selectedHour === null) {
      alert('時間を選択してください。');
      return;
    }
    const newSchedule = {
      date: selectedDate,
      hour: selectedHour,
      image: selectedImage,
      text: scheduleText,
    };
    setSchedules([...schedules, newSchedule]);
    setSelectedImage(null);
    setScheduleText('');
    setSelectedHour(null);
    scheduleNotification(newSchedule);
  };

  const deleteSchedule = (index: number) => {
    const newSchedules = schedules.filter((_, i) => i !== index);
    setSchedules(newSchedules);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const scheduleNotification = async (schedule: { date: Date; hour: number; image: string | null; text: string }) => {
    const notificationDate = new Date(schedule.date);
    notificationDate.setHours(schedule.hour - 24); // 1日前に設定
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'スケジュール通知',
        body: `${schedule.text} - ${schedule.date.toDateString()} ${schedule.hour}:00`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationDate,
      },
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>

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
        <TextInput
          style={styles.input}
          placeholder="スケジュールを入力"
          value={scheduleText}
          onChangeText={setScheduleText}
        />
        <FlatList
          data={Array.from({ length: 24 }, (_, i) => i)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.timeSlot} onPress={() => setSelectedHour(item)}>
              <Text style={selectedHour === item ? styles.selectedTimeSlot : undefined}>{item}:00</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.toString()}
          numColumns={4}
        />
        <Button title="画像を選択" onPress={pickImage} />
        {selectedImage && <Image source={{ uri: selectedImage }} style={styles.image} />}
        <Button title="登録" onPress={addSchedule} />
        <FlatList
          data={schedules}
          renderItem={({ item, index }) => (
            <View style={styles.scheduleItem}>
              <Text>{item.date.toDateString()} {item.hour}:00</Text>
              <Text>{item.text}</Text>
              {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
              <Button title="削除" onPress={() => deleteSchedule(index)} />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <StatusBar style="auto" />
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  timeSlot: {
    padding: 10,
    margin: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  selectedTimeSlot: {
    backgroundColor: '#aaa',
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
