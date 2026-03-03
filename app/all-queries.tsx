/*
 * SPDX-FileCopyrightText: 2026 Antonio Seoane De Ois
 *
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { fetchAPI, Note, formatDate } from '../constants/api';

export default function AllQueriesScreen() {
    const router = useRouter();
    const [queries, setQueries] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);

    const loadQueries = async () => {
        setLoading(true);
        try {
            const notes: Note[] = await fetchAPI('/brain');
            const filtered = notes.filter(n => n.category === 'query');
            setQueries(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadQueries();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.headerRow}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                    <ChevronLeft size={28} color="#000" />
                    <Text style={styles.headerTitle}>Queries</Text>
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator style={{ marginTop: 50 }} /> : null}

            <FlatList
                data={queries}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.queryRow}
                        onPress={() => router.push({
                            pathname: "/detail",
                            params: { item: JSON.stringify(item), mode: 'knowledge' }
                        })}
                    >
                        <Text style={styles.queryTitle}>{item.title}</Text>
                        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>NO QUERIES YET</Text>
                        </View>
                    ) : null
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, marginBottom: 10 },
    headerTitle: { fontSize: 24, fontWeight: '600', color: '#000' },
    scrollContent: { padding: 25, paddingBottom: 100 },
    queryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    queryTitle: { fontSize: 16, color: '#0A0A0A', flex: 1, marginRight: 10 },
    dateText: { fontSize: 11, color: '#9B9B9B', letterSpacing: 0.5 },
    emptyState: { marginTop: 100, alignItems: 'center' },
    emptyText: { color: '#AAA', fontWeight: '800', fontSize: 12, letterSpacing: 2 }
});
