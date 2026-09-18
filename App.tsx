import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CountdownScreen from './components/CountdownScreen';
import NotesScreen from './components/NotesScreen';
import { DEFAULT_DUE_DATE_ISO, fetchDueDate } from './lib/dueDate';

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function App() {
  const [tab, setTab] = useState<'countdown' | 'notes'>('countdown');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchDueDate().then(setDueDate);
  }, []);

  if (!dueDate) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#E07A5F" />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.screen}>
        {tab === 'countdown' ? (
          <CountdownScreen dueDate={dueDate} />
        ) : (
          <NotesScreen />
        )}
      </View>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'countdown' && styles.tabActive]}
          onPress={() => setTab('countdown')}
        >
          <Text
            style={[styles.tabText, tab === 'countdown' && styles.tabTextActive]}
          >
            Countdown
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'notes' && styles.tabActive]}
          onPress={() => setTab('notes')}
        >
          <Text style={[styles.tabText, tab === 'notes' && styles.tabTextActive]}>
            Notes
          </Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

// Exported for tests / debugging: the offline fallback date.
export const FALLBACK_DUE_DATE = parseIso(DEFAULT_DUE_DATE_ISO);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF7F0',
  },
  loading: {
    flex: 1,
    backgroundColor: '#FFF7F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0E4D7',
    backgroundColor: '#FFF7F0',
    paddingBottom: 24,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 12,
  },
  tabActive: {
    backgroundColor: '#FBE9DC',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A08C7A',
  },
  tabTextActive: {
    color: '#E07A5F',
  },
});
