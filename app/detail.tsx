/*
 * SPDX-FileCopyrightText: 2026 Antonio Seoane De Ois
 *
 * SPDX-License-Identifier: MIT
 */


import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { fetchAPI, InboxItem, Note, parseTags, formatDate, parseSources, formatDeadline } from "../constants/api";
import CategoryChip from "../components/CategoryChip";
import MarkdownViewer from "../components/MarkdownViewer";

function isNote(item: InboxItem | Note): item is Note {
    return "title" in item;
}

export default function DetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ item: string; mode: string }>();

    const item: InboxItem | Note = JSON.parse(params.item || "{}");
    const mode = (params.mode || "pending") as "pending" | "knowledge";
    const isPending = mode === "pending";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        setLoading(false);
        setError(null);
    }, [params.item]);

    async function handleDelete() {
        const title = isPending ? "Reject" : "Delete";
        const msg = isPending ? "Discard this entry?" : "Delete this note permanently?";

        Alert.alert(title, msg, [
            { text: "Cancel", style: "cancel" },
            {
                text: isPending ? "Discard" : "Delete",
                style: "destructive",
                onPress: async () => {
                    setLoading(true);
                    try {
                        const endpoint = isPending ? `/inbox/${item.id}` : `/brain/${item.id}`;
                        await fetchAPI(endpoint, { method: "DELETE" });
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace("/(tabs)/home");
                        }
                    } catch (err: any) {
                        setError(err.message);
                    } finally {
                        setLoading(false);
                    }
                },
            },
        ]);
    }

    async function handleAccept() {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            await fetchAPI(`/process/${item.id}`, { method: "POST" });
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace("/(tabs)/home");
            }
        } catch (err: any) {
            console.error("Process error:", err);
            setError("Processing failed. Make sure Ollama is running.");
            setLoading(false);
        }
    }

    const displayTitle = isNote(item)
        ? item.title
        : (item as InboxItem).rawContent.substring(0, 80);

    const tags = isNote(item) ? parseTags(item.tags) : [];
    const category = isNote(item) ? item.category || "reference" : (item as InboxItem).type;
    const dateStr = formatDate(item.createdAt);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <CategoryChip label={(item as InboxItem).type || category} small />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    isPending && { paddingBottom: 100 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* A) Date + title + Category + Tags */}
                <Text style={styles.dateLabel}>{dateStr}</Text>
                <Text style={styles.title}>{displayTitle}</Text>
                <View style={styles.divider} />
                <View style={styles.tagsRow}>
                    <CategoryChip label={category} active />
                    {tags.map((tag, i) => (
                        <CategoryChip key={i} label={tag} />
                    ))}
                </View>

                {isNote(item) ? (
                    <>
                        {/* B) DEADLINE */}
                        {!!item.deadline && (
                            <>
                                <Text style={styles.sectionLabel}>DEADLINE</Text>
                                <Text style={styles.deadlineValue}>
                                    📅 {formatDeadline(item.deadline)}
                                </Text>
                                <View style={styles.divider} />
                            </>
                        )}

                        {/* C) SUMMARY */}
                        {!!item.summary && (
                            <>
                                <Text style={styles.sectionLabel}>SUMMARY</Text>
                                <Text style={styles.summaryText}>{item.summary}</Text>
                                <View style={styles.divider} />
                            </>
                        )}

                        {/* F) FULL NOTE */}
                        {!!item.content && (
                            <>
                                <Text style={styles.sectionLabel}>FULL NOTE</Text>
                                <MarkdownViewer
                                    content={item.content
                                        .replace(/^Source:\s*\[.*?\]\(.*?\)\s*\n?/gm, "")
                                        .replace(/^Source:\s*https?:\/\/\S+\s*\n?/gm, "")
                                        .trim()}
                                />
                                <View style={styles.divider} />
                            </>
                        )}

                        {/* D) RAW INPUT */}
                        {!!item.rawContent && (
                            <>
                                <Text style={styles.sectionLabel}>RAW INPUT</Text>
                                {item.rawContent.startsWith("http") ? (
                                    <TouchableOpacity onPress={() => Linking.openURL(item.rawContent)}>
                                        <Text style={styles.rawLink}>{item.rawContent}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={styles.bodyText}>{item.rawContent}</Text>
                                )}
                                <View style={styles.divider} />
                            </>
                        )}

                        {/* E) SOURCES */}
                        {parseSources(item.sources).length > 0 && (
                            <>
                                <Text style={styles.sectionLabel}>SOURCES</Text>
                                {parseSources(item.sources).map((url, i) => (
                                    <TouchableOpacity key={i} onPress={() => Linking.openURL(url)}>
                                        <Text style={styles.sourceLink}>
                                            {url.replace("https://", "").replace("http://", "").split("/")[0]}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                <View style={styles.divider} />
                            </>
                        )}



                        {/* G) REDESIGNED DELETE BUTTON */}
                        <TouchableOpacity
                            style={styles.subtleDeleteBtn}
                            onPress={handleDelete}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#9B9B9B" />
                            ) : (
                                <Text style={styles.subtleDeleteText}>× Remove from brain</Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.sectionLabel}>RAW CONTENT</Text>
                        <Text style={styles.bodyText}>{(item as InboxItem).rawContent}</Text>
                    </>
                )}

                {!!error && <Text style={styles.errorText}>{error}</Text>}
            </ScrollView>

            {/* Action bar — only for PENDING items */}
            {isPending && !isNote(item) && (
                <View style={[styles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
                    <TouchableOpacity
                        style={[styles.rejectButton, loading && styles.buttonDisabled]}
                        onPress={handleDelete}
                        disabled={loading}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.rejectButtonText}>REJECT</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.acceptButton, loading && styles.buttonDisabled]}
                        onPress={handleAccept}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.acceptButtonText}>ACCEPT →</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#E8E8E8",
    },
    backArrow: { fontSize: 22, color: "#0A0A0A", fontWeight: "300" },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
    dateLabel: { fontSize: 12, color: "#9B9B9B", letterSpacing: 1, marginBottom: 8 },
    title: { fontSize: 22, fontWeight: "700", color: "#0A0A0A", lineHeight: 30, marginBottom: 16 },
    divider: { height: 1, backgroundColor: "#E8E8E8", marginVertical: 16 },
    tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 24 },
    sectionLabel: { fontSize: 13, fontWeight: "600", color: "#6B6B6B", letterSpacing: 2, marginBottom: 10 },
    summaryText: { fontSize: 15, color: "#6B6B6B", lineHeight: 23 },
    bodyText: { fontSize: 15, color: "#0A0A0A", lineHeight: 23 },
    deadlineValue: { fontSize: 16, fontWeight: "600", color: "#0A0A0A" },
    rawLink: { fontSize: 14, color: "#0A0A0A", textDecorationLine: "underline" },
    sourceLink: { color: "#0A0A0A", textDecorationLine: "underline", fontSize: 13, marginBottom: 6 },
    subtleDeleteBtn: { marginTop: 32, marginBottom: 16, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: "#ff5757ff" },
    subtleDeleteText: { fontSize: 12, color: "#f50b0bff", letterSpacing: 0.5 },
    errorText: { fontSize: 13, color: "#FF3B30", marginTop: 16 },
    actionBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 12, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E8E8E8" },
    rejectButton: { flex: 1, height: 52, borderRadius: 8, borderWidth: 1, borderColor: "#FF3B30", alignItems: "center", justifyContent: "center" },
    rejectButtonText: { color: "#FF3B30", fontSize: 13, fontWeight: "600", letterSpacing: 1.5 },
    acceptButton: { flex: 2, height: 52, borderRadius: 8, backgroundColor: "#0A0A0A", alignItems: "center", justifyContent: "center" },
    acceptButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600", letterSpacing: 1.5 },
    buttonDisabled: { opacity: 0.4 },
});
