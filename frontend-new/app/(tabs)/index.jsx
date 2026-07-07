import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/src/theme";

export default function HomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                testID="home-scroll"
            >
                <View style={styles.header}>
                    <ImageBackground
                        source={{
                            uri: "https://images.unsplash.com/photo-1586173806725-797f4d632f5d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwyfHxydWJpa3MlMjBjdWJlJTIwZGFyayUyMGFic3RyYWN0fGVufDB8fHx8MTc4MjA1ODQ1MHww&ixlib=rb-4.1.0&q=85",
                        }}
                        style={styles.hero}
                        imageStyle={{ opacity: 0.6 }}
                    >
                        <LinearGradient
                            colors={["rgba(11,11,11,0.15)", "rgba(11,11,11,0.95)"]}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.heroContent}>
                            <Text style={styles.heroTitle} testID="brand-label">CubeVision{"\n"}</Text>

                            <Text style={styles.brandLabel}>
                                Solve it in 20 moves or less.
                            </Text>
                            <Text style={styles.heroSub}>
                                Scan or tap in your scramble — get an optimal solution instantly.
                            </Text>
                        </View>
                    </ImageBackground>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>

                    <Pressable
                        onPress={() => router.push("/scan")}
                        style={({ pressed }) => [styles.primaryCard, pressed && { opacity: 0.85 }]}
                        testID="action-scan"
                    >
                        <View style={styles.cardIconWrap}>
                            <Ionicons name="scan-outline" size={28} color={theme.colors.brand} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.primaryTitle}>Scan with Camera</Text>
                            <Text style={styles.primarySub}>Scanner reads each face and builds the state</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color={theme.colors.textDim} />
                    </Pressable>

                    <Pressable
                        onPress={() => router.push("/manual")}
                        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                        testID="action-manual"
                    >
                        <View style={styles.cardIconWrap}>
                            <Ionicons name="grid-outline" size={26} color={theme.colors.text} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>Manual Entry</Text>
                            <Text style={styles.cardSub}>Tap each sticker, pick a color</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textFaint} />
                    </Pressable>

                    <View style={styles.rowCards}>
                        <Pressable
                            onPress={() => router.push("/(tabs)/timer")}
                            style={({ pressed }) => [styles.miniCard, pressed && { opacity: 0.85 }]}
                            testID="action-timer"
                        >
                            <Ionicons name="stopwatch-outline" size={26} color={theme.colors.text} />
                            <Text style={styles.miniTitle}>Timer</Text>
                            <Text style={styles.miniSub}>Practice</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => router.push("/notation")}
                            style={({ pressed }) => [styles.miniCard, pressed && { opacity: 0.85 }]}
                            testID="action-notation"
                        >
                            <Ionicons name="book-outline" size={26} color={theme.colors.text} />
                            <Text style={styles.miniTitle}>Notation</Text>
                            <Text style={styles.miniSub}>Learn moves</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>ABOUT</Text>
                    <View style={styles.aboutBox}>
                        <Text style={styles.aboutText}>
                            Uses the Kociemba two-phase algorithm — guaranteed to find a solution in 20 face turns or fewer for any valid cube state.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.bg },
    header: { height: 300 },
    hero: { flex: 1, justifyContent: "flex-end" },
    heroContent: { padding: theme.space.xl, paddingBottom: theme.space.xl },
    brandLabel: {
        color: theme.colors.text,
        fontSize: 12,
        letterSpacing: 3,
        fontWeight: "700",
        marginBottom: theme.space.sm,
    },
    heroTitle: {
        color: theme.colors.brand,
        fontSize: 34,
        lineHeight: 40,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    heroSub: {
        color: theme.colors.textDim,
        fontSize: 14,
        marginTop: theme.space.sm,
        lineHeight: 20,
    },
    section: { paddingHorizontal: theme.space.lg, marginTop: theme.space.xl },
    sectionLabel: {
        color: theme.colors.textFaint,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 2,
        marginBottom: theme.space.md,
    },
    primaryCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.brandDeep,
        borderColor: theme.colors.brand,
        borderWidth: 1,
        padding: theme.space.lg,
        borderRadius: theme.radius.md,
        marginBottom: theme.space.md,
        gap: theme.space.md,
    },
    cardIconWrap: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.surface,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryTitle: { color: theme.colors.text, fontSize: 17, fontWeight: "700" },
    primarySub: { color: theme.colors.textDim, fontSize: 13, marginTop: 2 },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        padding: theme.space.lg,
        borderRadius: theme.radius.md,
        marginBottom: theme.space.md,
        gap: theme.space.md,
    },
    cardTitle: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
    cardSub: { color: theme.colors.textDim, fontSize: 13, marginTop: 2 },
    rowCards: { flexDirection: "row", gap: theme.space.md, marginTop: theme.space.xs },
    miniCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        padding: theme.space.lg,
        borderRadius: theme.radius.md,
        gap: theme.space.sm,
    },
    miniTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "700", marginTop: theme.space.sm },
    miniSub: { color: theme.colors.textDim, fontSize: 12 },
    aboutBox: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.space.lg,
    },
    aboutText: { color: theme.colors.textDim, fontSize: 13, lineHeight: 20 },
});
