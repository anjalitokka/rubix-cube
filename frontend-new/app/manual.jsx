import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { theme } from "@/src/theme";

import {
  ALL_COLORS,
  COLOR_HEX,
  COLOR_NAME,
  FACES,
  faceIndex,
  solvedState,
  stateToFacelets,
  validateColorCount,
  CENTER_COLOR,
} from "@/src/lib/cube";

import CubeNet from "@/src/components/CubeNet";
import { apiPost } from "@/src/lib/api";

export default function ManualEntry() {
  const router = useRouter();

  const [state, setState] = useState(solvedState());
  const [color, setColor] = useState("W");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const setSticker = (face, i) => {
    if (i === 4) return;

    Haptics.selectionAsync();

    const idx = faceIndex(face) * 9 + i;

    setState((prev) => {
      const copy = [...prev];
      copy[idx] = color;
      return copy;
    });
  };

  const reset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setState(solvedState());
    setError(null);
  };

  const clearAll = () => {
    const s = [];

    for (const f of FACES) {
      for (let i = 0; i < 9; i++) {
        s.push(CENTER_COLOR[f]);
      }
    }

    setState(s);
    setError(null);
  };

  const solve = async () => {
    const check = validateColorCount(state);

    if (!check.ok) {
      setError(check.message || "Invalid cube state");

      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );

      return;
    }

    setBusy(true);
    setError(null);

    try {
      const facelets = stateToFacelets(state);

      const res = await apiPost("/solve", {
        facelets,
      });

      try {
        await apiPost("/solves", {
          facelets,
          solution: res.solution,
          move_count: res.move_count,
          input_method: "manual",
        });
      } catch {}

      router.push({
        pathname: "/solve",
        params: {
          facelets,
          solution: res.solution,
          moves: res.moves.join(","),
        },
      });
    } catch (e) {
      const msg = String(e?.message || e);

      if (msg.includes("Unsolvable")) {
        setError(
          "This cube state is unsolvable. Check your colors."
        );
      } else {
        setError(msg);
      }

      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} testID="back-btn">
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>Manual Entry</Text>
        <Pressable onPress={reset} hitSlop={12} testID="reset-btn">
          <Ionicons name="refresh" size={20} color={theme.colors.textDim} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false} testID="manual-scroll">
        <View style={styles.instr}>
          <Text style={styles.instrText}>
            Pick a color below, then tap stickers on the unfolded cube. Centers are fixed and define each face.
          </Text>
        </View>

        <View style={styles.netWrap}>
          <CubeNet state={state} onStickerPress={setSticker} />
        </View>

        <View style={styles.paletteWrap}>
          <Text style={styles.sectionLabel}>PAINT COLOR</Text>
          <View style={styles.paletteRow}>
            {ALL_COLORS.map((c) => {
              const active = color === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => {
                    setColor(c);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.swatch,
                    { backgroundColor: COLOR_HEX[c] },
                    active && styles.swatchActive,
                  ]}
                  testID={`color-${c}`}
                >
                  {active && <Ionicons name="checkmark" size={20} color={c === "W" || c === "Y" ? "#0B0B0B" : "#FFF"} />}
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.colorHint}>Selected: {COLOR_NAME[color]}</Text>
        </View>

        {error && (
          <View style={styles.errorBox} testID="manual-error">
            <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          onPress={solve}
          disabled={busy}
          style={({ pressed }) => [styles.solveBtn, (pressed || busy) && { opacity: 0.85 }]}
          testID="solve-btn"
        >
          {busy ? (
            <ActivityIndicator color="#0B0B0B" />
          ) : (
            <>
              <Ionicons name="flash" size={20} color="#0B0B0B" />
              <Text style={styles.solveText}>Solve</Text>
            </>
          )}
        </Pressable>

        <Pressable onPress={clearAll} style={styles.clearBtn} testID="clear-btn">
          <Text style={styles.clearText}>Clear stickers</Text>
        </Pressable>
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
  instr: { paddingHorizontal: theme.space.lg, paddingBottom: theme.space.md },
  instrText: { color: theme.colors.textDim, fontSize: 13, lineHeight: 20 },
  netWrap: { alignItems: "center", paddingVertical: theme.space.md },
  paletteWrap: {
    marginHorizontal: theme.space.lg,
    marginTop: theme.space.md,
    padding: theme.space.md,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
  },
  sectionLabel: {
    color: theme.colors.textFaint,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
    marginBottom: theme.space.sm,
  },
  paletteRow: { flexDirection: "row", justifyContent: "space-between" },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  swatchActive: { borderColor: theme.colors.brand },
  colorHint: { color: theme.colors.textDim, fontSize: 12, marginTop: theme.space.sm },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: theme.space.lg,
    marginTop: theme.space.md,
    padding: theme.space.md,
    borderRadius: theme.radius.sm,
    backgroundColor: "#3a0f0f",
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  errorText: { color: theme.colors.text, flex: 1, fontSize: 13 },
  solveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: theme.space.lg,
    marginTop: theme.space.lg,
    height: 56,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brand,
  },
  solveText: { color: "#0B0B0B", fontSize: 17, fontWeight: "800", letterSpacing: 0.5 },
  clearBtn: {
    marginTop: theme.space.md,
    alignItems: "center",
    paddingVertical: theme.space.md,
  },
  clearText: { color: theme.colors.textDim, fontSize: 13 },
});
