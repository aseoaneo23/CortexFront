/*
 * SPDX-FileCopyrightText: 2026 Antonio Seoane De Ois
 *
 * SPDX-License-Identifier: MIT
 */


import React from "react";
import { Text, View, StyleSheet } from "react-native";

interface CategoryChipProps {
    label: string;
    active?: boolean; // black bg if true
    small?: boolean;
}

export default function CategoryChip({ label, active = false, small = false }: CategoryChipProps) {
    return (
        <View style={[styles.chip, active && styles.chipActive, small && styles.chipSmall]}>
            <Text style={[styles.text, active && styles.textActive, small && styles.textSmall]}>
                {label.toUpperCase()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    chip: {
        backgroundColor: "#F0F0F0",
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: "flex-start",
    },
    chipActive: {
        backgroundColor: "#0A0A0A",
    },
    chipSmall: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    text: {
        color: "#0A0A0A",
        fontSize: 11,
        fontWeight: "500",
        letterSpacing: 1,
    },
    textActive: {
        color: "#FFFFFF",
    },
    textSmall: {
        fontSize: 10,
    },
});
