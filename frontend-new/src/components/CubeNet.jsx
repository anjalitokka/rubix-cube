import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { theme } from "../theme";
import { COLOR_HEX, faceIndex, FACES } from "../lib/cube";

/**
 * 2D cube net layout:
 *
 *          [ U ]
 *   [ L ][ F ][ R ][ B ]
 *          [ D ]
 */

const STICKER = 26;
const GAP = 3;
const FACE_SIZE = STICKER * 3 + GAP * 2;
const FACE_GAP = 6;

function FaceGrid({
  face,
  state,
  onStickerPress,
  activeIndex,
  isSelected,
}) {
  return (
    <View
      style={[styles.face, isSelected && styles.faceSelected]}
      testID={`face-${face}`}
    >
      {[0, 1, 2].map((row) => (
        <View key={row} style={styles.row}>
          {[0, 1, 2].map((col) => {
            const i = row * 3 + col;
            const c = state[faceIndex(face) * 9 + i];
            const active = activeIndex === i;

            return (
              <Pressable
                key={col}
                onPress={() => onStickerPress?.(face, i)}
                style={[
                  styles.sticker,
                  { backgroundColor: COLOR_HEX[c] },
                  active && styles.stickerActive,
                ]}
                testID={`sticker-${face}-${i}`}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default function CubeNet({
  state,
  selectedFace,
  onStickerPress,
  activeIndex,
}) {
  const rowU = {
    justifyContent: "center",
    flexDirection: "row",
  };

  return (
    <View style={styles.wrap}>
      <View style={rowU}>
        <View style={{ width: FACE_SIZE }} />

        <FaceGrid
          face="U"
          state={state}
          onStickerPress={onStickerPress}
          activeIndex={selectedFace === "U" ? activeIndex : null}
          isSelected={selectedFace === "U"}
        />
      </View>

      <View style={{ height: FACE_GAP }} />

      <View style={{ flexDirection: "row" }}>
        <FaceGrid
          face="L"
          state={state}
          onStickerPress={onStickerPress}
          activeIndex={selectedFace === "L" ? activeIndex : null}
          isSelected={selectedFace === "L"}
        />

        <View style={{ width: FACE_GAP }} />

        <FaceGrid
          face="F"
          state={state}
          onStickerPress={onStickerPress}
          activeIndex={selectedFace === "F" ? activeIndex : null}
          isSelected={selectedFace === "F"}
        />

        <View style={{ width: FACE_GAP }} />

        <FaceGrid
          face="R"
          state={state}
          onStickerPress={onStickerPress}
          activeIndex={selectedFace === "R" ? activeIndex : null}
          isSelected={selectedFace === "R"}
        />

        <View style={{ width: FACE_GAP }} />

        <FaceGrid
          face="B"
          state={state}
          onStickerPress={onStickerPress}
          activeIndex={selectedFace === "B" ? activeIndex : null}
          isSelected={selectedFace === "B"}
        />
      </View>

      <View style={{ height: FACE_GAP }} />

      <View style={rowU}>
        <View style={{ width: FACE_SIZE }} />

        <FaceGrid
          face="D"
          state={state}
          onStickerPress={onStickerPress}
          activeIndex={selectedFace === "D" ? activeIndex : null}
          isSelected={selectedFace === "D"}
        />
      </View>
    </View>
  );
}

export function NetLabels() {
  return (
    <View>
      {FACES.map((face) => (
        <View key={face} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },

  face: {
    padding: 2,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface3,
  },

  faceSelected: {
    backgroundColor: theme.colors.brandDeep,
  },

  row: {
    flexDirection: "row",
  },

  sticker: {
    width: STICKER,
    height: STICKER,
    margin: GAP / 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#0B0B0B",
  },

  stickerActive: {
    borderColor: theme.colors.brand,
    borderWidth: 2,
  },
});