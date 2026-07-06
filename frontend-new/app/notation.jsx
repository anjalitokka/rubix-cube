import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/src/theme";
import { moveDescription } from "@/src/lib/cube";

const MOVES = [
    "U", "U'", "U2",
    "D", "D'", "D2",
    "L", "L'", "L2",
    "R", "R'", "R2",
    "F", "F'", "F2",
    "B", "B'", "B2",
];

export default function NotationGuide() {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={12} testID="back-btn">
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </Pressable>
                <Text style={styles.title}>Notation Guide</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView contentContainerStyle={{ padding: theme.space.lg, paddingBottom: 40 }}>
                <Text style={styles.p}>
                    Rubik&apos;s Cube notation uses six letters — one for each face:
                </Text>

                <View style={styles.grid}>
                    {[
                        { k: "U", label: "Up (top)" },
                        { k: "D", label: "Down (bottom)" },
                        { k: "L", label: "Left" },
                        { k: "R", label: "Right" },
                        { k: "F", label: "Front" },
                        { k: "B", label: "Back" },
                    ].map((row) => (
                        <View key={row.k} style={styles.card}>
                            <Text style={styles.letter}>{row.k}</Text>
                            <Text style={styles.label}>{row.label}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.h}>Move variations</Text>
                <View style={styles.card2}>
                    <Text style={styles.p}>
                        <Text style={styles.mono}>R</Text> — turn face clockwise (90°)
                        {"\n"}
                        <Text style={styles.mono}>R'</Text> — turn face counter-clockwise (90°)
                        {"\n"}
                        <Text style={styles.mono}>R2</Text> — turn face 180°
                    </Text>
                </View>

                <Text style={styles.h}>Every move</Text>
                <View style={styles.rowsWrap}>
                    {MOVES.map((m) => (
                        <View key={m} style={styles.moveRow}>
                            <Text style={styles.moveText}>{m}</Text>
                            <Text style={styles.moveDesc}>{moveDescription(m)}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.bg },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: theme.space.lg,
        paddingVertical: theme.space.md,
    },
    title: { color: theme.colors.text, fontSize: 18, fontWeight: "700" },
    p: { color: theme.colors.textDim, fontSize: 14, lineHeight: 22 },
    h: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: "800",
        marginTop: theme.space.xl,
        marginBottom: theme.space.md,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.space.md,
        marginTop: theme.space.md,
    },
    card: {
        width: "47%",
        padding: theme.space.md,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
    },
    letter: {
        color: theme.colors.brand,
        fontSize: 28,
        fontWeight: "800",
        fontFamily: theme.font.mono,
    },
    label: { color: theme.colors.textDim, fontSize: 12, marginTop: 2 },
    card2: {
        marginTop: theme.space.md,
        padding: theme.space.md,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
    },
    mono: {
        color: theme.colors.brand,
        fontFamily: theme.font.mono,
        fontWeight: "700",
    },
    rowsWrap: { gap: 6 },
    moveRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: theme.space.md,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.sm,
    },
    moveText: {
        width: 60,
        color: theme.colors.brand,
        fontFamily: theme.font.mono,
        fontSize: 16,
        fontWeight: "800",
    },
    moveDesc: { flex: 1, color: theme.colors.textDim, fontSize: 13 },
});
