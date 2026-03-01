/*
 * SPDX-FileCopyrightText: 2026 Antonio Seoane De Ois
 *
 * SPDX-License-Identifier: MIT
 */


import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import EntryCard from '../../components/EntryCard';
import { fetchAPI, Note, parseTags } from '../../constants/api';

export default function CollectionDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [items, setItems] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);

    const loadItems = async () => {
        setLoading(true);
        try {
            const notes: Note[] = await fetchAPI('/brain');
            const filtered = notes.filter(n =>
                (n.category || 'reference').toUpperCase() === String(id).toUpperCase() &&
                !parseTags(n.tags).includes('task')
            );
            setItems(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadItems();
        }, [id])
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Collections',
                    headerShown: true,
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                            <ChevronLeft size={28} color="#000" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                options={{
                    headerTitle: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={{ fontSize: 17, fontWeight: '600' }}>{id as string}</Text>
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false,
                    headerLargeTitle: true,
                    headerBackVisible: false,
                }}
            />

            {loading ? <ActivityIndicator style={{ marginTop: 50 }} /> : null}
            <FlatList
                data={items}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <EntryCard
                        item={item}
                        onPress={() => router.push({ pathname: '/detail', params: { item: JSON.stringify(item), mode: 'knowledge' } })}
                    />
                )}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                ListHeaderComponent={() => (
                    <Text style={styles.subtitle}>Items inside this collection</Text>
                )}
                numColumns={3}
                columnWrapperStyle={{ gap: 8 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    subtitle: {
        fontSize: 14,
        color: '#AAA',
        fontWeight: '600',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 1
    }
});
