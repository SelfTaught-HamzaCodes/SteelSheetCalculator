import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// e.g. "15 January 14:30"
function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const day = d.getDate();
  const months = 'January February March April May June July August September October November December'.split(' ');
  const month = months[d.getMonth()];
  const h = d.getHours();
  const m = d.getMinutes();
  return `${day} ${month} ${h}:${String(m).padStart(2, '0')}`;
}

export default function HistoryScreen({ history, onEdit, isDark, emptyMessage }) {
  const { t } = useTranslation();
  const theme = isDark ? darkTheme : lightTheme;

  // empty state vs list of cards
  return (
    <View style={[styles.container, theme.container]}>
      <View style={styles.titleRow}>
        <Ionicons name="time-outline" size={28} color={(theme.accent && theme.accent.color) || (isDark ? '#2dd4bf' : '#0d9488')} style={styles.titleIcon} />
        <Text style={[styles.screenTitle, theme.text]}>{t('history.title')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!history || history.length === 0 ? (
          <View style={[styles.emptyState, theme.emptyState]}>
            <Ionicons name="document-text-outline" size={56} color={theme.emptyIcon} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, theme.text]}>{t('history.noCalculations')}</Text>
            <Text style={[styles.emptySubtext, theme.subtle]}>
              {emptyMessage || 'Run a calculation and tap “Save to History” on the results screen to see it here.'}
            </Text>
          </View>
        ) : (
          history.map((item, index) => (
            <View key={item.id || index} style={[styles.card, theme.card]}>
              <View style={[styles.datePill, theme.datePill]}>
                <Ionicons name="calendar-outline" size={12} color={theme.datePillColor} style={{ marginRight: 4 }} />
                <Text style={[styles.dateText, { color: theme.datePillColor }]}>{formatDate(item.timestamp)}</Text>
              </View>

              <View style={styles.chipRow}>
                <View style={[styles.chip, styles.chipEqual, theme.chipThickness]}>
                  <Ionicons name="resize-outline" size={14} color={isDark ? '#cbd5e1' : '#475569'} style={styles.chipIcon} />
                  <Text style={[styles.chipText, theme.chipThicknessText]} numberOfLines={1} ellipsizeMode="tail">
                    {item.inputSnapshot?.thicknessMm ?? '–'} {t('units.mm')}
                  </Text>
                </View>
                <View style={[styles.chip, styles.chipEqual, theme.chipLength]}>
                  <Ionicons name="resize-outline" size={14} color={isDark ? '#cbd5e1' : '#475569'} style={styles.chipIcon} />
                  <Text style={[styles.chipText, theme.chipLengthText]} numberOfLines={1} ellipsizeMode="tail">
                    {item.inputSnapshot?.sheetWidthMm != null ? `${item.inputSnapshot.sheetWidthMm} ${t('units.mm')}` : '–'}
                  </Text>
                </View>
              </View>
              <View style={styles.chipRow}>
                <View style={[styles.chip, styles.chipEqual, theme.chipMperTon]}>
                  <Ionicons name="speedometer-outline" size={14} color={isDark ? '#cbd5e1' : '#475569'} style={styles.chipIcon} />
                  <Text style={[styles.chipText, theme.chipMperTonText]} numberOfLines={1} ellipsizeMode="tail">
                    {item.inputSnapshot?.runningLengthMeterPerTon ?? '–'} {t('units.mton')}
                  </Text>
                </View>
                <View style={[styles.chip, styles.chipEqual, theme.chipCost]}>
                  <Ionicons name="wallet-outline" size={14} color={isDark ? '#cbd5e1' : '#475569'} style={styles.chipIcon} />
                  <Text style={[styles.chipText, theme.chipCostText]} numberOfLines={1} ellipsizeMode="tail">
                    {String(item.inputSnapshot?.costingMaterialRs || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} {t('units.rs')}
                  </Text>
                </View>
              </View>
              <View style={styles.chipRow}>
                <View style={[styles.chip, styles.chipEqual, theme.chipLength, theme.chipLengthHighlight]}>
                  <Ionicons name="resize-outline" size={14} color={isDark ? '#2dd4bf' : '#0d9488'} style={styles.chipIcon} />
                  <Text style={[styles.chipText, theme.chipLengthHighlightText]} numberOfLines={1} ellipsizeMode="tail">
                    {item.calculation?.lengthInches?.toLocaleString() ?? '–'} {t('units.in')}
                  </Text>
                </View>
                <View style={[styles.chip, styles.chipEqual, theme.chipLength, theme.chipLengthHighlight]}>
                  <Ionicons name="resize-outline" size={14} color={isDark ? '#2dd4bf' : '#0d9488'} style={styles.chipIcon} />
                  <Text style={[styles.chipText, theme.chipLengthHighlightText]} numberOfLines={1} ellipsizeMode="tail">
                    {item.calculation?.lengthFeet?.toLocaleString() ?? '–'} {t('units.ft')}
                  </Text>
                </View>
              </View>

              <View style={styles.resultsSection}>
                {(item.calculation?.resultsPerSize || []).map((r) => (
                  <View key={r.sheetLengthFt} style={[styles.resultChip, theme.resultChip]}>
                    <View style={styles.resultChipHeader}>
                      <Ionicons name="copy-outline" size={16} color={isDark ? '#2dd4bf' : '#0d9488'} style={styles.resultChipIcon} />
                      <Text style={[styles.resultChipTitle, { color: isDark ? '#2dd4bf' : '#0d9488' }]}>{r.sheetLengthFt} {t('units.ft')}</Text>
                    </View>
                    <View style={styles.resultChipDetails}>
                      <View style={styles.resultChipDetailItem}>
                        <Ionicons name="layers-outline" size={14} color={isDark ? '#f8fafc' : '#0f172a'} style={styles.resultChipDetailIcon} />
                        <Text style={[styles.resultChipDetail, theme.text]}>{r.numberOfSheets} {t('results.sheets')}</Text>
                      </View>
                      <Text style={[styles.resultChipSeparator, theme.text]}>·</Text>
                      <View style={styles.resultChipDetailItem}>
                        <Ionicons name="scale-outline" size={14} color={isDark ? '#f8fafc' : '#0f172a'} style={styles.resultChipDetailIcon} />
                        <Text style={[styles.resultChipDetail, theme.text]}>{r.weightPerSheetKg} {t('units.kgPerSheet')}</Text>
                      </View>
                      <Text style={[styles.resultChipSeparator, theme.text]}>·</Text>
                      <View style={styles.resultChipDetailItem}>
                        <Ionicons name="cash-outline" size={14} color={isDark ? '#f8fafc' : '#0f172a'} style={styles.resultChipDetailIcon} />
                        <Text style={[styles.resultChipDetail, theme.text]}>{r.costPerSheetRs} {t('units.rs')}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.editBtn, theme.editBtn]}
                onPress={() => onEdit(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil-outline" size={18} color={theme.editBtnIconColor} style={styles.editBtnIcon} />
                <Text style={[styles.editBtnText, { color: theme.editBtnIconColor }]}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const lightTheme = {
  container: { backgroundColor: '#f8fafc' },
  text: { color: '#0f172a' },
  subtle: { color: '#64748b' },
  accent: { color: '#0d9488' },
  card: { backgroundColor: '#ffffff', borderColor: 'transparent' },
  datePill: { backgroundColor: 'transparent' },
  datePillColor: '#64748b',
  chipThickness: { backgroundColor: '#f1f5f9' },
  chipThicknessText: { color: '#475569' },
  chipMperTon: { backgroundColor: '#f1f5f9' },
  chipMperTonText: { color: '#475569' },
  chipCost: { backgroundColor: '#f1f5f9' },
  chipCostText: { color: '#475569' },
  chipLength: { backgroundColor: '#f1f5f9' },
  chipLengthText: { color: '#475569' },
  chipLengthHighlight: { backgroundColor: 'rgba(13,148,136,0.08)', borderColor: 'rgba(13,148,136,0.2)', borderWidth: 1 },
  chipLengthHighlightText: { color: '#0d9488', fontWeight: '700' },
  accent: { color: '#0d9488' },
  resultChip: { backgroundColor: '#ecfdf5', borderColor: 'rgba(13,148,136,0.2)' },
  editBtn: { backgroundColor: 'transparent', borderColor: '#0d9488' },
  editBtnIconColor: '#0d9488',
  emptyState: { backgroundColor: 'transparent' },
  emptyIcon: '#cbd5e1',
};

const darkTheme = {
  container: { backgroundColor: '#0f172a' },
  text: { color: '#f8fafc' },
  subtle: { color: '#94a3b8' },
  accent: { color: '#2dd4bf' },
  card: { backgroundColor: '#1e293b', borderColor: 'transparent' },
  datePill: { backgroundColor: 'transparent' },
  datePillColor: '#94a3b8',
  chipThickness: { backgroundColor: '#334155' },
  chipThicknessText: { color: '#cbd5e1' },
  chipMperTon: { backgroundColor: '#334155' },
  chipMperTonText: { color: '#cbd5e1' },
  chipCost: { backgroundColor: '#334155' },
  chipCostText: { color: '#cbd5e1' },
  chipLength: { backgroundColor: '#334155' },
  chipLengthText: { color: '#cbd5e1' },
  chipLengthHighlight: { backgroundColor: 'rgba(45,212,191,0.15)', borderColor: 'rgba(45,212,191,0.3)', borderWidth: 1 },
  chipLengthHighlightText: { color: '#2dd4bf', fontWeight: '700' },
  accent: { color: '#2dd4bf' },
  resultChip: { backgroundColor: 'rgba(45,212,191,0.12)', borderColor: 'rgba(45,212,191,0.25)' },
  editBtn: { backgroundColor: 'transparent', borderColor: '#2dd4bf' },
  editBtnIconColor: '#2dd4bf',
  emptyState: { backgroundColor: 'transparent' },
  emptyIcon: '#475569',
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 100 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  titleIcon: { marginRight: 12 },
  screenTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  scrollContent: { paddingBottom: 24 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: { marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  emptySubtext: { fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 280 },
  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 9999,
    marginBottom: 14,
  },
  dateText: { fontSize: 12, fontWeight: '500' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    justifyContent: 'center',
    minWidth: 0,
  },
  chipEqual: { flex: 1 },
  chipIcon: { marginRight: 6 },
  chipText: { fontSize: 13, fontWeight: '600' },
  resultsSection: { marginTop: 12, gap: 8 },
  resultChip: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  resultChipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultChipIcon: { marginRight: 6 },
  resultChipTitle: { fontSize: 14, fontWeight: '700' },
  resultChipDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  resultChipDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultChipDetailIcon: { marginRight: 4, opacity: 0.9 },
  resultChipDetail: { fontSize: 13, opacity: 0.9 },
  resultChipSeparator: { marginHorizontal: 6, opacity: 0.5, fontSize: 13 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  editBtnIcon: { marginRight: 6 },
  editBtnText: { fontSize: 15, fontWeight: '600' },
});
