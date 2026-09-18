import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { formatDueDate } from '../lib/dueDate';

const DAY_MS = 1000 * 60 * 60 * 24;

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export default function CountdownScreen({ dueDate }: { dueDate: Date }) {
  const [now, setNow] = useState(() => new Date());

  // Recompute at midnight so the count flips on the right day.
  useEffect(() => {
    const t = new Date();
    t.setHours(24, 0, 5, 0);
    const ms = t.getTime() - Date.now();
    const id = setTimeout(() => setNow(new Date()), ms);
    return () => clearTimeout(id);
  }, [now]);

  const days = Math.round(
    (startOfDay(dueDate).getTime() - startOfDay(now).getTime()) / DAY_MS,
  );

  let headline: string;
  let sub: string;
  if (days > 1) {
    const weeks = Math.floor(days / 7);
    const rest = days % 7;
    headline = String(days);
    sub =
      weeks > 0
        ? `${weeks} week${weeks === 1 ? '' : 's'}${rest ? ` and ${rest} day${rest === 1 ? '' : 's'}` : ''} to go`
        : `${days} days to go`;
  } else if (days === 1) {
    headline = '1';
    sub = 'one more day to go';
  } else if (days === 0) {
    headline = 'Today';
    sub = 'the due date is today';
  } else {
    const since = -days;
    headline = String(since);
    sub = since === 1 ? 'day past the due date' : 'days past the due date';
  }

  const kicker = days > 0 ? 'Counting down to' : days === 0 ? 'The due date is here' : 'Due date passed';

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.name}>Mira</Text>
      <Text style={styles.count}>{headline}</Text>
      <Text style={styles.sub}>{sub}</Text>
      <Text style={styles.due}>{`Due ${formatDueDate(dueDate)}`}</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  kicker: {
    fontSize: 18,
    color: '#B08968',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  name: {
    fontSize: 64,
    fontWeight: '800',
    color: '#3E2F25',
    marginBottom: 32,
  },
  count: {
    fontSize: 120,
    fontWeight: '200',
    color: '#E07A5F',
    lineHeight: 130,
  },
  sub: {
    fontSize: 22,
    color: '#6B5D4F',
    marginTop: 8,
    marginBottom: 40,
  },
  due: {
    fontSize: 15,
    color: '#A08C7A',
  },
});
