import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, ScrollView, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SHEET_LENGTHS_FT } from '../utils/calculations';

const VERSION = '1.00';
const PRESET_SHEET_SIZES = SHEET_LENGTHS_FT; // built-in options

export default function SettingsScreen({
  isDark,
  onDarkChange,
  onDeleteHistory,
  defaultSheetSizes = [8, 10],
  onDefaultSheetSizesChange,
  currentLanguage = 'en',
  onLanguageChange,
}) {
  const { t } = useTranslation();
  const [sheetSizeModalVisible, setSheetSizeModalVisible] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState(() =>
    Array.isArray(defaultSheetSizes) && defaultSheetSizes.length > 0
      ? defaultSheetSizes.slice().sort((a, b) => a - b)
      : [8, 10]
  );
  const [customSheetInput, setCustomSheetInput] = useState('');
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [clearHistoryModalVisible, setClearHistoryModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  const openSheetSizeModal = () => {
    setSelectedSizes(
      Array.isArray(defaultSheetSizes) && defaultSheetSizes.length > 0
        ? defaultSheetSizes.slice().sort((a, b) => a - b)
        : [8, 10]
    );
    setCustomSheetInput('');
    setSheetSizeModalVisible(true);
  };

  const toggleSize = (ft) => {
    setSelectedSizes((prev) =>
      prev.includes(ft) ? prev.filter((s) => s !== ft) : [...prev, ft].sort((a, b) => a - b)
    );
  };

  const addCustomSize = () => {
    const n = parseFloat(customSheetInput);
    if (isNaN(n) || n <= 0) return;
    const val = Math.round(n * 10) / 10;
    setSelectedSizes((prev) => (prev.includes(val) ? prev : [...prev, val].sort((a, b) => a - b)));
    setCustomSheetInput('');
  };

  const removeCustomSize = (ft) => {
    setSelectedSizes((prev) => prev.filter((s) => s !== ft));
  };

  const saveDefaultSheetSizes = () => {
    if (selectedSizes.length === 0) return;
    onDefaultSheetSizesChange?.(selectedSizes);
    setSheetSizeModalVisible(false);
  };

  // sizes user added (not in preset list)
  const customSizes = selectedSizes.filter((s) => !PRESET_SHEET_SIZES.includes(s));

  const theme = isDark ? darkTheme : lightTheme;
  const accentColor = theme.accentColor;

  return (
    <View style={[styles.container, theme.container]}>
      <View style={styles.titleRow}>
        <Ionicons name="settings-outline" size={28} color={accentColor} style={styles.titleIcon} />
        <Text style={[styles.screenTitle, theme.text]}>{t('settings.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="moon-outline" size={16} color={theme.subtleColor} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: theme.subtleColor }]}>{t('settings.theme')}</Text>
          </View>
          <View style={[styles.card, theme.card]}>
            <View style={[styles.row, theme.row]}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconWrap, theme.rowIconWrap]}>
                  <Ionicons name="contrast-outline" size={20} color={accentColor} />
                </View>
                <Text style={[styles.rowLabel, theme.text]}>{t('settings.darkMode')}</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={onDarkChange}
                trackColor={{ false: theme.switchTrackOff, true: accentColor }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options-outline" size={16} color={theme.subtleColor} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: theme.subtleColor }]}>{t('settings.options')}</Text>
          </View>
          <View style={[styles.card, theme.card]}>
            <TouchableOpacity
              style={[styles.row, theme.row]}
              onPress={openSheetSizeModal}
              activeOpacity={0.7}
              disabled={!onDefaultSheetSizesChange}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconWrap, theme.rowIconWrap]}>
                  <Ionicons name="layers-outline" size={20} color={accentColor} />
                </View>
                <Text style={[styles.rowLabel, theme.text]}>{t('settings.defaultSheetSize')}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: theme.subtleColor }]} numberOfLines={1}>
                  {Array.isArray(defaultSheetSizes) && defaultSheetSizes.length > 0
                    ? defaultSheetSizes.join(', ') + ' ft'
                    : '8, 10 ft'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.subtleColor} style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>

            <Modal
              visible={sheetSizeModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setSheetSizeModalVisible(false)}
            >
              <Pressable style={styles.modalOverlay} onPress={() => setSheetSizeModalVisible(false)}>
                <Pressable style={[styles.sheetSizeModalContent, theme.card]} onPress={(e) => e.stopPropagation()}>
                  <View style={styles.sheetSizeModalHeader}>
                    <Text style={[styles.sheetSizeModalTitle, theme.text]}>{t('settings.defaultSheetSize')}</Text>
                    <TouchableOpacity onPress={() => setSheetSizeModalVisible(false)} hitSlop={12}>
                      <Ionicons name="close" size={24} color={theme.subtleColor} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.sheetSizeModalHint, { color: theme.subtleColor }]}>
                    {t('settings.defaultSheetSizeHint')}
                  </Text>
                  {PRESET_SHEET_SIZES.map((ft) => (
                    <TouchableOpacity
                      key={ft}
                      style={[
                        styles.sheetSizeModalOption,
                        theme.sheetSizeOption,
                        selectedSizes.includes(ft) && styles.sheetSizeModalOptionSelected,
                        selectedSizes.includes(ft) && { borderColor: accentColor, backgroundColor: isDark ? 'rgba(45,212,191,0.12)' : '#ecfdf5' },
                      ]}
                      onPress={() => toggleSize(ft)}
                    >
                      <Text style={[styles.sheetSizeModalOptionText, theme.text]}>{ft} ft</Text>
                      {selectedSizes.includes(ft) && (
                        <Ionicons name="checkmark-circle" size={24} color={accentColor} />
                      )}
                    </TouchableOpacity>
                  ))}
                  {customSizes.map((ft) => (
                    <View key={ft} style={[styles.sheetSizeModalOption, theme.sheetSizeOption, { borderColor: accentColor, backgroundColor: isDark ? 'rgba(45,212,191,0.08)' : '#f0fdfa' }]}>
                      <Text style={[styles.sheetSizeModalOptionText, theme.text]}>{ft} ft</Text>
                      <TouchableOpacity onPress={() => removeCustomSize(ft)} hitSlop={8}>
                        <Ionicons name="close-circle" size={24} color={theme.subtleColor} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <Text style={[styles.sheetSizeModalAddLabel, { color: theme.subtleColor }]}>
                    {t('settings.addCustomSize')}
                  </Text>
                  <View style={styles.sheetSizeModalAddRow}>
                    <TextInput
                      style={[styles.sheetSizeModalAddInput, theme.input]}
                      value={customSheetInput}
                      onChangeText={setCustomSheetInput}
                      placeholder={t('home.feetPlaceholder')}
                      placeholderTextColor={theme.placeholder}
                      keyboardType="decimal-pad"
                    />
                    <TouchableOpacity
                      style={[styles.sheetSizeModalAddBtn, { backgroundColor: accentColor }]}
                      onPress={addCustomSize}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[styles.sheetSizeModalDone, { backgroundColor: accentColor }]}
                    onPress={saveDefaultSheetSizes}
                    disabled={selectedSizes.length === 0}
                  >
                    <Text style={styles.sheetSizeModalDoneText}>{t('common.done')}</Text>
                  </TouchableOpacity>
                </Pressable>
              </Pressable>
            </Modal>

            <TouchableOpacity
              style={[styles.row, theme.row, styles.rowBorder, theme.rowBorder]}
              onPress={() => setLanguageModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconWrap, theme.rowIconWrap]}>
                  <Ionicons name="language-outline" size={20} color={accentColor} />
                </View>
                <Text style={[styles.rowLabel, theme.text]}>{t('settings.language')}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: theme.subtleColor }]}>
                  {currentLanguage === 'ur' ? 'اردو' : 'English'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.subtleColor} style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>

            <Modal
              visible={languageModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setLanguageModalVisible(false)}
            >
              <Pressable style={styles.modalOverlay} onPress={() => setLanguageModalVisible(false)}>
                <Pressable style={[styles.languageModalContent, theme.card]} onPress={(e) => e.stopPropagation()}>
                  <View style={styles.languageModalHeader}>
                    <Text style={[styles.languageModalTitle, theme.text]}>{t('settings.language')}</Text>
                    <TouchableOpacity onPress={() => setLanguageModalVisible(false)} hitSlop={12}>
                      <Ionicons name="close" size={24} color={theme.subtleColor} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.languageModalOption,
                      theme.sheetSizeOption,
                      currentLanguage === 'en' && styles.languageModalOptionSelected,
                      currentLanguage === 'en' && { borderColor: accentColor, backgroundColor: isDark ? 'rgba(45,212,191,0.12)' : '#ecfdf5' },
                    ]}
                    onPress={() => {
                      onLanguageChange?.('en');
                      setLanguageModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.languageModalOptionText, theme.text]}>English</Text>
                    {currentLanguage === 'en' && (
                      <Ionicons name="checkmark-circle" size={24} color={accentColor} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.languageModalOption,
                      theme.sheetSizeOption,
                      currentLanguage === 'ur' && styles.languageModalOptionSelected,
                      currentLanguage === 'ur' && { borderColor: accentColor, backgroundColor: isDark ? 'rgba(45,212,191,0.12)' : '#ecfdf5' },
                    ]}
                    onPress={() => {
                      onLanguageChange?.('ur');
                      setLanguageModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.languageModalOptionText, theme.text]}>اردو</Text>
                    {currentLanguage === 'ur' && (
                      <Ionicons name="checkmark-circle" size={24} color={accentColor} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.languageModalOk, { backgroundColor: accentColor }]}
                    onPress={() => setLanguageModalVisible(false)}
                  >
                    <Text style={styles.languageModalOkText}>{t('common.ok')}</Text>
                  </TouchableOpacity>
                </Pressable>
              </Pressable>
            </Modal>
            <TouchableOpacity
              style={[styles.row, theme.row, styles.rowBorder, theme.rowBorder]}
              onPress={() => setClearHistoryModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconWrap, theme.rowIconWrapDanger]}>
                  <Ionicons name="trash-outline" size={20} color={theme.dangerColor} />
                </View>
                <Text style={[styles.rowLabel, theme.text]}>{t('settings.clearHistory')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.subtleColor} />
            </TouchableOpacity>

            <Modal
              visible={clearHistoryModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setClearHistoryModalVisible(false)}
            >
              <Pressable style={styles.modalOverlay} onPress={() => setClearHistoryModalVisible(false)}>
                <Pressable style={[styles.confirmModalContent, theme.card]} onPress={(e) => e.stopPropagation()}>
                  <View style={styles.confirmModalHeader}>
                    <View style={styles.confirmModalIconWrap}>
                      <Ionicons name="warning-outline" size={28} color={theme.dangerColor} />
                    </View>
                    <Text style={[styles.confirmModalTitle, theme.text]}>{t('settings.clearHistoryTitle')}</Text>
                    <Text style={[styles.confirmModalMessage, { color: theme.subtleColor }]}>
                      {t('settings.clearHistoryMessage')}
                    </Text>
                  </View>
                  <View style={styles.confirmModalActions}>
                    <TouchableOpacity
                      style={[styles.confirmModalBtn, styles.confirmModalBtnCancel, theme.sheetSizeOption]}
                      onPress={() => setClearHistoryModalVisible(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.confirmModalBtnCancelText, theme.text]}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.confirmModalBtn, styles.confirmModalBtnConfirm, { backgroundColor: theme.dangerColor }]}
                      onPress={() => {
                        onDeleteHistory?.();
                        setClearHistoryModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.confirmModalBtnConfirmText}>{t('settings.clearHistoryConfirm')}</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={16} color={theme.subtleColor} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: theme.subtleColor }]}>{t('settings.review').toUpperCase()}</Text>
          </View>
          <View style={[styles.card, theme.card]}>
            <View style={[styles.row, theme.row]}>
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconWrap, theme.rowIconWrap]}>
                  <Ionicons name="heart-outline" size={20} color={accentColor} />
                </View>
                <View>
                  <Text style={[styles.rowLabel, theme.text]}>{t('settings.leaveReview')}</Text>
                  <Text style={[styles.rowHint, { color: theme.subtleColor }]}>Coming soon</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={16} color={theme.subtleColor} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: theme.subtleColor }]}>{t('settings.info').toUpperCase()}</Text>
          </View>
          <View style={[styles.card, theme.card]}>
            <TouchableOpacity
              style={[styles.row, theme.row]}
              onPress={() => setAboutModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconWrap, theme.rowIconWrap]}>
                  <Ionicons name="document-text-outline" size={20} color={accentColor} />
                </View>
                <Text style={[styles.rowLabel, theme.text]}>{t('settings.about')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.subtleColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.row, theme.row, styles.rowBorder, theme.rowBorder]}
              onPress={() => setTermsModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.rowIconWrap, theme.rowIconWrap]}>
                  <Ionicons name="reader-outline" size={20} color={accentColor} />
                </View>
                <Text style={[styles.rowLabel, theme.text]}>{t('settings.terms')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.subtleColor} />
            </TouchableOpacity>
          </View>

          <Modal
            visible={aboutModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setAboutModalVisible(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setAboutModalVisible(false)}>
              <Pressable style={[styles.infoModalContent, theme.card]} onPress={(e) => e.stopPropagation()}>
                <View style={styles.infoModalHeader}>
                  <Text style={[styles.infoModalTitle, theme.text]}>{t('settings.about')}</Text>
                  <TouchableOpacity onPress={() => setAboutModalVisible(false)} hitSlop={12}>
                    <Ionicons name="close" size={24} color={theme.subtleColor} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.infoModalBody, { color: theme.subtleColor }]}>
                  {t('settings.aboutText')}
                </Text>
                <TouchableOpacity
                  style={[styles.infoModalOk, { backgroundColor: accentColor }]}
                  onPress={() => setAboutModalVisible(false)}
                >
                  <Text style={styles.infoModalOkText}>{t('common.ok')}</Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </Modal>

          <Modal
            visible={termsModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setTermsModalVisible(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setTermsModalVisible(false)}>
              <Pressable style={[styles.infoModalContent, theme.card]} onPress={(e) => e.stopPropagation()}>
                <View style={styles.infoModalHeader}>
                  <Text style={[styles.infoModalTitle, theme.text]}>{t('settings.terms')}</Text>
                  <TouchableOpacity onPress={() => setTermsModalVisible(false)} hitSlop={12}>
                    <Ionicons name="close" size={24} color={theme.subtleColor} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.infoModalBody, { color: theme.subtleColor }]}>
                  {t('settings.termsText')}
                </Text>
                <TouchableOpacity
                  style={[styles.infoModalOk, { backgroundColor: accentColor }]}
                  onPress={() => setTermsModalVisible(false)}
                >
                  <Text style={styles.infoModalOkText}>{t('common.ok')}</Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </Modal>
        </View>

        <View style={[styles.footer, { borderTopColor: theme.borderColor }]}>
          <Ionicons name="calculator-outline" size={18} color={theme.subtleColor} style={{ marginRight: 6 }} />
          <Text style={[styles.version, { color: theme.subtleColor }]}>Version {VERSION}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const lightTheme = {
  container: { backgroundColor: '#f8fafc' },
  text: { color: '#0f172a' },
  subtleColor: '#64748b',
  accentColor: '#0d9488',
  dangerColor: '#dc2626',
  borderColor: '#e2e8f0',
  switchTrackOff: '#cbd5e1',
  placeholder: '#94a3b8',
  input: { backgroundColor: '#fff', color: '#0f172a', borderColor: '#e2e8f0' },
  card: { backgroundColor: '#fff', borderColor: '#e2e8f0' },
  row: { backgroundColor: '#fff' },
  rowIconWrap: { backgroundColor: 'transparent' },
  rowIconWrapDanger: { backgroundColor: 'transparent' },
  rowBorder: { borderTopColor: '#e2e8f0' },
  sheetSizeOption: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
};

