import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  SHEET_LENGTHS_FT,
  RUNNING_LENGTH_OPTIONS,
  SHEET_WIDTH_MM_OPTIONS,
  THICKNESS_OPTIONS_MM,
  getMappedRunningLength,
  runCalculation,
} from '../utils/calculations';

export default function HomeScreen({
  onCalculate,
  defaultRunningLength = 1270,
  defaultSheetSizes = [8, 10],
  defaultCosting = '',
  defaultThickness = '',
  defaultWidthMm = 1000,
  isDark = false,
}) {
  const { t } = useTranslation();
  const [thickness, setThickness] = useState(defaultThickness.toString());
  const [sheetWidthMm, setSheetWidthMm] = useState(
    SHEET_WIDTH_MM_OPTIONS.includes(defaultWidthMm) ? defaultWidthMm : 1000
  );
  const [runningLength, setRunningLength] = useState(defaultRunningLength);
  const [customRunningLength, setCustomRunningLength] = useState(
    RUNNING_LENGTH_OPTIONS.includes(defaultRunningLength) ? '' : String(defaultRunningLength)
  );
  const [runningLengthFromMap, setRunningLengthFromMap] = useState(false);
  const [costing, setCosting] = useState(() => {
    const val = defaultCosting.toString();
    if (val && !isNaN(parseFloat(val.replace(/,/g, '')))) {
      return parseFloat(val.replace(/,/g, '')).toLocaleString('en-US');
    }
    return val;
  });
  const [customSheetSizes, setCustomSheetSizes] = useState(() => {
    const def = Array.isArray(defaultSheetSizes) ? defaultSheetSizes : [];
    return def.filter((s) => !SHEET_LENGTHS_FT.includes(s));
  });
  const [selectedSizes, setSelectedSizes] = useState(
    Array.isArray(defaultSheetSizes) ? [...defaultSheetSizes] : [8, 10]
  );
  const [runningLengthModalVisible, setRunningLengthModalVisible] = useState(false);
  const [thicknessModalVisible, setThicknessModalVisible] = useState(false);
  const [customThicknessInput, setCustomThicknessInput] = useState('');
  const [customSheetInput, setCustomSheetInput] = useState('');
  const [showAddSheetRow, setShowAddSheetRow] = useState(false);

  // merge preset + custom sheet sizes, sorted
  const allSheetSizes = useMemo(
    () => [...new Set([...SHEET_LENGTHS_FT, ...customSheetSizes])].sort((a, b) => a - b),
    [customSheetSizes]
  );

  const thicknessNum = parseFloat(thickness) || 0;
  // when thikness/width change, try to fill running lenght from map
  useEffect(() => {
    if (thicknessNum <= 0) return;
    const mapped = getMappedRunningLength(sheetWidthMm, thicknessNum);
    if (mapped != null) {
      setRunningLength(mapped);
      setCustomRunningLength('');
      setRunningLengthFromMap(true);
    } else {
      setRunningLength(0);
      setCustomRunningLength('');
      setRunningLengthFromMap(false);
    }
  }, [sheetWidthMm, thicknessNum]);

  const effectiveRunningLength = useMemo(() => {
    const n = parseFloat(customRunningLength);
    if (customRunningLength.trim() !== '' && !isNaN(n) && n > 0) return n;
    return runningLength;
  }, [runningLength, customRunningLength]);

  const toggleSheetSize = (ft) => {
    setSelectedSizes((prev) =>
      prev.includes(ft) ? prev.filter((s) => s !== ft) : [...prev, ft].sort((a, b) => a - b)
    );
  };

  const addCustomSheetSize = () => {
    const n = parseFloat(customSheetInput);
    if (isNaN(n) || n <= 0) return;
    const val = Math.round(n * 10) / 10;
    setCustomSheetSizes((prev) => (prev.includes(val) ? prev : [...prev, val].sort((a, b) => a - b)));
    setCustomSheetInput('');
    setShowAddSheetRow(false);
    if (!selectedSizes.includes(val)) setSelectedSizes((prev) => [...prev, val].sort((a, b) => a - b));
  };

  const removeCustomSheetSize = (ft) => {
    if (!customSheetSizes.includes(ft)) return;
    setCustomSheetSizes((prev) => prev.filter((s) => s !== ft));
    setSelectedSizes((prev) => prev.filter((s) => s !== ft));
  };

  const handleCostingChange = (text) => {
    // strip everything except digits (user might paste with commas)
    const numericValue = text.replace(/[^\d]/g, '');
    if (numericValue === '') {
      setCosting('');
      return;
    }
    // show commas for readability
    const formatted = parseFloat(numericValue).toLocaleString('en-US');
    setCosting(formatted);
  };

  const handleCalculate = () => {
    const thicknessNum = parseFloat(thickness) || 0;
    const costingNum = parseFloat(String(costing).replace(/,/g, '')) || 0;
    if (!thicknessNum || !costingNum || selectedSizes.length === 0) return;
    const result = runCalculation(
      {
        thicknessMm: thicknessNum,
        runningLengthMeterPerTon: effectiveRunningLength,
        costingMaterialRs: costingNum,
      },
      selectedSizes
    );
    onCalculate(result, {
      thicknessMm: thicknessNum,
      runningLengthMeterPerTon: effectiveRunningLength,
      costingMaterialRs: costingNum,
      selectedSheetLengthsFt: selectedSizes,
      sheetWidthMm,
    });
  };

  const theme = isDark ? darkTheme : lightTheme;
  const costingNum = parseFloat(String(costing).replace(/,/g, '')) || 0;
  const canCalculate =
    thicknessNum > 0 && costingNum > 0 && selectedSizes.length > 0 && effectiveRunningLength > 0;

  const isRunningLengthCustom = customRunningLength.trim() !== '' && !RUNNING_LENGTH_OPTIONS.includes(effectiveRunningLength);

  return (
    <KeyboardAvoidingView
      style={[styles.container, theme.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, theme.header]}>
        <View style={styles.headerLeft}>
          <Ionicons name="layers-outline" size={28} color={theme.accentColor} style={styles.headerIcon} />
          <Text style={[styles.headerTitle, theme.text]}>{t('home.title')}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, theme.card]}>
          <View style={[styles.sectionLabelRow, { borderBottomColor: theme.dividerColor }]}>
            <Ionicons name="resize-outline" size={18} color={theme.subtleColor} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: theme.subtleColor }]}>{t('home.thickness').toUpperCase()}</Text>
          </View>
          <Pressable
            style={[styles.runningLengthTouchable, theme.input, theme.runningLengthTouchable]}
            onPress={() => setThicknessModalVisible(true)}
          >
            <Text style={[styles.runningLengthValue, theme.text]}>
              {thickness || '–'} {t('units.mm')}
            </Text>
            <Ionicons name="chevron-down" size={20} color={theme.subtleColor} />
          </Pressable>
          <Modal
            visible={thicknessModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setThicknessModalVisible(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setThicknessModalVisible(false)}>
              <Pressable style={[styles.modalContent, theme.card]} onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, theme.text]}>{t('home.thickness')}</Text>
                  <TouchableOpacity onPress={() => setThicknessModalVisible(false)} hitSlop={12}>
                    <Ionicons name="close" size={24} color={theme.subtleColor} />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  style={styles.thicknessModalScroll}
                  contentContainerStyle={styles.thicknessModalScrollContent}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {THICKNESS_OPTIONS_MM.map((val) => {
                    const isSelected = Math.abs((parseFloat(thickness) || 0) - val) < 0.001;
                    return (
                      <TouchableOpacity
                        key={val}
                        style={[styles.modalOption, theme.modalOption, isSelected && theme.modalOptionSelected]}
                        onPress={() => {
                          setThickness(String(val));
                          setThicknessModalVisible(false);
                        }}
                      >
                        <Text style={[styles.modalOptionText, theme.text]}>{val} {t('units.mm')}</Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={20} color={theme.accentColor} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <View style={[styles.customRow, theme.modalOption, styles.thicknessModalCustomRow]}>
                  <Text style={[styles.customLabel, { color: theme.subtleColor }]}>{t('home.custom')}</Text>
                  <View style={styles.customInputRow}>
                    <TextInput
                      style={[styles.customInput, theme.input]}
                      value={customThicknessInput}
                      onChangeText={setCustomThicknessInput}
                      placeholder={t('home.thicknessPlaceholder')}
                      placeholderTextColor={theme.placeholder}
                      keyboardType="decimal-pad"
                    />
                    <TouchableOpacity
                      style={[styles.useCustomBtn, { backgroundColor: theme.accentColor }]}
                      onPress={() => {
                        const n = parseFloat(customThicknessInput);
                        if (!isNaN(n) && n > 0) {
                          setThickness(String(n));
                          setCustomThicknessInput('');
                          setThicknessModalVisible(false);
                        }
                      }}
                    >
                      <Text style={styles.useCustomBtnText}>{t('home.use')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
          <View style={styles.widthSelectorRow}>
            <Text style={[styles.widthLabel, { color: theme.subtleColor }]}>{t('home.coilWidth')}</Text>
            <View style={styles.widthChipsRow}>
              {SHEET_WIDTH_MM_OPTIONS.map((w) => (
                <TouchableOpacity
                  key={w}
                  style={[
                    styles.widthChip,
                    theme.sheetSizeBtn,
                    sheetWidthMm === w && styles.sheetSizeBtnSelected,
                    sheetWidthMm === w && theme.sheetSizeBtnSelected,
                  ]}
                  onPress={() => setSheetWidthMm(w)}
                >
                  <Text style={[styles.widthChipText, theme.text]}>{w} {t('units.mm')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.card, theme.card]}>
          <View style={[styles.sectionLabelRow, { borderBottomColor: theme.dividerColor }]}>
            <Ionicons name="speedometer-outline" size={18} color={theme.subtleColor} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: theme.subtleColor }]}>{t('home.runningLength').replace(/\(.*\)/, '').trim().toUpperCase()}</Text>
          </View>
          {runningLengthFromMap && (
            <Text style={[styles.runningLengthHint, { color: theme.subtleColor }]}>{t('home.runningLengthHint')}</Text>
          )}
          <Pressable
            style={[styles.runningLengthTouchable, theme.input, theme.runningLengthTouchable]}
            onPress={() => setRunningLengthModalVisible(true)}
          >
            <Text style={[styles.runningLengthValue, theme.text]}>
              {effectiveRunningLength && effectiveRunningLength > 0
                ? `${effectiveRunningLength} ${t('units.mton')}`
                : '–'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={theme.subtleColor} />
          </Pressable>
        </View>
        <Modal
          visible={runningLengthModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setRunningLengthModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setRunningLengthModalVisible(false)}>
            <Pressable style={[styles.modalContent, theme.card]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, theme.text]}>{t('home.runningLength')}</Text>
                <TouchableOpacity onPress={() => setRunningLengthModalVisible(false)} hitSlop={12}>
                  <Ionicons name="close" size={24} color={theme.subtleColor} />
                </TouchableOpacity>
              </View>
              {RUNNING_LENGTH_OPTIONS.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.modalOption, theme.modalOption, effectiveRunningLength === val && theme.modalOptionSelected]}
                  onPress={() => {
                    setRunningLength(val);
                    setCustomRunningLength('');
                    setRunningLengthFromMap(false);
                    setRunningLengthModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, theme.text]}>{val} {t('units.mton')}</Text>
                  {effectiveRunningLength === val && !isRunningLengthCustom && (
                    <Ionicons name="checkmark" size={20} color={theme.accentColor} />
                  )}
                </TouchableOpacity>
              ))}
              <View style={[styles.customRow, theme.modalOption]}>
                <Text style={[styles.customLabel, { color: theme.subtleColor }]}>{t('home.custom')}</Text>
                <View style={styles.customInputRow}>
                  <TextInput
                    style={[styles.customInput, theme.input]}
                    value={customRunningLength}
                    onChangeText={setCustomRunningLength}
                    placeholder="e.g. 1300"
                    placeholderTextColor={theme.placeholder}
                    keyboardType="decimal-pad"
                  />
                  <TouchableOpacity
                    style={[styles.useCustomBtn, { backgroundColor: theme.accentColor }]}
                    onPress={() => {
                      const n = parseFloat(customRunningLength);
                      if (!isNaN(n) && n > 0) {
                        setRunningLength(n);
                        setRunningLengthFromMap(false);
                        setRunningLengthModalVisible(false);
                      }
                    }}
                  >
                    <Text style={styles.useCustomBtnText}>{t('home.use')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <View style={[styles.card, theme.card]}>
          <View style={[styles.sectionLabelRow, { borderBottomColor: theme.dividerColor }]}>
            <Ionicons name="wallet-outline" size={18} color={theme.subtleColor} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: theme.subtleColor }]}>{t('home.costing').replace(/\(.*\)/, '').trim().toUpperCase()}</Text>
          </View>
          <View style={styles.fieldRow}>
            <TextInput
              style={[styles.input, theme.input]}
              value={costing}
              onChangeText={handleCostingChange}
              placeholder={t('home.costingPlaceholder')}
              placeholderTextColor={theme.placeholder}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={[styles.card, theme.card]}>
          <View style={[styles.sectionLabelRow, { borderBottomColor: theme.dividerColor }]}>
            <Ionicons name="copy-outline" size={18} color={theme.subtleColor} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: theme.subtleColor }]}>{t('home.sheetSizes').replace(/\(.*\)/, '').trim().toUpperCase()}</Text>
          </View>
          <View style={styles.sheetSizesRow}>
          {allSheetSizes.map((ft) => (
            <View key={ft} style={styles.sheetSizeWrap}>
              <TouchableOpacity
                style={[
                  styles.sheetSizeBtn,
                  theme.sheetSizeBtn,
                  selectedSizes.includes(ft) && styles.sheetSizeBtnSelected,
                  selectedSizes.includes(ft) && theme.sheetSizeBtnSelected,
                ]}
                onPress={() => toggleSheetSize(ft)}
              >
                <Text style={[styles.sheetSizeBtnText, theme.text]}>{ft} {t('units.ft')}</Text>
              </TouchableOpacity>
              {customSheetSizes.includes(ft) && (
                <TouchableOpacity
                  style={[styles.removeSizeBtn, theme.removeSizeBtn]}
                  onPress={() => removeCustomSheetSize(ft)}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={18} color={theme.subtleColor} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={[styles.addSizeBtn, theme.addSizeBtn]}
            onPress={() => setShowAddSheetRow((v) => !v)}
          >
            <Ionicons name="add" size={24} color={theme.accentColor} />
            <Text style={[styles.addSizeBtnText, { color: theme.accentColor }]}>{t('home.add')}</Text>
          </TouchableOpacity>
        </View>
        {showAddSheetRow && (
          <View style={[styles.addSheetRow, theme.addSheetRow]}>
            <TextInput
              style={[styles.addSheetInput, theme.input]}
              value={customSheetInput}
              onChangeText={setCustomSheetInput}
              placeholder={t('home.feetPlaceholder')}
              placeholderTextColor={theme.placeholder}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity
              style={[styles.addSheetConfirm, { backgroundColor: theme.accentColor }]}
              onPress={addCustomSheetSize}
            >
              <Text style={styles.addSheetConfirmText}>{t('home.addSize')}</Text>
            </TouchableOpacity>
          </View>
        )}
        </View>

        <TouchableOpacity
          style={[
            styles.calculateBtn,
            canCalculate ? { backgroundColor: theme.accentColor } : styles.calculateBtnDisabled,
          ]}
          onPress={handleCalculate}
          disabled={!canCalculate}
        >
          <Ionicons name="calculator-outline" size={22} color="#fff" style={styles.calcBtnIcon} />
          <Text style={styles.calculateBtnText}>{t('home.calculate')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const lightTheme = {
  container: { backgroundColor: '#f1f5f9' },
  text: { color: '#0f172a' },
  subtleColor: '#64748b',
  accentColor: '#0d9488',
  placeholder: '#94a3b8',
  dividerColor: 'rgba(0,0,0,0.06)',
  header: { borderBottomColor: 'rgba(0,0,0,0.06)', backgroundColor: '#fff' },
  input: { backgroundColor: '#fff', color: '#0f172a', borderColor: '#e2e8f0' },
  runningLengthTouchable: {},
  sheetSizeBtn: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  sheetSizeBtnSelected: { backgroundColor: '#ccfbf1', borderColor: '#0d9488' },
  addSizeBtn: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', borderStyle: 'dashed' },
  removeSizeBtn: {},
  addSheetRow: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
  card: { backgroundColor: '#fff', borderColor: 'rgba(0,0,0,0.06)' },
  modalOption: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
  modalOptionSelected: { backgroundColor: '#ecfdf5' },
};

const darkTheme = {
  container: { backgroundColor: '#0f172a' },
  text: { color: '#f8fafc' },
  subtleColor: '#94a3b8',
  accentColor: '#2dd4bf',
  placeholder: '#64748b',
  dividerColor: 'rgba(255,255,255,0.08)',
  header: { borderBottomColor: 'rgba(255,255,255,0.08)', backgroundColor: '#1e293b' },
  input: { backgroundColor: '#1e293b', color: '#f8fafc', borderColor: '#334155' },
  runningLengthTouchable: {},
  sheetSizeBtn: { backgroundColor: '#1e293b', borderColor: '#334155' },
  sheetSizeBtnSelected: { backgroundColor: 'rgba(45,212,191,0.15)', borderColor: '#2dd4bf' },
  addSizeBtn: { backgroundColor: '#1e293b', borderColor: '#475569', borderStyle: 'dashed' },
  removeSizeBtn: {},
  addSheetRow: { backgroundColor: '#0f172a', borderColor: '#334155' },
  card: { backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.06)' },
  modalOption: { backgroundColor: '#0f172a', borderColor: '#334155' },
  modalOptionSelected: { backgroundColor: 'rgba(45,212,191,0.12)' },
};

const CARD_PADDING = 20;
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginRight: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: CARD_PADDING,
    marginBottom: 18,
    overflow: 'hidden',
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  sectionIcon: { marginRight: 8, opacity: 0.9 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  fieldRow: { marginTop: 0 },
  widthSelectorRow: { marginTop: 16 },
  widthLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  widthChipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  widthChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 8,
  },
  widthChipText: { fontSize: 14, fontWeight: '600' },
  runningLengthHint: { fontSize: 12, marginBottom: 8 },
  input: {
    fontSize: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  runningLengthTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  runningLengthValue: { fontSize: 16, fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '80%',
  },
  thicknessModalScroll: { maxHeight: 280 },
  thicknessModalScrollContent: { paddingBottom: 8 },
  thicknessModalCustomRow: { marginTop: 8, marginBottom: 0 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  modalOptionText: { fontSize: 16, fontWeight: '500' },
  customRow: { 
    marginTop: 4, 
    paddingVertical: 16, 
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  customLabel: { fontSize: 14, marginBottom: 12, fontWeight: '500' },
  customInputRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  customInput: { 
    flex: 1, 
    fontSize: 16, 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  useCustomBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12 },
  useCustomBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  sheetSizesRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  sheetSizeWrap: { position: 'relative', marginRight: 10, marginBottom: 10 },
  sheetSizeBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 72,
    alignItems: 'center',
  },
  sheetSizeBtnSelected: { borderWidth: 2 },
  sheetSizeBtnText: { fontSize: 15, fontWeight: '600' },
  removeSizeBtn: { position: 'absolute', top: -6, right: -6 },
  addSizeBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    minWidth: 72,
    alignItems: 'center',
  },
  addSizeBtnText: { fontSize: 15, fontWeight: '600' },
  addSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  addSheetInput: { flex: 1, fontSize: 16, paddingVertical: 10, paddingHorizontal: 12 },
  addSheetConfirm: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  addSheetConfirmText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  calculateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 100,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  calculateBtnDisabled: { backgroundColor: '#94a3b8', shadowOpacity: 0 },
  calcBtnIcon: { marginRight: 8 },
  calculateBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
