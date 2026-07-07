import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions } from "expo-camera";
import { theme } from "@/src/theme";
import {
  COLOR_HEX,
  COLOR_NAME,
  faceIndex,
  solvedState,
  stateToFacelets,
  validateColorCount,
  CENTER_COLOR,
} from "@/src/lib/cube";
import {
  loadStoredSolves,
  saveStoredSolves,
} from "@/src/lib/storage";

import { apiPost } from "@/src/lib/api";
import CubeNet from "@/src/components/CubeNet";

const FACE_ORDER = ["U", "R", "F", "D", "L", "B"];

const HOLDING_HINT = {
  U: "Point camera at the WHITE (Up) face",
  R: "Point camera at the RED (Right) face",
  F: "Point camera at the GREEN (Front) face",
  D: "Point camera at the YELLOW (Down) face",
  L: "Point camera at the ORANGE (Left) face",
  B: "Point camera at the BLUE (Back) face",
};

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [faceIdx, setFaceIdx] = useState(0);
  const [state, setState] = useState(solvedState());
  const [detecting, setDetecting] = useState(false);
  const [reviewingColors, setReviewingColors] = useState(null);
  const [error, setError] = useState(null);
  const [solving, setSolving] = useState(false);
  const cameraRef = useRef(null);

  const face = FACE_ORDER[faceIdx];

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const capture = async () => {
    if (!cameraRef.current) return;

    setError(null);
    setDetecting(true);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
        skipProcessing: true,
      });

      if (!photo?.base64) {
        throw new Error("No image captured");
      }

      const res = await apiPost("/detect-face", {
        image_base64: photo.base64,
      });

      if (!res?.colors || res.colors.length !== 9) {
        throw new Error("Invalid response from detector");
      }

      setReviewingColors(res.colors);

    } catch (e) {
      console.log(e);

      setError(
        `Detection failed: ${e?.message || String(e)}`
      );

      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
    } finally {
      setDetecting(false);
    }
  };
  const [allFacesCaptured, setAllFacesCaptured] = useState(false);
  const confirmFace = () => {
    if (!reviewingColors) return;
    const start = faceIndex(face) * 9;
    setState((prev) => {
      const copy = [...prev];
      for (let i = 0; i < 9; i++) {
        copy[start + i] = reviewingColors[i];
      }
      copy[start + 4] = CENTER_COLOR[face];
      return copy;
    });
    setReviewingColors(null);
    if (faceIdx === 5) {
      setAllFacesCaptured(true);
    } else {
      setFaceIdx((v) => v + 1);
    }
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );
  };
  const editReviewColor = (i) => {
    if (!reviewingColors) return;
    // cycle through colors on tap
    const order = ["W", "Y", "R", "O", "B", "G"];
    setReviewingColors((prev) => {
      if (!prev) return prev;
      const cur = prev[i];
      const next = order[(order.indexOf(cur) + 1) % order.length];
      const copy = prev.slice();
      copy[i] = next;
      return copy;
    });
    Haptics.selectionAsync();
  };

  const restart = () => {
    setFaceIdx(0);
    setAllFacesCaptured(false);
    setState(solvedState());
    setReviewingColors(null);
    setError(null);
  };

  const finishAndSolve = async () => {
    const check = validateColorCount(state);

    if (!check.ok) {
      setError(`Invalid state: ${check.message}`);
      return;
    }

    setSolving(true);

    try {
      const facelets = stateToFacelets(state);

      const res = await apiPost("/solve", {
        facelets,
      });

      const old = await loadStoredSolves();

      const updated = [
        {
          id: Date.now().toString(),
          facelets,
          solution: res.solution,
          move_count: res.move_count,
          input_method: "scan",
          created_at: new Date().toISOString(),
        },
        ...old,
      ];

      await saveStoredSolves(updated);

      router.push({
        pathname: "/solve",
        params: {
          facelets,
          solution: res.solution,
          moves: res.moves.join(","),
        },
      });

    } catch (e) {
      setError(
        `Unsolvable — please recheck faces. (${String(
          e?.message || e
        ).slice(0, 100)})`
      );
    } finally {
      setSolving(false);
    }
  };
  const capturedAll = allFacesCaptured && !reviewingColors;

  if (!permission) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.title}>Camera Scan</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="camera-outline" size={56} color={theme.colors.textFaint} />
          <Text style={styles.permTitle}>Camera access required</Text>
          <Text style={styles.permSub}>
            We need your camera to scan each face of the cube.
          </Text>
          <Pressable onPress={requestPermission} style={styles.grantBtn} testID="grant-perm">
            <Text style={styles.grantText}>Grant permission</Text>
          </Pressable>
          <Pressable onPress={() => router.replace("/manual")} style={{ marginTop: 12 }}>
            <Text style={{ color: theme.colors.textDim, fontSize: 13 }}>Use manual entry instead</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Review mode
  if (reviewingColors) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => setReviewingColors(null)} hitSlop={12} testID="back-review">
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.title}>Confirm Face {faceIdx + 1}/6</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: theme.space.lg, alignItems: "center" }}>
          <Text style={styles.reviewHint}>Tap any sticker to change its color</Text>
          <View style={styles.reviewGrid} testID="review-grid">
            {reviewingColors.map((c, i) => (
              <Pressable
                key={i}
                onPress={() => editReviewColor(i)}
                style={[styles.reviewCell, { backgroundColor: COLOR_HEX[c] }]}
                testID={`review-cell-${i}`}
              >
                <Text style={styles.reviewCellLabel}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.centerHint}>
            Center is {COLOR_NAME[CENTER_COLOR[face]]} — this defines the face.
          </Text>
          <Pressable onPress={confirmFace} style={styles.solveBtn} testID="confirm-face">
            <Ionicons name="checkmark" size={22} color="#0B0B0B" />
            <Text style={styles.solveText}>Confirm & continue</Text>
          </Pressable>
          <Pressable onPress={() => setReviewingColors(null)} style={styles.linkBtn} testID="retake">
            <Text style={styles.linkText}>Retake photo</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Captured all faces: preview + solve
  if (capturedAll) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.title}>Review Cube</Text>
          <Pressable onPress={restart} hitSlop={12} testID="restart-scan">
            <Ionicons name="refresh" size={20} color={theme.colors.textDim} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: theme.space.md, paddingBottom: 32 }}>
          <Text style={styles.reviewHint}>Tap any sticker to fix a color, then solve.</Text>
          <View style={{ paddingVertical: theme.space.md, alignItems: "center" }}>
            <CubeNet
              state={state}
              onStickerPress={(f, i) => {
                if (i === 4) return;
                // cycle color on tap
                const order = ["W", "Y", "R", "O", "B", "G"];
                setState((prev) => {
                  const idx = faceIndex(f) * 9 + i;
                  const cur = prev[idx];
                  const next = order[(order.indexOf(cur) + 1) % order.length];
                  const copy = prev.slice();
                  copy[idx] = next;
                  return copy;
                });
              }}
            />
          </View>
          {error && (
            <View style={styles.errorBox} testID="scan-error">
              <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <Pressable
            onPress={finishAndSolve}
            disabled={solving}
            style={({ pressed }) => [styles.solveBtn, (pressed || solving) && { opacity: 0.85 }]}
            testID="scan-solve"
          >
            {solving ? <ActivityIndicator color="#0B0B0B" /> : (
              <>
                <Ionicons name="flash" size={20} color="#0B0B0B" />
                <Text style={styles.solveText}>Solve</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // Live camera capture
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>
          Face {faceIdx + 1}/6 · {face}
        </Text>
        <Pressable onPress={restart} hitSlop={12}>
          <Ionicons name="refresh" size={20} color={theme.colors.textDim} />
        </Pressable>
      </View>

      <View style={styles.stepDots}>
        {FACE_ORDER.map((f, i) => (
          <View
            key={f}
            style={[
              styles.dot,
              i < faceIdx && styles.dotDone,
              i === faceIdx && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.cameraWrap}>
        <CameraView ref={(r) => (cameraRef.current = r)} style={styles.camera} facing="back">
          <View style={styles.overlay}>
            <View style={styles.grid}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.gridCell,
                    i === 4 && { backgroundColor: `${COLOR_HEX[CENTER_COLOR[face]]}40` },
                  ]}
                />
              ))}
            </View>
          </View>
        </CameraView>
      </View>

      <Text style={styles.hint}>{HOLDING_HINT[face]}</Text>

      {error && (
        <View style={[styles.errorBox, { marginHorizontal: theme.space.lg }]} testID="capture-error">
          <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.captureRow}>
        <Pressable
          onPress={() => router.replace("/manual")}
          style={styles.altBtn}
          testID="switch-manual"
        >
          <Ionicons name="grid-outline" size={22} color={theme.colors.text} />
        </Pressable>
        <Pressable
          onPress={capture}
          disabled={detecting}
          style={[styles.captureBtn, detecting && { opacity: 0.85 }]}
          testID="capture-btn"
        >
          {detecting ? (
            <ActivityIndicator color="#0B0B0B" />
          ) : (
            <Ionicons name="camera" size={30} color="#0B0B0B" />
          )}
        </Pressable>
        <View style={{ width: 52 }} />
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
  title: { color: theme.colors.text, fontSize: 17, fontWeight: "700" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  stepDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: theme.space.md,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surface3,
  },
  dotDone: { backgroundColor: theme.colors.brandDim },
  dotActive: { backgroundColor: theme.colors.brand },
  cameraWrap: {
    marginHorizontal: theme.space.lg,
    width: "100%",           // Force full width up to the constraint
    maxWidth: 340,           // Constrain the width instead of height
    aspectRatio: 1,
    alignSelf: "center",
    borderRadius: theme.radius.md,
    overflow: "hidden",
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  camera: {
    width: "100%",
    height: "100%"
  },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  grid: {
    width: "80%",
    aspectRatio: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "stretch", // Ensures grid items distribute correctly
  },
  gridCell: {
    width: "33.33%",
    height: "33.33%",
    borderColor: "#FFFFFFCC",
    borderWidth: 2,
  },
  hint: {
    color: theme.colors.textDim,
    textAlign: "center",
    marginTop: theme.space.md,
    fontSize: 13,
  },
  captureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: theme.space.lg,
    marginTop: "auto",
    marginBottom: theme.space.lg,
  },
  altBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: theme.colors.brandDim,
  },
  reviewHint: {
    color: theme.colors.textDim,
    fontSize: 13,
    marginBottom: theme.space.lg,
    textAlign: "center",
  },
  reviewGrid: {
    width: 240,
    height: 240,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  reviewCell: {
    width: (240 - 8) / 3,
    height: (240 - 8) / 3,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewCellLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#00000060",
  },
  centerHint: {
    color: theme.colors.textFaint,
    fontSize: 12,
    marginTop: theme.space.md,
    textAlign: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    marginTop: theme.space.xl,
    height: 56,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brand,
    paddingHorizontal: theme.space.xl,
    alignSelf: "stretch",
  },
  solveText: { color: "#0B0B0B", fontSize: 16, fontWeight: "800" },
  linkBtn: { marginTop: theme.space.md, alignItems: "center", padding: 8 },
  linkText: { color: theme.colors.textDim, fontSize: 13 },
  permTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "700" },
  permSub: { color: theme.colors.textDim, fontSize: 13, textAlign: "center" },
  grantBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brand,
  },
  grantText: { color: "#0B0B0B", fontWeight: "800" },
});
