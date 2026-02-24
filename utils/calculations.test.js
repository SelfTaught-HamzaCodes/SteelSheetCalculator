import {
  SHEET_LENGTHS_FT,
  RUNNING_LENGTH_OPTIONS,
  SHEET_WIDTH_MM_OPTIONS,
  THICKNESS_OPTIONS_MM,
  RUNNING_LENGTH_MAP_1000_MM,
  getMappedRunningLength,
  lengthInFeet,
  lengthInInches,
  numberOfSheets,
  weightPerSheetKg,
  costPerSheetRs,
  runCalculation,
} from './calculations';

// --- Constants ---

describe('exported constants', () => {
  test('SHEET_LENGTHS_FT contains the default sheet sizes', () => {
    expect(SHEET_LENGTHS_FT).toEqual([8, 10, 12]);
  });

  test('RUNNING_LENGTH_OPTIONS contains common presets', () => {
    expect(RUNNING_LENGTH_OPTIONS).toEqual([1270, 1340, 1410]);
  });

  test('SHEET_WIDTH_MM_OPTIONS contains 914, 1000, and 1200', () => {
    expect(SHEET_WIDTH_MM_OPTIONS).toEqual([914, 1000, 1200]);
  });

  test('THICKNESS_OPTIONS_MM has entries matching the running-length map', () => {
    const mapKeys = Object.keys(RUNNING_LENGTH_MAP_1000_MM).map(Number);
    expect(THICKNESS_OPTIONS_MM).toEqual(mapKeys);
  });
});

// --- getMappedRunningLength ---

describe('getMappedRunningLength', () => {
  test('returns the direct map value for 1000 mm width', () => {
    expect(getMappedRunningLength(1000, 0.1)).toBe(1270);
    expect(getMappedRunningLength(1000, 0.09)).toBe(1400);
    expect(getMappedRunningLength(1000, 0.16)).toBe(800);
  });

  test('scales correctly for 914 mm width', () => {
    // formula: round(1000 * mapValue / 914)
    expect(getMappedRunningLength(914, 0.1)).toBe(Math.round((1000 * 1270) / 914));
    expect(getMappedRunningLength(914, 0.095)).toBe(Math.round((1000 * 1340) / 914));
  });

  test('scales correctly for 1200 mm width', () => {
    expect(getMappedRunningLength(1200, 0.1)).toBe(Math.round((1000 * 1270) / 1200));
    expect(getMappedRunningLength(1200, 0.15)).toBe(Math.round((1000 * 850) / 1200));
  });

  test('returns null for a thickness not in the map', () => {
    expect(getMappedRunningLength(1000, 0.5)).toBeNull();
    expect(getMappedRunningLength(1000, 0.2)).toBeNull();
    expect(getMappedRunningLength(914, 0.05)).toBeNull();
  });

  test('handles floating-point precision (0.095 should match)', () => {
    expect(getMappedRunningLength(1000, 0.095)).toBe(1340);
  });
});

// --- lengthInFeet / lengthInInches ---

describe('lengthInFeet', () => {
  test('converts metres to feet (rounded)', () => {
    expect(lengthInFeet(1270)).toBe(Math.round(1270 * 3.28084));
    expect(lengthInFeet(1000)).toBe(Math.round(1000 * 3.28084));
  });

  test('returns 0 for 0 input', () => {
    expect(lengthInFeet(0)).toBe(0);
  });
});

describe('lengthInInches', () => {
  test('converts metres to inches (rounded)', () => {
    expect(lengthInInches(1270)).toBe(Math.round(1270 * 3.28084 * 12));
  });

  test('inches is roughly feet * 12 (independent rounding)', () => {
    const m = 1340;
    const inches = lengthInInches(m);
    const feet = lengthInFeet(m);
    // both round independently, so allow a small difference
    expect(Math.abs(inches - feet * 12)).toBeLessThanOrEqual(6);
  });
});

// --- numberOfSheets ---

describe('numberOfSheets', () => {
  test('calculates correct sheet count for 8 ft sheets', () => {
    // 1270 m / (8 * 0.3048 m) = 1270 / 2.4384 ≈ 520.9 → floor = 520
    expect(numberOfSheets(1270, 8)).toBe(520);
  });

  test('calculates correct sheet count for 10 ft sheets', () => {
    // 1270 / (10 * 0.3048) = 1270 / 3.048 ≈ 416.6 → floor = 416
    expect(numberOfSheets(1270, 10)).toBe(416);
  });

  test('calculates correct sheet count for 12 ft sheets', () => {
    // 1270 / (12 * 0.3048) = 1270 / 3.6576 ≈ 347.1 → floor = 347
    expect(numberOfSheets(1270, 12)).toBe(347);
  });

  test('returns 0 when running length is 0', () => {
    expect(numberOfSheets(0, 8)).toBe(0);
  });
});

// --- weightPerSheetKg ---

