import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export default function ResultsScreen({ calculation, inputSnapshot, onGoBack, onSave, isDark }) {
  const { t } = useTranslation();
  const theme = isDark ? darkTheme : lightTheme;
  const accentColor = theme.accentColor;
  const resultsRef = useRef(null); // for view-shot when sharing as image

  const formatRs = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // build text for copy / share
  const formatResultsForText = () => {
    if (!calculation) return '';
    const { inputSummary, lengthFeet, lengthInches, resultsPerSize } = calculation;
    
    let text = `📊 ${t('results.shareTextHeader')}\n\n`;
    text += `📋 ${t('results.shareTextInputSummary')}\n`;
    text += `${t('results.shareTextThickness')}: ${inputSummary.thicknessMm} ${t('units.mm')}\n`;
    text += `${t('results.shareTextRunningLength')}: ${inputSummary.metersPerTon} ${t('units.mton')}\n`;
    text += `${t('results.shareTextMaterialCost')}: ${formatRs(inputSummary.costingMaterialRs)} ${t('units.rs')}\n\n`;
    text += `📏 ${t('results.length')}\n`;
    text += `${t('results.inches')}: ${lengthInches.toLocaleString()} ${t('units.in')}\n`;
    text += `${t('results.feet')}: ${lengthFeet.toLocaleString()} ${t('units.ft')}\n\n`;
    text += `📐 ${t('results.shareTextResultsBySheetSize')}\n\n`;
    
    resultsPerSize.forEach((r) => {
      text += `━━━ ${r.sheetLengthFt} ${t('units.ftSheets')} ━━━\n`;
      text += `${t('results.sheets')}: ${r.numberOfSheets}\n`;
      text += `${t('results.shareTextWeightPerSheet')}: ${r.weightPerSheetKg} ${t('units.kg')}\n`;
      text += `${t('results.rsPerSheet')}: ${formatRs(r.costPerSheetRs)}\n\n`;
    });
    
    return text;
  };

  const handleCopy = async () => {
    try {
      const text = formatResultsForText();
      await Clipboard.setStringAsync(text); // paste-ready string
      Alert.alert(t('common.copied'), t('common.resultsCopied'));
    } catch (error) {
      Alert.alert(t('common.error'), t('common.failedToCopy'));
    }
  };

  const handleShare = async () => {
    try {
      const text = formatResultsForText();
      const result = await Share.share({
        message: text,
        title: t('results.shareTitle'),
      });
    } catch (error) {
      if (error.message !== 'User did not share') {
        Alert.alert(t('common.error'), t('common.failedToShare'));
      }
    }
  };

  const handleShareAsImage = async () => {
    try {
      if (!resultsRef.current) {
        Alert.alert(t('common.error'), t('common.unableToCapture'));
        return;
      }

      const uri = await captureRef(resultsRef.current, {
        format: 'png',
        quality: 0.9,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: t('results.shareDialogTitle'),
        });
      } else {
        Alert.alert(t('common.error'), t('common.sharingNotAvailable'));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share as image');
    }
  };

  if (!calculation) {
    return (
      <View style={[styles.container, theme.container]}>
        <View style={[styles.header, theme.header]}>
          <TouchableOpacity
            style={styles.backControl}
            onPress={onGoBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={26} color={accentColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyCard, theme.card]}>
            <Ionicons name="calculator-outline" size={48} color={theme.subtleColor} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, theme.text]}>No results yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.subtleColor }]}>
              Enter values on the home screen and tap Calculate to see results here.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBackBtn, { backgroundColor: accentColor }]}
              onPress={onGoBack}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.emptyBackBtnText}>Go to calculation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const { inputSummary = {}, lengthFeet = 0, lengthInches = 0, resultsPerSize = [] } = calculation || {};
  const sheetWidthMm = inputSnapshot?.sheetWidthMm;

  return (
    <View style={[styles.container, theme.container]}>
      <View style={[styles.header, theme.header]}>
        <TouchableOpacity
          style={styles.backControl}
          onPress={onGoBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color={accentColor} />
        </TouchableOpacity>
        <View style={styles.headerCenter} pointerEvents="none">
          <Ionicons name="analytics-outline" size={26} color={accentColor} style={styles.headerIcon} />
          <Text style={[styles.headerTitle, theme.text]}>{t('results.title')}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View ref={resultsRef} collapsable={false}>
        <View style={[styles.card, theme.card]}>
          <View style={[styles.sectionLabelRow, { borderBottomColor: theme.dividerColor }]}>
            <Ionicons name="list-outline" size={16} color={theme.subtleColor} style={{ marginRight: 8, opacity: 0.9 }} />
            <Text style={[styles.sectionTitle, { color: theme.subtleColor }]}>{t('results.inputSummary')}</Text>
          </View>
          <View style={[styles.summaryRow, theme.summaryRow, styles.summaryRowFirst]}>
            <View style={styles.summaryLabelRow}>
              <Ionicons name="resize-outline" size={18} color={theme.subtleColor} style={[styles.summaryIcon, { opacity: 0.9 }]} />
              <Text style={[styles.summaryLabel, { color: theme.subtleColor }]}>{t('results.thickness')}</Text>
            </View>
            <Text style={[styles.summaryValue, theme.text]}>{inputSummary.thicknessMm} {t('units.mm')}</Text>
          </View>
          <View style={[styles.summaryRow, theme.summaryRow]}>
            <View style={styles.summaryLabelRow}>
              <Ionicons name="speedometer-outline" size={18} color={theme.subtleColor} style={[styles.summaryIcon, { opacity: 0.9 }]} />
              <Text style={[styles.summaryLabel, { color: theme.subtleColor }]}>{t('results.runningLength')}</Text>
            </View>
            <Text style={[styles.summaryValue, theme.text]}>{inputSummary.metersPerTon} {t('units.mton')}</Text>
          </View>
          <View style={[styles.summaryRow, theme.summaryRow]}>
            <View style={styles.summaryLabelRow}>
              <Ionicons name="wallet-outline" size={18} color={theme.subtleColor} style={[styles.summaryIcon, { opacity: 0.9 }]} />
              <Text style={[styles.summaryLabel, { color: theme.subtleColor }]}>{t('results.materialCost')}</Text>
            </View>
            <Text style={[styles.summaryValue, theme.text]}>{formatRs(inputSummary.costingMaterialRs)} {t('units.rs')}</Text>
          </View>
          {sheetWidthMm != null && (
            <View style={[styles.summaryRow, theme.summaryRow]}>
              <View style={styles.summaryLabelRow}>
                <Ionicons name="resize-outline" size={18} color={theme.subtleColor} style={[styles.summaryIcon, { opacity: 0.9 }]} />
                <Text style={[styles.summaryLabel, { color: theme.subtleColor }]}>{t('results.coilWidth')}</Text>
              </View>
              <Text style={[styles.summaryValue, theme.text]}>{sheetWidthMm} {t('units.mm')}</Text>
            </View>
          )}
        </View>

        <View style={[styles.dividerWrap, theme.dividerWrap]}>
          <View style={[styles.dividerLine, { backgroundColor: theme.dividerColor }]} />
        </View>

        <View style={[styles.card, theme.card]}>
          <View style={[styles.sectionLabelRow, { borderBottomColor: theme.dividerColor }]}>
            <Ionicons name="ruler-outline" size={16} color={theme.subtleColor} style={{ marginRight: 8, opacity: 0.9 }} />
            <Text style={[styles.sectionTitle, { color: theme.subtleColor }]}>{t('results.length')}</Text>
          </View>
          <View style={[styles.lengthFullRow, theme.summaryRow, styles.summaryRowFirst, { borderBottomColor: theme.dividerColor }]}>
            <View style={styles.lengthFullLeft}>
              <Ionicons name="resize-outline" size={18} color={theme.subtleColor} style={[styles.summaryIcon, { opacity: 0.9 }]} />
              <Text style={[styles.lengthFullLabel, { color: theme.subtleColor }]}>{t('results.inches')}</Text>
            </View>
            <Text style={[styles.lengthFullValue, theme.text]}>{lengthInches.toLocaleString()} in</Text>
          </View>
          <View style={[styles.lengthFullRow, theme.summaryRow]}>
            <View style={styles.lengthFullLeft}>
              <Ionicons name="resize-outline" size={18} color={theme.subtleColor} style={[styles.summaryIcon, { opacity: 0.9 }]} />
              <Text style={[styles.lengthFullLabel, { color: theme.subtleColor }]}>{t('results.feet')}</Text>
            </View>
            <Text style={[styles.lengthFullValue, theme.text]}>{lengthFeet.toLocaleString()} ft</Text>
          </View>
        </View>

        <View style={[styles.dividerWrap, theme.dividerWrap]}>
          <View style={[styles.dividerLine, { backgroundColor: theme.dividerColor }]} />
        </View>

        <View style={[styles.sectionLabelRow, { borderBottomColor: 'transparent' }, styles.sectionLabelStandalone]}>
          <Ionicons name="layers-outline" size={16} color={theme.subtleColor} style={{ marginRight: 8, opacity: 0.9 }} />
          <Text style={[styles.sectionTitle, { color: theme.subtleColor }]}>{t('results.resultsBySheetSize')}</Text>
        </View>

        {(resultsPerSize || []).map((r) => (
          <View key={r.sheetLengthFt} style={[styles.card, theme.card]}>
            <View style={[styles.sheetHeaderRow, { borderBottomColor: theme.dividerColor, backgroundColor: theme.sheetHeaderBg }]}>
              <Ionicons name="copy-outline" size={24} color={accentColor} style={styles.sheetHeaderIcon} />
              <Text style={[styles.sheetHeaderTitle, { color: accentColor }]}>{r.sheetLengthFt} {t('units.ftSheets')}</Text>
            </View>
            <View style={styles.metricsVerticalContainer}>
              <View style={[styles.metricRow, theme.summaryRow, styles.summaryRowFirst]}>
                <View style={styles.metricRowLeft}>
                  <Ionicons name="layers-outline" size={18} color={theme.subtleColor} style={[styles.summaryIcon, { opacity: 0.9 }]} />
                  <Text style={[styles.metricRowLabel, { color: theme.subtleColor }]}>{t('results.sheets')}</Text>
                </View>
                <Text style={[styles.metricRowValue, theme.text]}>{r.numberOfSheets}</Text>
              </View>
              <View style={[styles.metricRow, theme.summaryRow]}>
                <View style={styles.metricRowLeft}>
                  <Ionicons name="scale-outline" size={18} color={theme.subtleColor} style={[styles.summaryIcon, { opacity: 0.9 }]} />
                  <Text style={[styles.metricRowLabel, { color: theme.subtleColor }]}>{t('results.weightPerSheet')}</Text>
                </View>
                <Text style={[styles.metricRowValue, theme.text]}>{r.weightPerSheetKg} {t('units.kg')}</Text>
              </View>
              <View style={[styles.metricRow, theme.summaryRow]}>
                <View style={styles.metricRowLeft}>
                  <Ionicons name="cash-outline" size={18} color={theme.subtleColor} style={[styles.summaryIcon, { opacity: 0.9 }]} />
                  <Text style={[styles.metricRowLabel, { color: theme.subtleColor }]}>{t('results.rsPerSheet')}</Text>
                </View>
                <Text style={[styles.metricRowValue, theme.text]}>{formatRs(r.costPerSheetRs)} {t('units.rs')}</Text>
              </View>
            </View>
          </View>
        ))}

        {onSave && (
          <TouchableOpacity
            style={[styles.saveBtnFull, { backgroundColor: accentColor }]}
            onPress={onSave}
            activeOpacity={0.85}
          >
            <Ionicons name="bookmark-outline" size={22} color="#fff" style={styles.saveBtnIcon} />
            <Text style={styles.saveBtnText}>{t('results.saveToHistory')}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.shareButtonsRow}>
          <TouchableOpacity
            style={[styles.shareBtnItem, { borderColor: accentColor }]}
            onPress={handleCopy}
            activeOpacity={0.85}
          >
            <Ionicons name="copy-outline" size={20} color={accentColor} />
            <Text style={[styles.shareBtnText, { color: accentColor }]}>{t('common.copy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shareBtnItem, { borderColor: accentColor }]}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Ionicons name="share-outline" size={20} color={accentColor} />
            <Text style={[styles.shareBtnText, { color: accentColor }]}>{t('common.share')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shareBtnItem, { borderColor: accentColor }]}
            onPress={handleShareAsImage}
            activeOpacity={0.85}
          >
            <Ionicons name="image-outline" size={20} color={accentColor} />
            <Text style={[styles.shareBtnText, { color: accentColor }]}>{t('common.image')}</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const lightTheme = {
  container: { backgroundColor: '#f1f5f9' },
  text: { color: '#0f172a' },
  subtleColor: '#64748b',
  accentColor: '#0d9488',
  borderColor: '#e2e8f0',
  dividerColor: 'rgba(0,0,0,0.06)',
  header: { borderBottomColor: 'rgba(0,0,0,0.06)', backgroundColor: '#fff' },
  backBtnBg: 'rgba(13,148,136,0.08)',
  card: { backgroundColor: '#fff', borderColor: 'rgba(0,0,0,0.06)' },
  summaryRow: { borderTopColor: 'rgba(0,0,0,0.06)' },
  lengthRow: { backgroundColor: '#fff' },
  resultHeaderBg: 'rgba(13,148,136,0.04)',
  sheetHeaderBg: 'rgba(13,148,136,0.06)',
  metricBlock: { backgroundColor: 'rgba(248,250,252,0.9)', borderColor: 'rgba(0,0,0,0.06)' },
  dividerWrap: { backgroundColor: 'transparent' },
};

const darkTheme = {
  container: { backgroundColor: '#0f172a' },
  text: { color: '#f1f5f9' },
  subtleColor: '#94a3b8',
  accentColor: '#2dd4bf',
  borderColor: 'rgba(255,255,255,0.08)',
  dividerColor: 'rgba(255,255,255,0.08)',
  header: { borderBottomColor: 'rgba(255,255,255,0.08)', backgroundColor: '#1e293b' },
  backBtnBg: 'rgba(45,212,191,0.12)',
  card: { backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.06)' },
  summaryRow: { borderTopColor: 'rgba(255,255,255,0.06)' },
  lengthRow: { backgroundColor: '#1e293b' },
  resultHeaderBg: 'rgba(45,212,191,0.08)',
  sheetHeaderBg: 'rgba(45,212,191,0.1)',
  metricBlock: { backgroundColor: 'rgba(15,23,42,0.6)', borderColor: 'rgba(255,255,255,0.06)' },
  dividerWrap: { backgroundColor: 'transparent' },
};

const CARD_PADDING = 20;

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  backControl: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 8,
    height: 26,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    height: 26,
    top: 56,
    paddingTop: 0,
  },
  headerIcon: { marginRight: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, lineHeight: 26 },
  headerSpacer: { width: 96 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  emptyWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 36,
    alignItems: 'center',
  },
  emptyIcon: { marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  emptySubtext: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 28 },
  emptyBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  emptyBackBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  sectionLabelStandalone: { marginBottom: 18, marginTop: 4, borderBottomWidth: 0 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: CARD_PADDING,
    marginBottom: 18,
    marginHorizontal: 0,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 4,
    borderTopWidth: 1,
  },
  summaryRowFirst: { borderTopWidth: 0 },
  summaryLabelRow: { flexDirection: 'row', alignItems: 'center' },
  summaryIcon: { marginRight: 10 },
  summaryLabel: { fontSize: 15 },
  summaryValue: { fontSize: 16, fontWeight: '700' },
  dividerWrap: { paddingVertical: 14, marginBottom: 2 },
  dividerLine: { height: 1, width: '100%', opacity: 0.8 },
  lengthFullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 4,
    borderTopWidth: 1,
  },
  lengthFullLeft: { flexDirection: 'row', alignItems: 'center' },
  lengthFullLabel: { fontSize: 15 },
  lengthFullValue: { fontSize: 16, fontWeight: '700' },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -CARD_PADDING,
    marginTop: -CARD_PADDING,
    marginBottom: CARD_PADDING,
    paddingVertical: 16,
    paddingHorizontal: CARD_PADDING,
    borderBottomWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHeaderIcon: { marginRight: 12 },
  sheetHeaderTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  metricsVerticalContainer: { marginTop: 4 },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  metricRowLeft: { flexDirection: 'row', alignItems: 'center' },
  metricRowLabel: { fontSize: 15 },
  metricRowValue: { fontSize: 16, fontWeight: '700' },
  saveBtnFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingVertical: 18,
    borderRadius: 16,
  },
  saveBtnIcon: { marginRight: 10 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  shareButtonsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  shareBtnItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  shareBtnText: { fontSize: 13, fontWeight: '600', marginTop: 4 },
});
