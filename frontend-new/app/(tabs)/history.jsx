import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { theme } from "@/src/theme";
import { apiGet, apiDelete } from "@/src/lib/api";



function formatMs(ms){
  const totalCs = Math.floor(ms / 10);
  const minutes = Math.floor(totalCs / 6000);
  const seconds = Math.floor((totalCs % 6000) / 100);
  const cs = totalCs % 100;
  if (minutes > 0) return `${minutes}:${seconds.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
  return `${seconds}.${cs.toString().padStart(2, "0")}`;
}

function relTime(iso){
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [tab, setTab] = useState("solves");
  const [solves, setSolves] = useState([]);
  const [times, setTimes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([
        apiGet("/solves"),
        apiGet("/timer"),
      ]);
      setSolves(s);
      setTimes(t);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

 const remove = async (type, id) => {
    if (type === "solves") {
      await apiDelete(`/solves/${id}`);
      setSolves((r) => r.filter((x) => x.id !== id));
    } else {
      await apiDelete(`/timer/${id}`);
      setTimes((r) => r.filter((x) => x.id !== id));
    }
  };

  const data = tab === "solves" ? solves : times;
  const empty = data.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab("solves")}
          style={[styles.tab, tab === "solves" && styles.tabActive]}
          testID="tab-solves"
        >
          <Text style={[styles.tabText, tab === "solves" && styles.tabTextActive]}>Solves</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("times")}
          style={[styles.tab, tab === "times" && styles.tabActive]}
          testID="tab-times"
        >
          <Text style={[styles.tabText, tab === "times" && styles.tabTextActive]}>Times</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: theme.space.lg, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.brand} />}
        testID="history-scroll"
      >
        {empty && (
          <View style={styles.empty}>
            <Ionicons
              name={tab === "solves" ? "cube-outline" : "stopwatch-outline"}
              size={48}
              color={theme.colors.textFaint}
            />
            <Text style={styles.emptyTitle}>
              {tab === "solves" ? "No solves yet" : "No timings yet"}
            </Text>
            <Text style={styles.emptySub}>
              {tab === "solves"
                ? "Solve a cube and it will appear here."
                : "Use the Timer to record solve times."}
            </Text>
          </View>
        )}

        {tab === "solves" &&
          solves.map((s) => (
            <View key={s.id || `${s.created_at}-${s.move_count}`} style={styles.row} testID={`solve-row-${s.id || s.created_at}`}>
              <View style={styles.rowIcon}>
                <Ionicons name="cube" size={22} color={theme.colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{s.move_count} moves</Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                  {s.solution || "—"}
                </Text>
                <Text style={styles.rowMeta}>
                  {s.input_method} · {relTime(s.created_at)}
                </Text>
              </View>
              <Pressable onPress={() => remove("solves", s.id)} hitSlop={12} testID={`delete-solve-${s.id}`}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.textFaint} />
              </Pressable>
            </View>
          ))}

        {tab === "times" &&
          times.map((t) => (
            <View key={t.id || `${t.created_at}-${t.duration_ms}`} style={styles.row} testID={`time-row-${t.id || t.created_at}`}>
              <View style={styles.rowIcon}>
                <Ionicons name="stopwatch" size={22} color={theme.colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{formatMs(t.duration_ms)}</Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                  {t.scramble || "—"}
                </Text>
                <Text style={styles.rowMeta}>{relTime(t.created_at)}</Text>
              </View>
              <Pressable onPress={() => remove("times", t.id)} hitSlop={12} testID={`delete-time-${t.id}`}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.textFaint} />
              </Pressable>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingHorizontal: theme.space.lg, paddingTop: theme.space.md, paddingBottom: theme.space.md },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  tabs: {
    flexDirection: "row",
    marginHorizontal: theme.space.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 4,
    marginBottom: theme.space.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    alignItems: "center",
  },
  tabActive: { backgroundColor: theme.colors.brand },
  tabText: { color: theme.colors.textDim, fontSize: 13, fontWeight: "700", letterSpacing: 0.5 },
  tabTextActive: { color: "#121212" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    marginBottom: theme.space.sm,
    gap: theme.space.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.brandDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "700" },
  rowSub: { color: theme.colors.textDim, fontSize: 12, fontFamily: theme.font.mono, marginTop: 2 },
  rowMeta: { color: theme.colors.textFaint, fontSize: 11, marginTop: 2 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
  emptySub: { color: theme.colors.textDim, fontSize: 13, textAlign: "center" },
});
