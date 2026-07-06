// Cube color codes: W Y R O B G
// Internal state is an array of 54 stickers in URFDLB order.

export const FACES = ["U", "R", "F", "D", "L", "B"];

export const CENTER_COLOR = {
  U: "W",
  R: "R",
  F: "G",
  D: "Y",
  L: "O",
  B: "B",
};

export const COLOR_HEX = {
  W: "#FFFFFF",
  Y: "#FFD500",
  R: "#FF0000",
  O: "#FF8800",
  B: "#0046AD",
  G: "#009E60",
};

export const COLOR_NAME = {
  W: "White",
  Y: "Yellow",
  R: "Red",
  O: "Orange",
  B: "Blue",
  G: "Green",
};

export const ALL_COLORS = [
  "W",
  "Y",
  "R",
  "O",
  "B",
  "G",
];

export function colorToFace(color) {
  for (const face of FACES) {
    if (CENTER_COLOR[face] === color) {
      return face;
    }
  }

  return "U";
}

export function solvedState() {
  const out = [];

  for (const face of FACES) {
    for (let i = 0; i < 9; i++) {
      out.push(CENTER_COLOR[face]);
    }
  }

  return out;
}

export function faceIndex(face) {
  return FACES.indexOf(face);
}

export function getSticker(state, face, index) {
  return state[faceIndex(face) * 9 + index];
}

export function setSticker(state, face, index, color) {
  const copy = state.slice();

  copy[faceIndex(face) * 9 + index] = color;

  return copy;
}

export function stateToFacelets(state) {
  return state.map(colorToFace).join("");
}

export function validateColorCount(state) {

  const counts = {
    W: 0,
    Y: 0,
    R: 0,
    O: 0,
    B: 0,
    G: 0,
  };

  for (const c of state) {
    counts[c]++;
  }

  for (const c of ALL_COLORS) {

    if (counts[c] !== 9) {

      return {

        ok: false,

        message: `${COLOR_NAME[c]} has ${counts[c]}/9 stickers`

      };

    }

  }

  for (const face of FACES) {

    if (getSticker(state, face, 4) !== CENTER_COLOR[face]) {

      return {

        ok: false,

        message: `${face} center must be ${COLOR_NAME[CENTER_COLOR[face]]}`

      };

    }

  }

  return {

    ok: true

  };

}

// ---------------- Cube Move Engine ----------------

const U = (i) => i;
const R = (i) => 9 + i;
const F = (i) => 18 + i;
const D = (i) => 27 + i;
const L = (i) => 36 + i;
const B = (i) => 45 + i;

// Rotate one face clockwise
function faceCwPerm(faceStart) {
  const s = faceStart;

  return [
    [s + 0, s + 2, s + 8, s + 6],
    [s + 1, s + 5, s + 7, s + 3],
  ];
}

const SIDE_CYCLES = {
  U: [
    [F(0), L(0), B(0), R(0)],
    [F(1), L(1), B(1), R(1)],
    [F(2), L(2), B(2), R(2)],
  ],

  D: [
    [F(6), R(6), B(6), L(6)],
    [F(7), R(7), B(7), L(7)],
    [F(8), R(8), B(8), L(8)],
  ],

  R: [
    [U(2), B(6), D(2), F(2)],
    [U(5), B(3), D(5), F(5)],
    [U(8), B(0), D(8), F(8)],
  ],

  L: [
    [U(0), F(0), D(0), B(8)],
    [U(3), F(3), D(3), B(5)],
    [U(6), F(6), D(6), B(2)],
  ],

  F: [
    [U(6), R(0), D(2), L(8)],
    [U(7), R(3), D(1), L(5)],
    [U(8), R(6), D(0), L(2)],
  ],

  B: [
    [U(2), L(0), D(6), R(8)],
    [U(1), L(3), D(7), R(5)],
    [U(0), L(6), D(8), R(2)],
  ],
};

const FACE_STARTS = {
  U: 0,
  R: 9,
  F: 18,
  D: 27,
  L: 36,
  B: 45,
};

function applyCycleOnce(state, cycle) {

  const copy = state.slice();

  const last = copy[cycle[cycle.length - 1]];

  for (let i = cycle.length - 1; i > 0; i--) {

    copy[cycle[i]] = copy[cycle[i - 1]];

  }

  copy[cycle[0]] = last;

  return copy;
}

function applyFaceCw(state, face) {

  let s = state;

  for (const cycle of faceCwPerm(FACE_STARTS[face])) {

    s = applyCycleOnce(s, cycle);

  }

  for (const cycle of SIDE_CYCLES[face]) {

    s = applyCycleOnce(s, cycle);

  }

  return s;
}
// ---------------- Move Application ----------------

export function applyMove(state, move) {
  const m = move.trim();

  if (!m) return state;

  const face = m[0];

  if (!(face in FACE_STARTS)) {
    return state;
  }

  let turns = 1;

  if (m.length === 2) {
    if (m[1] === "'") {
      turns = 3;
    } else if (m[1] === "2") {
      turns = 2;
    }
  }

  let s = state;

  for (let i = 0; i < turns; i++) {
    s = applyFaceCw(s, face);
  }

  return s;
}

export function applyMoves(state, moves) {

  let s = state;

  for (const move of moves) {
    s = applyMove(s, move);
  }

  return s;
}

// ---------------- Scramble Generator ----------------

export function generateScramble(length = 20) {

  const faces = ["U", "D", "L", "R", "F", "B"];

  const suffixes = ["", "'", "2"];

  const opposite = {
    U: "D",
    D: "U",
    L: "R",
    R: "L",
    F: "B",
    B: "F",
  };

  const scramble = [];

  let last = "";
  let lastOpposite = "";

  while (scramble.length < length) {

    const face = faces[Math.floor(Math.random() * faces.length)];

    if (face === last) continue;

    if (face === lastOpposite && scramble.length > 0) continue;

    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    scramble.push(face + suffix);

    last = face;
    lastOpposite = opposite[face];
  }

  return scramble;
}
// ---------------- Move Descriptions ----------------

export function moveDescription(move) {
  const map = {
    U: "Up face clockwise",
    "U'": "Up face counter-clockwise",
    U2: "Up face 180°",

    D: "Down face clockwise",
    "D'": "Down face counter-clockwise",
    D2: "Down face 180°",

    L: "Left face clockwise",
    "L'": "Left face counter-clockwise",
    L2: "Left face 180°",

    R: "Right face clockwise",
    "R'": "Right face counter-clockwise",
    R2: "Right face 180°",

    F: "Front face clockwise",
    "F'": "Front face counter-clockwise",
    F2: "Front face 180°",

    B: "Back face clockwise",
    "B'": "Back face counter-clockwise",
    B2: "Back face 180°",
  };

  return map[move] || move;
}