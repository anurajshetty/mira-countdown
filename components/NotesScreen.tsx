import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type Note = {
  id: number;
  author: string;
  message: string;
  created_at: string;
};

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setError(null);
    const { data, error } = await supabase
      .from('mira_notes')
      .select('id, author, message, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      setError('Couldn’t load notes — check your connection and try again.');
    } else {
      setNotes(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const send = async () => {
    if (!supabase) return;
    const name = author.trim();
    const text = message.trim();
    if (!name || !text) {
      setError('Add your name and a message first.');
      return;
    }
    setSending(true);
    setError(null);
    const { data, error } = await supabase
      .from('mira_notes')
      .insert({ author: name, message: text })
      .select('id, author, message, created_at')
      .single();
    setSending(false);
    if (error || !data) {
      setError('Couldn’t send the note — check your connection and try again.');
      return;
    }
    setNotes((prev) => [data, ...prev]);
    setMessage('');
  };

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.center}>
        <Text style={styles.offlineTitle}>Notes need a connection</Text>
        <Text style={styles.offlineText}>
          Family notes sync through Supabase. The countdown still works offline.
        </Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Notes for Mira</Text>
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#E07A5F" />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {error ?? 'No notes yet — leave the first one below.'}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.meta}>
                {item.author} · {timeAgo(item.created_at)}
              </Text>
            </View>
          )}
        />
      )}
      {error && !loading && <Text style={styles.error}>{error}</Text>}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={author}
          onChangeText={setAuthor}
          maxLength={40}
        />
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Can’t wait to meet you…"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={280}
        />
        <TouchableOpacity
          style={[styles.button, sending && styles.buttonDisabled]}
          onPress={send}
          disabled={sending}
        >
          <Text style={styles.buttonText}>
            {sending ? 'Sending…' : 'Leave a note'}
          </Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="dark" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F0',
    paddingTop: 64,
  },
  center: {
    flex: 1,
    backgroundColor: '#FFF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  offlineTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3E2F25',
    marginBottom: 8,
  },
  offlineText: {
    fontSize: 16,
    color: '#6B5D4F',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3E2F25',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  loader: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  empty: {
    fontSize: 16,
    color: '#A08C7A',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#3E2F25',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  message: {
    fontSize: 17,
    color: '#3E2F25',
    marginBottom: 8,
  },
  meta: {
    fontSize: 13,
    color: '#A08C7A',
  },
  error: {
    fontSize: 14,
    color: '#C0392B',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  form: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0E4D7',
    backgroundColor: '#FFF7F0',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0E4D7',
  },
  messageInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#E07A5F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
