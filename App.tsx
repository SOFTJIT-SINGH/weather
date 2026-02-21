import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import './global.css';

const { width } = Dimensions.get('window');

// --- CONFIGURATION ---
const API_KEY = '9353ac0ef2834d651d814d94c4305ad6';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

interface WeatherData {
  main: { temp: number; humidity: number; feels_like: number; temp_max: number; temp_min: number; pressure: number };
  weather: [{ description: string; main: string }];
  name: string;
  wind: { speed: number };
  dt: number;
}

// --- DYNAMIC HELPERS ---
const getTheme = (condition: string) => {
  const c = condition.toLowerCase();
  if (c.includes('clear')) return { bg: 'bg-cyan-500', accent: 'text-yellow-200', msg: "Sun's out, shades on! 😎" };
  if (c.includes('cloud')) return { bg: 'bg-slate-500', accent: 'text-blue-100', msg: "A bit gloomy, stay cozy. ☁️" };
  if (c.includes('rain')) return { bg: 'bg-indigo-800', accent: 'text-blue-300', msg: "Don't forget the umbrella! ☔" };
  if (c.includes('thunder')) return { bg: 'bg-purple-900', accent: 'text-purple-300', msg: "Stay indoors, lightning's near! ⚡" };
  return { bg: 'bg-blue-600', accent: 'text-white', msg: "Have a great day! ✨" };
};

const CrystalCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <View className={`rounded-[45px] border-t border-l border-white/40 bg-white/10 shadow-2xl backdrop-blur-3xl ${className}`}>
    <View className="absolute inset-0 rounded-[45px] bg-white/5 opacity-50" />
    {children}
  </View>
);

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState('');
  
  const theme = weather ? getTheme(weather.weather[0].main) : { bg: 'bg-indigo-600', accent: 'text-white', msg: 'Welcome!' };

  const updateWeatherData = async (url: string) => {
    try {
      setLoading(true);
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
        setError(null);
        setCitySearch('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        setError('Location access denied');
        setLoading(false);
        return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    updateWeatherData(`${API_URL}?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&units=metric&appid=${API_KEY}`);
  };

  useEffect(() => { getLocation(); }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View className={`flex-1 ${theme.bg} transition-all duration-700`}>
        
        {/* Crystal Orb Decorations */}
        <View className="absolute -top-10 -right-20 h-96 w-96 rounded-full bg-white/20 blur-[80px]" />
        <View className="absolute top-[40%] -left-20 h-64 w-64 rounded-full bg-black/10 blur-[60px]" />

        <SafeAreaView className="flex-1">
          {/* Crystal Search Bar */}
          <View className="px-6 pt-4 pb-2">
            <View className="flex-row items-center bg-white/10 rounded-[25px] px-5 py-1 border border-white/20 backdrop-blur-lg">
              <TextInput
                className="flex-1 text-white h-12 text-lg font-light"
                placeholder="Search world weather..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={citySearch}
                onChangeText={setCitySearch}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  updateWeatherData(`${API_URL}?q=${citySearch}&units=metric&appid=${API_KEY}`);
                }}
              />
              <TouchableOpacity className="ml-2 bg-white/20 p-2 rounded-full">
                <Text className="text-lg">🔍</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={false} onRefresh={getLocation} tintColor="#fff" />}
          >
            <View className="px-6 pt-6">
              
              {/* Main City Info */}
              <View className="items-center mb-8">
                <View className="flex-row items-center justify-center">
                    <Text className="text-white/60 text-lg mr-2 font-medium tracking-widest">📍</Text>
                    <Text className="text-white text-3xl font-black uppercase tracking-tighter">{weather?.name}</Text>
                </View>
                <Text className="text-white/50 font-bold mt-1 tracking-widest uppercase text-[10px]">
                    {new Date().toDateString()}
                </Text>
              </View>

              {/* Central Crystal Display */}
              <CrystalCard className="p-10 items-center mb-8">
                <View className="absolute top-4 right-6">
                    <Text className="text-5xl opacity-80">
                        {weather ? (weather.weather[0].main.includes('Clear') ? '☀️' : '☁️') : '🌤️'}
                    </Text>
                </View>
                
                <Text className="text-[130px] font-thin text-white leading-[140px] tracking-tighter">
                    {weather ? Math.round(weather.main.temp) : '--'}
                    <Text className="text-4xl font-light text-white/40">°C</Text>
                </Text>
                
                <Text className={`text-sm font-bold tracking-[5px] uppercase mb-4 ${theme.accent}`}>
                    {weather?.weather[0].description}
                </Text>
                
                <View className="h-[1px] w-full bg-white/10 my-4" />
                
                <Text className="text-white/80 text-center italic font-medium px-4">
                    "{theme.msg}"
                </Text>
              </CrystalCard>

              {/* Sub-Stats Grid */}
              <View className="flex-row gap-4 mb-4">
                <CrystalCard className="flex-1 p-6 items-center">
                    <Text className="text-2xl mb-2">💨</Text>
                    <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest">Wind Speed</Text>
                    <Text className="text-white text-lg font-bold">{weather?.wind.speed} <Text className="text-[10px] font-light">m/s</Text></Text>
                </CrystalCard>
                <CrystalCard className="flex-1 p-6 items-center">
                    <Text className="text-2xl mb-2">💧</Text>
                    <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest">Humidity</Text>
                    <Text className="text-white text-lg font-bold">{weather?.main.humidity}<Text className="text-[10px] font-light">%</Text></Text>
                </CrystalCard>
              </View>

              {/* Glass Details List */}
              <View className="gap-y-3">
                 {[
                   {label: 'Feels Like', val: `${Math.round(weather?.main.feels_like || 0)}°C`, icon: '🌡️'},
                   {label: 'Pressure', val: `${weather?.main.pressure} hPa`, icon: '⏲️'},
                   {label: 'Max Today', val: `${Math.round(weather?.main.temp_max || 0)}°C`, icon: '📈'}
                 ].map((item, i) => (
                   <View key={i} className="flex-row justify-between items-center bg-white/5 border border-white/10 px-6 py-4 rounded-3xl">
                      <View className="flex-row items-center">
                        <Text className="mr-3 text-lg">{item.icon}</Text>
                        <Text className="text-white/70 font-bold uppercase tracking-widest text-[10px]">{item.label}</Text>
                      </View>
                      <Text className="text-white font-bold">{item.val}</Text>
                   </View>
                 ))}
              </View>

            </View>
          </ScrollView>

          {loading && (
            <View className="absolute inset-0 bg-black/20 backdrop-blur-md items-center justify-center">
                <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}