describe('weightPerSheetKg', () => {
  test('weight = 1000 kg / number of sheets', () => {
    const sheets = numberOfSheets(1270, 8); // 520
    expect(weightPerSheetKg(1270, 8)).toBeCloseTo(1000 / sheets, 5);
  });

  test('returns 0 when there are 0 sheets', () => {
    expect(weightPerSheetKg(0, 8)).toBe(0);
  });
});

// --- costPerSheetRs ---

describe('costPerSheetRs', () => {
  test('cost per sheet = round(total cost / number of sheets)', () => {
    const sheets = numberOfSheets(1270, 8); // 520
    expect(costPerSheetRs(250000, 1270, 8)).toBe(Math.round(250000 / sheets));
  });

  test('returns 0 when cost is 0', () => {
    expect(costPerSheetRs(0, 1270, 8)).toBe(0);
  });

  test('returns 0 when there are 0 sheets', () => {
    expect(costPerSheetRs(250000, 0, 8)).toBe(0);
  });
});

// --- runCalculation (unit) ---

describe('runCalculation', () => {
  const input = {
    thicknessMm: 0.1,
    runningLengthMeterPerTon: 1270,
    costingMaterialRs: 250000,
  };

  test('returns correct top-level fields', () => {
    const result = runCalculation(input, [8, 10]);

    expect(result.inputSummary.thicknessMm).toBe(0.1);
    expect(result.inputSummary.metersPerTon).toBe(1270);
    expect(result.inputSummary.costingMaterialRs).toBe(250000);
    expect(result.lengthFeet).toBe(lengthInFeet(1270));
    expect(result.lengthInches).toBe(lengthInInches(1270));
  });

  test('returns one entry per selected sheet size', () => {
    const result = runCalculation(input, [8, 10, 12]);
    expect(result.resultsPerSize).toHaveLength(3);
    expect(result.resultsPerSize.map((r) => r.sheetLengthFt)).toEqual([8, 10, 12]);
  });

  test('each entry has correct numberOfSheets, weight, and cost', () => {
    const result = runCalculation(input, [8]);
    const r = result.resultsPerSize[0];

    expect(r.numberOfSheets).toBe(numberOfSheets(1270, 8));
    expect(r.weightPerSheetKg).toBeCloseTo(
      Math.round(weightPerSheetKg(1270, 8) * 1000) / 1000,
      3
    );
    expect(r.costPerSheetRs).toBe(costPerSheetRs(250000, 1270, 8));
  });

  test('handles empty sheet size array', () => {
    const result = runCalculation(input, []);
    expect(result.resultsPerSize).toEqual([]);
  });

  test('handles null/undefined sheet size array gracefully', () => {
    const result = runCalculation(input, null);
    expect(result.resultsPerSize).toEqual([]);
  });
});

// --- Integration tests ---

describe('integration: getMappedRunningLength → runCalculation pipeline', () => {
  test('lookup feeds correctly into a full calculation for 1000 mm width', () => {
    const width = 1000;
    const thickness = 0.1;
    const cost = 300000;

    const runningLength = getMappedRunningLength(width, thickness);
    expect(runningLength).toBe(1270);

    const result = runCalculation(
      { thicknessMm: thickness, runningLengthMeterPerTon: runningLength, costingMaterialRs: cost },
      [8, 10, 12]
    );

    expect(result.resultsPerSize).toHaveLength(3);
    result.resultsPerSize.forEach((r) => {
      expect(r.numberOfSheets).toBeGreaterThan(0);
      expect(r.weightPerSheetKg).toBeGreaterThan(0);
      expect(r.costPerSheetRs).toBeGreaterThan(0);
    });
  });

  test('lookup feeds correctly into a full calculation for 914 mm width', () => {
    const width = 914;
    const thickness = 0.12;
    const cost = 200000;

    const runningLength = getMappedRunningLength(width, thickness);
    expect(runningLength).toBe(Math.round((1000 * 1065) / 914));

    const result = runCalculation(
      { thicknessMm: thickness, runningLengthMeterPerTon: runningLength, costingMaterialRs: cost },
      [8, 10]
    );

    expect(result.inputSummary.metersPerTon).toBe(runningLength);
    expect(result.resultsPerSize[0].numberOfSheets).toBeGreaterThan(0);
    expect(result.resultsPerSize[1].numberOfSheets).toBeGreaterThan(0);
  });

  test('non-standard thickness returns null and requires manual running length', () => {
    const runningLength = getMappedRunningLength(1000, 0.25);
    expect(runningLength).toBeNull();

    const manualRunningLength = 600;
    const result = runCalculation(
      { thicknessMm: 0.25, runningLengthMeterPerTon: manualRunningLength, costingMaterialRs: 150000 },
      [8]
    );

    expect(result.inputSummary.metersPerTon).toBe(600);
    expect(result.resultsPerSize[0].numberOfSheets).toBe(numberOfSheets(600, 8));
  });
});

