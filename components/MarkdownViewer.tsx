import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface MarkdownViewerProps {
    content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
    const elements = parseMarkdown(content);
    return <View style={styles.container}>{elements}</View>;
}

function parseMarkdown(text: string): React.ReactElement[] {
    const lines = text.split("\n");
    const elements: React.ReactElement[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let codeBlockKey = 0;

    lines.forEach((line, index) => {
        // Code block delimiter
        if (line.trimStart().startsWith("```")) {
            if (inCodeBlock) {
                elements.push(
                    <View key={`code-${codeBlockKey}`} style={styles.codeBlock}>
                        <Text style={styles.codeText}>{codeLines.join("\n")}</Text>
                    </View>
                );
                codeLines = [];
                codeBlockKey++;
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
            }
            return;
        }

        if (inCodeBlock) {
            codeLines.push(line);
            return;
        }

        // Empty line
        if (line.trim() === "") {
            elements.push(<View key={`space-${index}`} style={styles.spacer} />);
            return;
        }

        // H1
        if (line.startsWith("# ")) {
            elements.push(
                <Text key={index} style={styles.h1}>
                    {line.slice(2)}
                </Text>
            );
            return;
        }

        // H2
        if (line.startsWith("## ")) {
            elements.push(
                <Text key={index} style={styles.h2}>
                    {line.slice(3)}
                </Text>
            );
            return;
        }

        // H3
        if (line.startsWith("### ")) {
            elements.push(
                <Text key={index} style={styles.h3}>
                    {line.slice(4)}
                </Text>
            );
            return;
        }

        // Bullet point
        if (line.startsWith("- ") || line.startsWith("* ")) {
            elements.push(
                <View key={index} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>·</Text>
                    <Text style={styles.bulletText}>{line.slice(2)}</Text>
                </View>
            );
            return;
        }

        // Numbered list  e.g. "1. item"
        if (/^\d+\.\s/.test(line)) {
            const match = line.match(/^(\d+)\.\s(.+)/);
            if (match) {
                elements.push(
                    <View key={index} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>{match[1]}.</Text>
                        <Text style={styles.bulletText}>{match[2]}</Text>
                    </View>
                );
                return;
            }
        }

        // Bold **text** – simple inline rendering
        if (line.includes("**")) {
            elements.push(
                <Text key={index} style={styles.body}>
                    {renderInline(line)}
                </Text>
            );
            return;
        }

        // Horizontal rule
        if (line.trim() === "---" || line.trim() === "***") {
            elements.push(<View key={index} style={styles.hr} />);
            return;
        }

        // Default body
        elements.push(
            <Text key={index} style={styles.body}>
                {line}
            </Text>
        );
    });

    // Close unclosed code block
    if (inCodeBlock && codeLines.length > 0) {
        elements.push(
            <View key={`code-final`} style={styles.codeBlock}>
                <Text style={styles.codeText}>{codeLines.join("\n")}</Text>
            </View>
        );
    }

    return elements;
}

/** Very simple inline bold: splits on ** markers */
function renderInline(line: string): React.ReactNode[] {
    const parts = line.split("**");
    return parts.map((part, i) =>
        i % 2 === 1 ? (
            <Text key={i} style={{ fontWeight: "700" }}>
                {part}
            </Text>
        ) : (
            <Text key={i}>{part}</Text>
        )
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 4,
    },
    h1: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0A0A0A",
        marginBottom: 8,
        marginTop: 12,
        lineHeight: 28,
    },
    h2: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0A0A0A",
        marginBottom: 6,
        marginTop: 10,
        lineHeight: 24,
    },
    h3: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0A0A0A",
        marginBottom: 4,
        marginTop: 8,
        lineHeight: 20,
    },
    body: {
        fontSize: 15,
        color: "#0A0A0A",
        lineHeight: 23,
        marginBottom: 4,
    },
    spacer: {
        height: 8,
    },
    bulletRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 4,
        paddingLeft: 4,
    },
    bulletDot: {
        fontSize: 15,
        color: "#6B6B6B",
        marginRight: 8,
        lineHeight: 23,
    },
    bulletText: {
        fontSize: 15,
        color: "#0A0A0A",
        lineHeight: 23,
        flex: 1,
    },
    codeBlock: {
        backgroundColor: "#F7F7F7",
        borderRadius: 6,
        padding: 12,
        marginVertical: 8,
    },
    codeText: {
        fontFamily: "monospace",
        fontSize: 13,
        color: "#0A0A0A",
        lineHeight: 20,
    },
    hr: {
        height: 1,
        backgroundColor: "#E8E8E8",
        marginVertical: 12,
    },
});
