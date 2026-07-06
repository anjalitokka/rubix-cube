import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { theme } from "@/src/theme";
import { generateScramble } from "@/src/lib/cube";
import { apiPost, apiGet } from "@/src/lib/api";



function formatTime(ms){
  const totalCs = Math.floor(ms / 10); // hundredths
  const minutes = Math.floor(totalCs / 6000);
  const seconds = Math.floor((totalCs % 6000) / 100);
  const cs = totalCs % 100;
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
  }
  return `${seconds}.${cs.toString().padStart(2, "0")}`;
}

export default function TimerScreen() {
  const [phase, setPhase] = useState("idle");
  const [displayMs, setDisplayMs] = useState(0);
  const [inspection, setInspection] = useState(15);
  const [scramble, setScramble] = useState(generateScramble(20));
  const [sessions, setSessions] = useState([]);
  const [saving, setSaving] = useState(false);

  const startedAtRef = useRef(0);
  const rafRef = useRef(null);
  const inspectionRef = useRef(null);

  const loadSessions = async () => {
    try {
      const rows = await apiGet("/timer");
      setSessions(rows);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadSessions();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (inspectionRef.current) clearInterval(inspectionRef.current);
    };
  }, []);

  const startInspection = () => {
    setPhase("inspecting");
    setInspection(15);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    inspectionRef.current = setInterval(() => {
      setInspection((v) => {
        if (v <= 1) {
          if (inspectionRef.current) clearInterval(inspectionRef.current);
          armForStart();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  };

  const armForStart = () => {
    setPhase("arming");
  };

  const startTimer = () => {
    if (inspectionRef.current) clearInterval(inspectionRef.current);
    startedAtRef.current = Date.now();
    setDisplayMs(0);
    setPhase("running");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const tick = () => {
      setDisplayMs(Date.now() - startedAtRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopTimer = async () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const finalMs = Date.now() - startedAtRef.current;
    setDisplayMs(finalMs);
    setPhase("done");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    try {
      await apiPost("/timer", {
        duration_ms: finalMs,
        scramble: scramble.join(" "),
      });
      await loadSessions();
    } catch (e) {
      // ignore
    }
    setSaving(false);
  };

  const reset = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (inspectionRef.current) clearInterval(inspectionRef.current);
    setPhase("idle");
    setDisplayMs(0);
    setInspection(15);
    setScramble(generateScramble(20));
  };

  const handlePress = () => {
    if (phase === "idle" || phase === "done") {
      startInspection();
    } else if (phase === "inspecting" || phase === "arming") {
      startTimer();
    } else if (phase === "running") {
      stopTimer();
    }
  };

  const best = sessions.length ? Math.min(...sessions.map((s) => s.duration_ms)) : null;
  const ao5 = sessions.length >= 5
    ? Math.round(sessions.slice(0, 5).reduce((a, b) => a + b.duration_ms, 0) / 5)
    : null;

  const bigLabel =
    phase === "idle"
      ? "TAP TO START"
      : phase === "inspecting"
        ? `INSPECT ${inspection}s`
        : phase === "arming"
          ? "READY? TAP TO GO"
          : phase === "running"
            ? "TAP TO STOP"
            : "SOLVED";

  const timerColor =
    phase === "inspecting"
      ? inspection <= 5
        ? theme.colors.error
        : theme.colors.warning
      : phase === "arming"
        ? theme.colors.success
        : theme.colors.text;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Timer</Text>
        <Pressable onPress={reset} testID="timer-reset" hitSlop={12}>
          <Ionicons name="refresh" size={22} color={theme.colors.textDim} />
        </Pressable>
      </View>

      <View style={styles.scrambleBox} testID="scramble-box">
        <Text style={styles.scrambleLabel}>SCRAMBLE</Text>
        <Text style={styles.scrambleText}>{scramble.join(" ")}</Text>
      </View>

      <Pressable
        onPress={handlePress}
        style={styles.timerArea}
        testID="timer-tap-area"
      >
        <Text style={[styles.digits, { color: timerColor }]} testID="timer-digits">
          {phase === "inspecting" ? formatTime(0) : formatTime(displayMs)}
        </Text>
        <Text style={styles.bigLabel}>{bigLabel}</Text>
      </Pressable>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>BEST</Text>
          <Text style={styles.statVal}>{best != null ? formatTime(best) : "—"}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>AO5</Text>
          <Text style={styles.statVal}>{ao5 != null ? formatTime(ao5) : "—"}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>SOLVES</Text>
          <Text style={styles.statVal}>{sessions.length}</Text>
        </View>
      </View>

      {saving && (
        <View style={styles.saving}>
          <ActivityIndicator color={theme.colors.brand} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.md,
    paddingBottom: theme.space.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  scrambleBox: {
    marginHorizontal: theme.space.lg,
    padding: theme.space.md,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
  },
  scrambleLabel: {
    color: theme.colors.brand,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
    marginBottom: theme.space.xs,
  },
  scrambleText: {
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: theme.font.mono,
    lineHeight: 22,
  },
  timerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  digits: {
    fontSize: 84,
    fontWeight: "800",
    letterSpacing: -2,
    fontVariant: ["tabular-nums"],
  },
  bigLabel: {
    color: theme.colors.textFaint,
    marginTop: theme.space.md,
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: theme.space.lg,
    marginBottom: theme.space.md,
    gap: theme.space.md,
  },
  stat: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    alignItems: "center",
  },
  statLabel: { color: theme.colors.textFaint, fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  statVal: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
  saving: { position: "absolute", top: 24, right: 24 },
});
