import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { theme } from "@/src/theme";

import {
  applyMoves,
  moveDescription,
  solvedState,
} from "@/src/lib/cube";

import IsometricCube from "@/src/components/IsometricCube";

export default function SolveScreen() {
  const router = useRouter();
 const params = useLocalSearchParams();

  const moves = useMemo(() => {
    const s = String(params.moves || "").trim();
    if (!s) return [];
    return s.split(",").map((m) => m.trim()).filter(Boolean);
  }, [params.moves]);

  // Reconstruct initial state from facelets (URFDLB order)
  const initialState = useMemo(() => {
    const fl = String(params.facelets || "");
    if (fl.length !== 54) return solvedState();
    const faceToColor = { U: "W", R: "R", F: "G", D: "Y", L: "O", B: "B" };
    const out = [];
    for (const ch of fl) out.push(faceToColor[ch] || "W");
    return out;
  }, [params.facelets]);

  const [step, setStep] = useState(0); // 0 = initial state (no moves applied), moves.length = solved
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(700);

  const displayState = useMemo(() => {
    return applyMoves(initialState, moves.slice(0, step));
  }, [initialState, moves, step]);

  const totalSteps = moves.length;
  const isDone = step >= totalSteps;

  useEffect(() => {
    if (!playing) return;
    if (isDone) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => {
      setStep((s) => Math.min(totalSteps, s + 1));
      Haptics.selectionAsync();
    }, speedMs);
    return () => clearTimeout(id);
  }, [playing, step, speedMs, isDone, totalSteps]);

  const next = () => {
    if (step < totalSteps) {
      setStep((s) => s + 1);
      Haptics.selectionAsync();
    }
  };
  const prev = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      Haptics.selectionAsync();
    }
  };
  const restart = () => {
    setStep(0);
    setPlaying(false);
  };
  const togglePlay = () => {
    if (isDone) {
      restart();
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  };

  const currentMove = step > 0 ? moves[step - 1] : null;
  const nextMove = step < totalSteps ? moves[step] : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} testID="back-btn">
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>Solution</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.solutionSummary}>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryLabel}>MOVES</Text>
          <Text style={styles.summaryVal}>{totalSteps}</Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryLabel}>STEP</Text>
          <Text style={styles.summaryVal}>
            {step}/{totalSteps}
          </Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryLabel}>SPEED</Text>
          <Pressable
            onPress={() => setSpeedMs((s) => (s <= 300 ? 1000 : s - 200))}
            testID="speed-btn"
          >
            <Text style={styles.summaryVal}>{(speedMs / 1000).toFixed(1)}s</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.cubeArea}>
        <IsometricCube state={displayState} size={280} />
        <View style={styles.moveBanner}>
          <Text style={styles.moveBannerLabel}>{isDone ? "SOLVED" : nextMove ? "NEXT" : "READY"}</Text>
          <Text style={styles.moveBannerText} testID="next-move">
            {isDone ? "✓" : nextMove || "—"}
          </Text>
          {nextMove && !isDone && (
            <Text style={styles.moveBannerDesc}>{moveDescription(nextMove)}</Text>
          )}
        </View>
      </View>

      <View style={styles.chipsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.space.lg, gap: 8 }}
          testID="moves-scroll"
        >
          {moves.map((m, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <Pressable
                key={i}
                onPress={() => setStep(i)}
                style={[
                  styles.chip,
                  done && styles.chipDone,
                  current && styles.chipCurrent,
                ]}
                testID={`move-chip-${i}`}
              >
                <Text
                  style={[
                    styles.chipText,
                    done && styles.chipTextDone,
                    current && styles.chipTextCurrent,
                  ]}
                >
                  {m}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={restart} style={styles.ctrlBtn} testID="restart-btn">
          <Ionicons name="play-back" size={22} color={theme.colors.text} />
        </Pressable>
        <Pressable onPress={prev} style={styles.ctrlBtn} testID="prev-btn">
          <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
        </Pressable>
        <Pressable onPress={togglePlay} style={styles.playBtn} testID="play-btn">
          <Ionicons name={playing ? "pause" : "play"} size={30} color="#0B0B0B" />
        </Pressable>
        <Pressable onPress={next} style={styles.ctrlBtn} testID="next-btn">
          <Ionicons name="chevron-forward" size={26} color={theme.colors.text} />
        </Pressable>
        <Pressable
          onPress={() => setStep(totalSteps)}
          style={styles.ctrlBtn}
          testID="end-btn"
        >
          <Ionicons name="play-forward" size={22} color={theme.colors.text} />
        </Pressable>
      </View>
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
  solutionSummary: {
    flexDirection: "row",
    gap: theme.space.md,
    paddingHorizontal: theme.space.lg,
    marginBottom: theme.space.md,
  },
  summaryPill: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    alignItems: "center",
  },
  summaryLabel: {
    color: theme.colors.textFaint,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
  },
  summaryVal: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  cubeArea: { alignItems: "center", justifyContent: "center", paddingVertical: theme.space.md },
  moveBanner: {
    marginTop: theme.space.md,
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.xl,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    alignItems: "center",
  },
  moveBannerLabel: {
    color: theme.colors.brand,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
  },
  moveBannerText: {
    color: theme.colors.text,
    fontSize: 32,
    fontFamily: theme.font.mono,
    fontWeight: "800",
    marginTop: 4,
  },
  moveBannerDesc: {
    color: theme.colors.textDim,
    fontSize: 12,
    marginTop: 4,
  },
  chipsWrap: {
    marginTop: theme.space.md,
  },
  chip: {
    height: 36,
    minWidth: 44,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chipDone: { backgroundColor: theme.colors.brandDeep, borderColor: theme.colors.brand },
  chipCurrent: { backgroundColor: theme.colors.brand, borderColor: theme.colors.brand },
  chipText: {
    color: theme.colors.textDim,
    fontFamily: theme.font.mono,
    fontSize: 14,
    fontWeight: "700",
  },
  chipTextDone: { color: theme.colors.brand },
  chipTextCurrent: { color: "#0B0B0B" },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space.md,
    paddingVertical: theme.space.lg,
    marginTop: "auto",
    marginBottom: theme.space.md,
  },
  ctrlBtn: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
});
