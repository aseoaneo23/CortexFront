import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Image, Modal, Pressable } from 'react-native';
import { ChevronRight, User, Settings, LogOut, Shield } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { fetchAPI, Note, parseTags, formatDate } from '../../constants/api';

export default function HomeScreen() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Note[]>([]);
    const [collectionsData, setCollectionsData] = useState<{ name: string, count: number, preview?: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
    const [showDropdown, setShowDropdown] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const notes: Note[] = await fetchAPI('/brain');

            // Filter tasks (category is "task"), take max 3
            const taskNotes = notes.filter(n => n.category === 'task');
            setTasks(taskNotes.slice(0, 3));

            // Group by category, EXCLUDING tasks
            const grouped: Record<string, { count: number, preview?: string }> = {};
            notes.forEach(n => {
                if (n.category !== 'task') {
                    const cat = (n.category || 'reference').toUpperCase();
                    if (!grouped[cat]) grouped[cat] = { count: 0 };
                    grouped[cat].count += 1;

                    if (!grouped[cat].preview && n.content) {
                        const imgMatch = n.content.match(/(data:image[^"\s\)')]+)/);
                        if (imgMatch) grouped[cat].preview = imgMatch[1];
                    }
                }
            });
            const formattedCollections = Object.entries(grouped).map(([name, data]) => ({ name, ...data }));
            setCollectionsData(formattedCollections);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleCompleteTask = async (id: string) => {
        // Optimistic UI update
        setCompletingIds(prev => new Set(prev).add(id));

        // Per requirement: Wait 400ms then DELETE
        setTimeout(async () => {
            try {
                await fetchAPI(`/brain/${id}`, { method: 'DELETE' });
                setTasks(prev => prev.filter(t => t.id !== id));
            } catch (error) {
                console.error("Failed to delete task:", error);
                // Rollback if failure
                setCompletingIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
        }, 400);
    };

    const openCollection = (name: string) => {
        router.push({
            pathname: "/collection/[id]" as any,
            params: { id: name }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.avatar} onPress={() => setShowDropdown(true)}>
                    <User size={20} color="#666" />
                </TouchableOpacity>
            </View>

            <Modal
                visible={showDropdown}
                transparent={true}
                animationType="fade"
                statusBarTranslucent={true}
                onRequestClose={() => setShowDropdown(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowDropdown(false)}
                >
                    <View style={styles.dropdownContainer}>
                        <TouchableOpacity style={styles.dropdownItem} onPress={() => setShowDropdown(false)}>
                            <User size={18} color="#333" />
                            <Text style={styles.dropdownText}>Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dropdownItem} onPress={() => setShowDropdown(false)}>
                            <Settings size={18} color="#333" />
                            <Text style={styles.dropdownText}>Settings</Text>
                        </TouchableOpacity>
                        <View style={styles.dropdownDivider} />
                        <TouchableOpacity style={[styles.dropdownItem, { marginBottom: 0 }]} onPress={() => setShowDropdown(false)}>
                            <LogOut size={18} color="#FF3B30" />
                            <Text style={[styles.dropdownText, { color: '#FF3B30' }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => router.push('/all-tasks')}
            >
                <Text style={styles.title}>Tasks</Text>
                <ChevronRight size={28} color="#000" />
            </TouchableOpacity>

            {loading && tasks.length === 0 ? (
                <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : null}

            <View style={styles.taskVerticalList}>
                {tasks.map(task => {
                    const isCompleted = completingIds.has(task.id);
                    return (
                        <View key={task.id} style={styles.taskRow}>
                            <View style={styles.taskLeft}>
                                <TouchableOpacity
                                    style={styles.radioWrapper}
                                    onPress={() => handleCompleteTask(task.id)}
                                    disabled={isCompleted}
                                >
                                    <View style={styles.outerCircle}>
                                        {isCompleted && <View style={styles.innerCircle} />}
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ flex: 1 }}
                                    onPress={() => router.push({
                                        pathname: "/detail",
                                        params: { item: JSON.stringify(task), mode: 'knowledge' }
                                    })}
                                >
                                    <Text style={[styles.taskTitle, isCompleted && styles.completedTitle]}>
                                        {task.title}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.dateText}>{formatDate(task.createdAt)}</Text>
                        </View>
                    );
                })}
            </View>

            <TouchableOpacity
                style={[styles.sectionHeader, { marginTop: 30 }]}
                onPress={() => router.push('/all-collections')}
            >
                <Text style={styles.title}>Collections</Text>
                <ChevronRight size={28} color="#000" />
            </TouchableOpacity>

            <View style={styles.grid}>
                {collectionsData.slice(0, 4).map((item, i) => (
                    <TouchableOpacity
                        key={item.name}
                        style={styles.card}
                        onPress={() => openCollection(item.name)}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.cardLabel}>{item.name}</Text>
                            <Text style={styles.cardCount}>{item.count}</Text>
                        </View>
                        {item.preview ? (
                            <Image source={{ uri: item.preview }} style={[styles.cardPreview, { resizeMode: 'cover' }]} />
                        ) : i === 0 ? (
                            <View style={styles.cardPreview} />
                        ) : null}
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF', padding: 25, paddingTop: 35 },
    header: { alignItems: 'flex-end', marginBottom: 10, marginTop: 15 },
    avatar: { width: 35, height: 35, borderRadius: 20, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 32, fontWeight: '600', letterSpacing: -1 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { width: '47%', aspectRatio: 1, backgroundColor: '#FFF', borderRadius: 28, borderWidth: 1, borderColor: '#EFEFEF', padding: 18, marginBottom: 15 },
    cardLabel: { color: '#AAA', fontWeight: '800', fontSize: 10, letterSpacing: 0.5 },
    cardCount: { color: '#000', fontWeight: '500', fontSize: 16 },
    cardPreview: { flex: 1, backgroundColor: '#F9F9F9', borderRadius: 18, marginTop: 12 },

    // Vertical task rows
    taskVerticalList: {
        marginBottom: 10,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 0, // no horizontal padding inside home container padding
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    taskLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    radioWrapper: {
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
        textDecorationLine: 'line-through',
        color: '#9B9B9B',
    },
    dateText: {
        fontSize: 11,
        color: '#9B9B9B',
        letterSpacing: 0.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    dropdownContainer: {
        marginTop: 100,
        marginRight: 25,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 12,
        width: 180,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 12,
        marginBottom: 4,
    },
    dropdownText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    dropdownDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 8,
        marginHorizontal: 8,
    },
});
