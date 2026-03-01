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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { fetchAPI, InboxItem, Note, parseTags, formatDate } from "../constants/api";
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

    // Reset loading state when item changes to fix "stuck loading" bug
    React.useEffect(() => {
        setLoading(false);
        setError(null);
    }, [params.item]);

    // ── Actions ────────────────────────────────────────────────────────────────
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
                        // Backwards compatibility, but it could fail if /(tabs)/list doesnt exist
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

    // ── Derived display values ─────────────────────────────────────────────────
    const displayTitle = isNote(item)
        ? item.title
        : (item as InboxItem).rawContent.substring(0, 80);

    const tags = isNote(item) ? parseTags(item.tags) : [];
    const category = isNote(item) ? item.category || "reference" : (item as InboxItem).type;
    const dateStr = formatDate(item.createdAt);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <CategoryChip label={(item as InboxItem).type || category} small />
            </View>

            {/* Scrollable content */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    isPending && { paddingBottom: 100 + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Date + title */}
                <Text style={styles.dateLabel}>{dateStr}</Text>
                <Text style={styles.title}>{displayTitle}</Text>
                <View style={styles.divider} />

                {/* Category + tags */}
                <View style={styles.tagsRow}>
                    <CategoryChip label={category} active />
                    {tags.map((tag, i) => (
                        <CategoryChip key={i} label={tag} />
                    ))}
                </View>

                {/* Show URL if present in rawContent */}
                {!isNote(item) && item.rawContent.startsWith("http") && (
                    <View style={styles.urlBox}>
                        <Text style={styles.urlLabel}>SOURCE URL</Text>
                        <Text style={styles.urlText} numberOfLines={1}>{item.rawContent}</Text>
                    </View>
                )}

                {/* Notes content */}
                {isNote(item) ? (
                    <>
                        {/* Summary */}
                        {!!item.summary && (
                            <>
                                <Text style={styles.sectionLabel}>SUMMARY</Text>
                                <Text style={styles.summaryText}>{item.summary}</Text>
                                <View style={styles.divider} />
                            </>
                        )}

                        {/* Full note */}
                        {!!item.content && (
                            <>
                                <Text style={styles.sectionLabel}>FULL NOTE</Text>
                                <MarkdownViewer content={item.content} />
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {/* Raw content for inbox items */}
                        <Text style={styles.sectionLabel}>RAW CONTENT</Text>
                        <Text style={styles.bodyText}>{(item as InboxItem).rawContent}</Text>
                    </>
                )}

                {/* Error */}
                {!!error && <Text style={styles.errorText}>{error}</Text>}
            </ScrollView>

            {/* Action bar — only for PENDING items (not yet processed into notes) */}
            {isPending && !isNote(item) && (
                <View
                    style={[
                        styles.actionBar,
                        { paddingBottom: insets.bottom + 12 },
                    ]}
                >
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

            {/* Delete button for Knowledge Base (already processed) */}
            {!isPending && (
                <View
                    style={[
                        styles.actionBar,
                        { paddingBottom: insets.bottom + 12 },
                    ]}
                >
                    <TouchableOpacity
                        style={[styles.deleteButtonFull, loading && styles.buttonDisabled]}
                        onPress={handleDelete}
                        disabled={loading}
                        activeOpacity={0.75}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FF3B30" size="small" />
                        ) : (
                            <Text style={styles.rejectButtonText}>DELETE FROM BRAIN</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#E8E8E8",
    },
    backArrow: {
        fontSize: 22,
        color: "#0A0A0A",
        fontWeight: "300",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 48,
    },
    dateLabel: {
        fontSize: 12,
        color: "#9B9B9B",
        letterSpacing: 1,
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0A0A0A",
        lineHeight: 30,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: "#E8E8E8",
        marginVertical: 16,
    },
    tagsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B6B6B",
        letterSpacing: 2,
        marginBottom: 10,
    },
    summaryText: {
        fontSize: 15,
        color: "#6B6B6B",
        lineHeight: 23,
    },
    bodyText: {
        fontSize: 15,
        color: "#0A0A0A",
        lineHeight: 23,
    },
    errorText: {
        fontSize: 13,
        color: "#FF3B30",
        marginTop: 16,
    },
    urlBox: {
        padding: 12,
        backgroundColor: "#F7F7F7",
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#E8E8E8",
    },
    urlLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: "#9B9B9B",
        marginBottom: 4,
    },
    urlText: {
        fontSize: 13,
        color: "#0A0A0A",
        textDecorationLine: "underline",
    },

    // Action bar
    actionBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E8E8E8",
    },
    rejectButton: {
        flex: 1,
        height: 52,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#FF3B30",
        alignItems: "center",
        justifyContent: "center",
    },
    rejectButtonText: {
        color: "#FF3B30",
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 1.5,
    },
    deleteButtonFull: {
        flex: 1,
        height: 52,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E8E8E8",
        alignItems: "center",
        justifyContent: "center",
    },
    acceptButton: {
        flex: 2,
        height: 52,
        borderRadius: 8,
        backgroundColor: "#0A0A0A",
        alignItems: "center",
        justifyContent: "center",
    },
    acceptButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 1.5,
    },
    buttonDisabled: {
        opacity: 0.4,
    },
});