describe('integration: all supported width × thickness combinations', () => {
  test.each(SHEET_WIDTH_MM_OPTIONS)('every thickness produces valid results for %i mm width', (width) => {
    THICKNESS_OPTIONS_MM.forEach((thickness) => {
      const runningLength = getMappedRunningLength(width, thickness);
      expect(runningLength).not.toBeNull();
      expect(runningLength).toBeGreaterThan(0);

      const result = runCalculation(
        { thicknessMm: thickness, runningLengthMeterPerTon: runningLength, costingMaterialRs: 100000 },
        SHEET_LENGTHS_FT
      );

      result.resultsPerSize.forEach((r) => {
        expect(r.numberOfSheets).toBeGreaterThan(0);
        expect(r.weightPerSheetKg).toBeGreaterThan(0);
        expect(r.costPerSheetRs).toBeGreaterThan(0);
      });
    });
  });
});

describe('integration: cross-size consistency', () => {
  const runningLength = 1270;
  const cost = 250000;

  test('larger sheets produce fewer sheets per coil', () => {
    const sheets8 = numberOfSheets(runningLength, 8);
    const sheets10 = numberOfSheets(runningLength, 10);
    const sheets12 = numberOfSheets(runningLength, 12);

    expect(sheets8).toBeGreaterThan(sheets10);
    expect(sheets10).toBeGreaterThan(sheets12);
  });

  test('larger sheets weigh more per sheet', () => {
    const weight8 = weightPerSheetKg(runningLength, 8);
    const weight10 = weightPerSheetKg(runningLength, 10);
    const weight12 = weightPerSheetKg(runningLength, 12);

    expect(weight12).toBeGreaterThan(weight10);
    expect(weight10).toBeGreaterThan(weight8);
  });

  test('larger sheets cost more per sheet', () => {
    const cost8 = costPerSheetRs(cost, runningLength, 8);
    const cost10 = costPerSheetRs(cost, runningLength, 10);
    const cost12 = costPerSheetRs(cost, runningLength, 12);

    expect(cost12).toBeGreaterThan(cost10);
    expect(cost10).toBeGreaterThan(cost8);
  });

  test('total weight across all sheets approximates 1 ton', () => {
    SHEET_LENGTHS_FT.forEach((ft) => {
      const sheets = numberOfSheets(runningLength, ft);
      const weight = weightPerSheetKg(runningLength, ft);
      const totalKg = sheets * weight;
      // floor rounding means total is slightly under 1000 kg
      expect(totalKg).toBeLessThanOrEqual(1000);
      expect(totalKg).toBeGreaterThan(990);
    });
  });

  test('total cost across all sheets approximates material cost', () => {
    SHEET_LENGTHS_FT.forEach((ft) => {
      const sheets = numberOfSheets(runningLength, ft);
      const perSheet = costPerSheetRs(cost, runningLength, ft);
      const totalCost = sheets * perSheet;
      // rounding can push total slightly above or below the original cost
      expect(totalCost).toBeGreaterThan(cost * 0.99);
      expect(totalCost).toBeLessThan(cost * 1.01);
    });
  });
});

describe('integration: history serialisation round-trip', () => {
  test('result object survives JSON serialise/deserialise', () => {
    const input = {
      thicknessMm: 0.13,
      runningLengthMeterPerTon: getMappedRunningLength(1000, 0.13),
      costingMaterialRs: 180000,
    };
    const original = runCalculation(input, [8, 10, 12]);

    const serialised = JSON.stringify(original);
    const restored = JSON.parse(serialised);

    expect(restored).toEqual(original);
  });

  test('input snapshot survives round-trip and can reproduce the same result', () => {
    const runningLength = getMappedRunningLength(1200, 0.14);
    const inputSnapshot = {
      thicknessMm: 0.14,
      runningLengthMeterPerTon: runningLength,
      costingMaterialRs: 220000,
      selectedSheetLengthsFt: [8, 12],
      sheetWidthMm: 1200,
    };

    const firstResult = runCalculation(
      {
        thicknessMm: inputSnapshot.thicknessMm,
        runningLengthMeterPerTon: inputSnapshot.runningLengthMeterPerTon,
        costingMaterialRs: inputSnapshot.costingMaterialRs,
      },
      inputSnapshot.selectedSheetLengthsFt
    );

    const restored = JSON.parse(JSON.stringify(inputSnapshot));
    const secondResult = runCalculation(
      {
        thicknessMm: restored.thicknessMm,
        runningLengthMeterPerTon: restored.runningLengthMeterPerTon,
        costingMaterialRs: restored.costingMaterialRs,
      },
      restored.selectedSheetLengthsFt
    );

    expect(secondResult).toEqual(firstResult);
  });
});

describe('integration: wider coil produces shorter running length', () => {
  test.each(THICKNESS_OPTIONS_MM)('for thickness %f mm, wider coils have shorter running length', (thickness) => {
    const rl914 = getMappedRunningLength(914, thickness);
    const rl1000 = getMappedRunningLength(1000, thickness);
    const rl1200 = getMappedRunningLength(1200, thickness);

    expect(rl914).toBeGreaterThan(rl1000);
    expect(rl1000).toBeGreaterThan(rl1200);
  });
});
