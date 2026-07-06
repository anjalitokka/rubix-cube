import React from "react";
import Svg, { Polygon, G } from "react-native-svg";
import { View } from "react-native";
import { COLOR_HEX, getSticker } from "../lib/cube";

const SIZE = 200;
const HEIGHT = 220;

const cos30 = Math.cos(Math.PI / 6);
const sin30 = Math.sin(Math.PI / 6);

const STICKER = 30;

const ORIGIN_X = SIZE / 2;
const ORIGIN_Y = 20;

const RIGHT = {
  x: cos30 * STICKER,
  y: sin30 * STICKER,
};

const LEFT = {
  x: -cos30 * STICKER,
  y: sin30 * STICKER,
};

const DOWN = {
  x: 0,
  y: STICKER,
};

function Sticker(
  x,
  y,
  dx,
  dy,
  color,
  keyName,
  opacity = 1
) {
  const p0 = `${x},${y}`;
  const p1 = `${x + dx.x},${y + dx.y}`;
  const p2 = `${x + dx.x + dy.x},${y + dx.y + dy.y}`;
  const p3 = `${x + dy.x},${y + dy.y}`;

  return (
    <Polygon
      key={keyName}
      points={`${p0} ${p1} ${p2} ${p3}`}
      fill={color}
      stroke="#0B0B0B"
      strokeWidth={1.5}
      strokeLinejoin="round"
      opacity={opacity}
    />
  );
}

export default function IsometricCube({
  state,
  size = 260,
}) {

  const stickers = [];
    // ---------- Top Face ----------

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {

      const index = row * 3 + col;

      const color = COLOR_HEX[
        getSticker(state, "U", index)
      ];

      const x =
        ORIGIN_X +
        RIGHT.x * col +
        LEFT.x * row;

      const y =
        ORIGIN_Y +
        RIGHT.y * col +
        LEFT.y * row;

      stickers.push(
        Sticker(
          x,
          y,
          RIGHT,
          LEFT,
          color,
          `U-${index}`
        )
      );
    }
  }

  // ---------- Front Face ----------

  const frontOrigin = {
    x: ORIGIN_X + LEFT.x * 3,
    y: ORIGIN_Y + LEFT.y * 3,
  };

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {

      const index = row * 3 + col;

      const color = COLOR_HEX[
        getSticker(state, "F", index)
      ];

      const x =
        frontOrigin.x +
        RIGHT.x * col +
        DOWN.x * row;

      const y =
        frontOrigin.y +
        RIGHT.y * col +
        DOWN.y * row;

      stickers.push(
        Sticker(
          x,
          y,
          RIGHT,
          DOWN,
          color,
          `F-${index}`,
          0.92
        )
      );
    }
  }
    // ---------- Right Face ----------

  const rightOrigin = {
    x: ORIGIN_X + RIGHT.x * 3 + LEFT.x * 3,
    y: ORIGIN_Y + RIGHT.y * 3 + LEFT.y * 3,
  };

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {

      const index = row * 3 + col;

      const color = COLOR_HEX[
        getSticker(state, "R", index)
      ];

      const x =
        rightOrigin.x -
        LEFT.x * col +
        DOWN.x * row;

      const y =
        rightOrigin.y -
        LEFT.y * col +
        DOWN.y * row;

      stickers.push(
        Sticker(
          x,
          y,
          {
            x: -LEFT.x,
            y: -LEFT.y,
          },
          DOWN,
          color,
          `R-${index}`,
          0.82
        )
      );
    }
  }

  return (
    <View
      style={{
        width: size,
        height: size * (HEIGHT / SIZE),
      }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SIZE} ${HEIGHT}`}
      >
        <G>{stickers}</G>
      </Svg>
    </View>
  );
}