/*
 * SPDX-FileCopyrightText: 2026 Antonio Seoane De Ois
 *
 * SPDX-License-Identifier: MIT
 */


import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { InboxItem, Note, formatDate } from "../constants/api";
import CategoryChip from "./CategoryChip";

type ListItem = InboxItem | Note;

function isNote(item: ListItem): item is Note {
    return "title" in item;
}

interface EntryCardProps {
    item: ListItem;
    onPress: () => void;
}

const { width } = Dimensions.get("window");
// 3 columns: (TotalWidth - LeftPadding - RightPadding - (SpacingBetween * (Columns-1))) / Columns
const CARD_WIDTH = (width - 16 * 2 - 16) / 3;

export default function EntryCard({ item, onPress }: EntryCardProps) {
    if (isNote(item)) {
        const imgMatch = item.content?.match(/(data:image[^"\s\)')]+)/);
        return (
            <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
                <CategoryChip label={item.category || "ref"} small />
                {imgMatch ? (
                    <Image source={{ uri: imgMatch[1] }} style={styles.previewImage} />
                ) : null}
                <Text style={styles.title} numberOfLines={3}>
                    {item.title}
                </Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            </TouchableOpacity>
        );
    }

    // InboxItem
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <CategoryChip label={item.type || 'text'} small />
            {item.rawContent.startsWith('data:image') ? (
                <Image source={{ uri: item.rawContent }} style={styles.previewImage} />
            ) : (
                <Text style={styles.preview} numberOfLines={4}>
                    {item.rawContent}
                </Text>
            )}
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E8E8E8",
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        justifyContent: "space-between",
        minHeight: 10, // se puede poner CARD_WIDTH para q sea cuadrado
    },
    title: {
        fontSize: 11,
        fontWeight: "600",
        color: "#0A0A0A",
        marginTop: 6,
        lineHeight: 14,
        flex: 1,
    },
    preview: {
        fontSize: 10,
        color: "#6B6B6B",
        marginTop: 6,
        lineHeight: 13,
        flex: 1,
    },
    date: {
        fontSize: 9,
        color: "#9B9B9B",
        marginTop: 4,
        letterSpacing: 0.3,
    },
    previewImage: {
        height: 60,
        borderRadius: 8,
        marginTop: 6,
        resizeMode: "cover",
    }
});
