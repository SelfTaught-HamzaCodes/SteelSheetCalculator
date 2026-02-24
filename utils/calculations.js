// steel sheet calcs - 1 ton coil, running lenght = total meters
const FEET_TO_METERS = 0.3048;
const METERS_TO_INCHES = 39.3701;
const METERS_TO_FEET = 3.28084;
const KG_PER_TON = 1000;

// default sheet lengths we show (feet)
export const SHEET_LENGTHS_FT = [8, 10, 12];

// common m/ton presets
export const RUNNING_LENGTH_OPTIONS = [1270, 1340, 1410];

// coil width options in mm
export const SHEET_WIDTH_MM_OPTIONS = [914, 1000, 1200];

// thikness presets from the map (mm)
export const THICKNESS_OPTIONS_MM = [0.09, 0.095, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16];

// m/ton for 1000mm width. other widths: (1000 * this) / widthMm
export const RUNNING_LENGTH_MAP_1000_MM = {
  0.09: 1400,
  0.095: 1340,
  0.1: 1270,
  0.11: 1158,
  0.12: 1065,
  0.13: 980,
  0.14: 910,
  0.15: 850,
  0.16: 800,
};

// lookup m/ton from map for this width + thikness, null if not found
export function getMappedRunningLength(widthMm, thicknessMm) {
  const t = Math.round(thicknessMm * 1000) / 1000;
  const key = Object.keys(RUNNING_LENGTH_MAP_1000_MM).find((k) => Math.abs(parseFloat(k) - t) < 0.001);
  if (key == null) return null;
  const meters1000 = RUNNING_LENGTH_MAP_1000_MM[key];
  if (widthMm === 1000) return meters1000;
  return Math.round((1000 * meters1000) / widthMm);
}

// convert m/ton to feet for display
export function lengthInFeet(runningLengthMeterPerTon) {
  return Math.round(runningLengthMeterPerTon * METERS_TO_FEET);
}

export function lengthInInches(runningLengthMeterPerTon) {
  return Math.round(runningLengthMeterPerTon * METERS_TO_FEET * 12);
}

// how many sheets of X feet from 1 ton
export function numberOfSheets(runningLengthMeterPerTon, sheetLengthFeet) {
  const lengthM = runningLengthMeterPerTon;
  const sheetLengthM = sheetLengthFeet * FEET_TO_METERS;
  return Math.floor(lengthM / sheetLengthM);
}

// weight per sheet = 1000 / num sheets
export function weightPerSheetKg(runningLengthMeterPerTon, sheetLengthFeet) {
  const n = numberOfSheets(runningLengthMeterPerTon, sheetLengthFeet);
  return n > 0 ? KG_PER_TON / n : 0;
}

// cost per sheet = total cost / num sheets
export function costPerSheetRs(totalCostRs, runningLengthMeterPerTon, sheetLengthFeet) {
  const n = numberOfSheets(runningLengthMeterPerTon, sheetLengthFeet);
  return n > 0 ? Math.round(totalCostRs / n) : 0;
}

// run the full calcuation for selected sheet sizes
export function runCalculation(input, selectedSheetLengthsFt) {
  const { runningLengthMeterPerTon, costingMaterialRs } = input;
  const lengthFeet = lengthInFeet(runningLengthMeterPerTon);
  const lengthInches = lengthInInches(runningLengthMeterPerTon);

  const resultsPerSize = (selectedSheetLengthsFt || []).map((ft) => {
    const numSheets = numberOfSheets(runningLengthMeterPerTon, ft);
    const weightKg = weightPerSheetKg(runningLengthMeterPerTon, ft);
    const costRs = costPerSheetRs(costingMaterialRs, runningLengthMeterPerTon, ft);
    return {
      sheetLengthFt: ft,
      numberOfSheets: numSheets,
      weightPerSheetKg: Math.round(weightKg * 1000) / 1000,
      costPerSheetRs: costRs,
    };
  });

  return {
    inputSummary: {
      thicknessMm: input.thicknessMm,
      metersPerTon: runningLengthMeterPerTon,
      costingMaterialRs,
    },
    lengthFeet,
    lengthInches,
    resultsPerSize,
  };
}
