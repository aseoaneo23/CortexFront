import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { fetchAPI, InboxItem } from '../../constants/api';
import { useFocusEffect, useRouter } from 'expo-router';

export default function PendingScreen() {
    const router = useRouter();
    const [data, setData] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const loadPending = async () => {
        setLoading(true);
        try {
            const result = await fetchAPI('/inbox/pending');
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadPending();
        }, [])
    );

    const handleReject = async (id: string) => {
        setActionLoadingId(id);
        try {
            await fetchAPI(`/inbox/${id}`, { method: 'DELETE' });
            await loadPending();
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleAccept = async (id: string) => {
        setActionLoadingId(id);
        try {
            await fetchAPI(`/process/${id}`, { method: 'POST' });
            await loadPending();
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const goToDetail = (item: InboxItem) => {
        router.push({ pathname: '/detail', params: { item: JSON.stringify(item), mode: 'pending' } });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pending</Text>
            {data.length === 0 && !loading && (
                <Text style={{ textAlign: 'center', marginTop: 50, color: '#AAA' }}>Nothing pending</Text>
            )}
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isProcessing = actionLoadingId === item.id;
                    return (
                        <TouchableOpacity style={styles.pendingCard} onPress={() => goToDetail(item)} activeOpacity={0.8} disabled={isProcessing}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.typeTag}>{(item.type || '').toUpperCase()}</Text>
                                <Text style={styles.content} numberOfLines={2}>{item.rawContent}</Text>
                            </View>
                            <View style={styles.actions}>
                                {isProcessing ? (
                                    <View style={{ width: 80, alignItems: 'center', justifyContent: 'center' }}>
                                        <ActivityIndicator color="#000" />
                                    </View>
                                ) : (
                                    <>
                                        <TouchableOpacity style={styles.btnReject} onPress={() => handleReject(item.id)} disabled={actionLoadingId !== null}>
                                            <X color="white" size={20} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.btnAccept} onPress={() => handleAccept(item.id)} disabled={actionLoadingId !== null}>
                                            <Check color="white" size={20} />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF', padding: 25, paddingTop: 60 },
    title: { fontSize: 32, fontWeight: '500', marginBottom: 20 },
    pendingCard: { flexDirection: 'row', backgroundColor: '#F9F9F9', padding: 20, borderRadius: 25, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
    typeTag: { fontSize: 10, color: '#AAA', fontWeight: 'bold', marginBottom: 5 },
    content: { fontSize: 16, color: '#333' },
    actions: { flexDirection: 'row', gap: 10 },
    btnReject: { backgroundColor: '#FF5252', padding: 10, borderRadius: 15 },
    btnAccept: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 15 }
});
