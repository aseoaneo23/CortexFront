import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { fetchAPI, Note, formatDate } from '../constants/api';

export default function AllTasksScreen() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);
    const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

    const loadTasks = async () => {
        setLoading(true);
        try {
            const notes: Note[] = await fetchAPI('/brain');
            const taskNotes = notes.filter(n => n.category === 'task');
            setTasks(taskNotes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [])
    );

    const handleComplete = async (id: string) => {
        // Optimistic UI state
        setCompletingIds(prev => new Set(prev).add(id));

        // Wait 400ms per requirements
        setTimeout(async () => {
            try {
                await fetchAPI(`/brain/${id}`, { method: 'DELETE' });
                setTasks(prev => prev.filter(t => t.id !== id));
            } catch (error) {
                console.error("Failed to delete task:", error);
                // Rollback state if failed
                setCompletingIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
        }, 400);
    };

    const renderTask = ({ item }: { item: Note }) => {
        const isCompleted = completingIds.has(item.id);

        const openDetail = () => {
            router.push({
                pathname: "/detail",
                params: { item: JSON.stringify(item), mode: 'knowledge' }
            });
        };

        return (
            <View style={styles.taskRow}>
                <View style={styles.leftContent}>
                    <TouchableOpacity
                        style={styles.radioButton}
                        onPress={() => handleComplete(item.id)}
                        disabled={isCompleted}
                    >
                        <View style={styles.outerCircle}>
                            {isCompleted && <View style={styles.innerCircle} />}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1 }} onPress={openDetail}>
                        <Text style={[styles.taskTitle, isCompleted && styles.completedTitle]}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={openDetail}>
                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen

                options={{
                    headerTitle: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={{ fontSize: 17, fontWeight: '600' }}>Tasks</Text>
                        </TouchableOpacity>
                    ),
                    headerShown: true,
                    headerShadowVisible: false,
                    headerBackVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                            <ChevronLeft size={28} color="#000" />
                        </TouchableOpacity>
                    ),
                }}

            />

            {loading && tasks.length === 0 ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator color="#0A0A0A" />
                </View>
            ) : tasks.length === 0 ? (
                <View style={styles.centerBox}>
                    <Text style={styles.emptyText}>NO TASKS YET</Text>
                </View>
            ) : (
                <FlatList
                    data={tasks}
                    keyExtractor={item => item.id}
                    renderItem={renderTask}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 12, color: '#9B9B9B', letterSpacing: 2, fontWeight: '600' },
    taskRow: {
        backgroundColor: '#FFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    radioButton: {
        padding: 4,
    },
    outerCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: '#0A0A0A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerCircle: {
        width: 13,
        height: 13,
        borderRadius: 7,
        backgroundColor: '#0A0A0A',
    },
    taskTitle: {
        fontSize: 15,
        color: '#0A0A0A',
        flex: 1,
    },
    completedTitle: {
        textDecorationLine: 'underline line-through', // Using strikethrough as requested (textDecorationLine is the RN prop)
        color: '#9B9B9B',
    },
    dateText: {
        fontSize: 11,
        color: '#9B9B9B',
        letterSpacing: 0.5,
    },
});
