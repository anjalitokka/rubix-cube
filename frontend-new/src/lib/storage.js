import AsyncStorage from "@react-native-async-storage/async-storage";

const TIMER_KEY = "cube_timer_history";
const SOLVE_KEY = "cube_solve_history";

// ---------- TIMER ----------

export async function loadStoredTimes() {
  try {
    const data = await AsyncStorage.getItem(TIMER_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveStoredTimes(times) {
  try {
    await AsyncStorage.setItem(
      TIMER_KEY,
      JSON.stringify(times)
    );
  } catch {}
}

// ---------- SOLVES ----------

export async function loadStoredSolves() {
  try {
    const data = await AsyncStorage.getItem(SOLVE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveStoredSolves(solves) {
  try {
    await AsyncStorage.setItem(
      SOLVE_KEY,
      JSON.stringify(solves)
    );
  } catch {}
}