const darkTheme = {
  container: { backgroundColor: '#0f172a' },
  text: { color: '#f8fafc' },
  subtleColor: '#94a3b8',
  accentColor: '#2dd4bf',
  dangerColor: '#f87171',
  borderColor: '#334155',
  switchTrackOff: '#475569',
  placeholder: '#64748b',
  input: { backgroundColor: '#1e293b', color: '#f8fafc', borderColor: '#334155' },
  card: { backgroundColor: '#1e293b', borderColor: '#334155' },
  row: { backgroundColor: '#1e293b' },
  rowIconWrap: { backgroundColor: 'transparent' },
  rowIconWrapDanger: { backgroundColor: 'transparent' },
  rowBorder: { borderTopColor: '#334155' },
  sheetSizeOption: { backgroundColor: '#0f172a', borderColor: '#334155' },
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 100 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  titleIcon: { marginRight: 12 },
  screenTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  scrollContent: { paddingBottom: 24 },
  section: { marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 20 },
  sectionIcon: { marginRight: 6 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: { borderTopWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowIconWrapDanger: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  rowValue: { fontSize: 15 },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowHint: { fontSize: 13, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  sheetSizeModalContent: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  sheetSizeModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sheetSizeModalTitle: { fontSize: 18, fontWeight: '700' },
  sheetSizeModalHint: { fontSize: 13, marginBottom: 16 },
  sheetSizeModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  sheetSizeModalOptionSelected: {},
  sheetSizeModalOptionText: { fontSize: 16, fontWeight: '500' },
  sheetSizeModalAddLabel: { fontSize: 13, marginBottom: 6, fontWeight: '500' },
  sheetSizeModalAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 10,
  },
  sheetSizeModalAddInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: 10,
  },
  sheetSizeModalAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSizeModalDone: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sheetSizeModalDoneText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  languageModalContent: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  languageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  languageModalTitle: { fontSize: 18, fontWeight: '700' },
  languageModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  languageModalOptionSelected: {},
  languageModalOptionDisabled: {},
  languageModalOptionText: { fontSize: 16, fontWeight: '500' },
  languageModalComingSoon: { fontSize: 13, fontWeight: '500' },
  languageModalOk: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  languageModalOkText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  infoModalContent: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  infoModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoModalTitle: { fontSize: 18, fontWeight: '700' },
  infoModalBody: { fontSize: 15, lineHeight: 22, marginBottom: 20 },
  infoModalOk: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoModalOkText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  confirmModalContent: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  confirmModalHeader: { alignItems: 'center', marginBottom: 20 },
  confirmModalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmModalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  confirmModalMessage: { fontSize: 15, lineHeight: 22, textAlign: 'center', paddingHorizontal: 8 },
  confirmModalActions: { flexDirection: 'row' },
  confirmModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmModalBtnCancel: { borderWidth: 1.5, marginRight: 6 },
  confirmModalBtnConfirm: { marginLeft: 6 },
  confirmModalBtnCancelText: { fontSize: 16, fontWeight: '600' },
  confirmModalBtnConfirm: {},
  confirmModalBtnConfirmText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  version: { fontSize: 13 },
});
