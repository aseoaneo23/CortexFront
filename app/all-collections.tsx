/*
 * SPDX-FileCopyrightText: 2026 Antonio Seoane De Ois
 *
 * SPDX-License-Identifier: MIT
 */


import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { fetchAPI, Note, parseTags } from '../constants/api';

export default function AllCollectionsScreen() {
    const router = useRouter();
    const [collections, setCollections] = useState<{ name: string, count: number }[]>([]);
    const [loading, setLoading] = useState(false);

    const loadCollections = async () => {
        setLoading(true);
        try {
            const notes: Note[] = await fetchAPI('/brain');
            const grouped: Record<string, number> = {};
            notes.forEach(n => {
                if (n.category !== 'task') {
                    const cat = (n.category || 'reference').toUpperCase();
                    grouped[cat] = (grouped[cat] || 0) + 1;
                }
            });
            const data = Object.entries(grouped).map(([name, count]) => ({ name, count }));
            setCollections(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCollections();
        }, [])
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
                    <ChevronLeft size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Collections</Text>
            </View>
            {loading ? <ActivityIndicator style={{ marginTop: 50 }} /> : null}
            <FlatList
                data={collections}
                keyExtractor={(item) => item.name}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push({ pathname: "/collection/[id]" as any, params: { id: item.name } })}
                    >
                        <Text style={styles.label}>{item.name}</Text>
                        <Text style={styles.count}>{item.count} items</Text>
                    </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF', paddingTop: 60 },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, marginBottom: 10 },
    headerTitle: { fontSize: 24, fontWeight: '600', color: '#000' },
    scrollContent: { padding: 25, paddingBottom: 100 },
    columnWrapper: { justifyContent: 'space-between' },
    card: {
        width: '47%',
        height: 120,
        backgroundColor: '#F9F9F9',
        borderRadius: 22,
        padding: 20,
        marginBottom: 15,
        justifyContent: 'center'
    },
    label: { fontSize: 12, fontWeight: '800', color: '#AAA', letterSpacing: 1 },
    count: { fontSize: 18, fontWeight: '500', marginTop: 5 }
});
