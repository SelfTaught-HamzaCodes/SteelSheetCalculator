import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar as RNStatusBar, I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from './i18n/config';

import HomeScreen from './screens/HomeScreen';
import ResultsScreen from './screens/ResultsScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

const TAB_HOME = 'home';
const TAB_RESULTS = 'results';
const TAB_HISTORY = 'history';
const TAB_SETTINGS = 'settings';
const HISTORY_KEY = '@SteelSheetCalculator/history';
const DEFAULT_SHEET_SIZES_KEY = '@SteelSheetCalculator/defaultSheetSizes';
const LANGUAGE_KEY = '@SteelSheetCalculator/language';

// notch / status bar - ios vs android
const CONTENT_TOP_PADDING = Platform.OS === 'ios' ? 50 : (RNStatusBar.currentHeight || 24);
const NAV_BOTTOM_PADDING = Platform.OS === 'ios' ? 28 : 12;

export default function App() {
  const { t, i18n } = useTranslation();
  const [screen, setScreen] = useState(TAB_HOME);
  const [lastCalculation, setLastCalculation] = useState(null);
  const [lastInputSnapshot, setLastInputSnapshot] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDark, setIsDark] = useState(false);
  const [defaultSheetSizes, setDefaultSheetSizes] = useState([8, 10]);
  const [editPrefill, setEditPrefill] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // load persisted stuff on mount
  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((raw) => {
      try {
        if (raw) setHistory(JSON.parse(raw));
      } catch (_) {}
    });
    AsyncStorage.getItem(DEFAULT_SHEET_SIZES_KEY).then((raw) => {
      try {
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr) && arr.length > 0) setDefaultSheetSizes(arr);
        }
      } catch (_) {}
    });
    AsyncStorage.getItem(LANGUAGE_KEY).then((lang) => {
      if (lang && (lang === 'en' || lang === 'ur')) {
        setCurrentLanguage(lang);
        i18n.changeLanguage(lang);
      }
    });
  }, [i18n]);

  // save history whenever it changes
  useEffect(() => {
    if (history.length === 0) return;
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const handleDefaultSheetSizesChange = useCallback((sizes) => {
    setDefaultSheetSizes(sizes);
    AsyncStorage.setItem(DEFAULT_SHEET_SIZES_KEY, JSON.stringify(sizes));
  }, []);

  const handleCalculate = useCallback((calculation, inputSnapshot) => {
    setLastCalculation(calculation);
    setLastInputSnapshot(inputSnapshot);
    setEditPrefill(null);
    setScreen(TAB_RESULTS);
  }, []);

  // add current result to history and jump to history tab
  const handleSaveToHistory = useCallback(() => {
    if (!lastCalculation || !lastInputSnapshot) return;
    setHistory((prev) => [
      {
        id: Date.now().toString(),
        timestamp: Date.now(),
        calculation: lastCalculation,
        inputSnapshot: lastInputSnapshot,
      },
      ...prev,
    ]);
    setScreen(TAB_HISTORY);
  }, [lastCalculation, lastInputSnapshot]);

  // prefill home screen when editing from history
  const handleEditFromHistory = useCallback((item) => {
    setEditPrefill(item.inputSnapshot || null);
    setScreen(TAB_HOME);
  }, []);

  const handleDeleteHistory = useCallback(() => {
    setHistory([]);
    AsyncStorage.removeItem(HISTORY_KEY);
  }, []);

  const handleLanguageChange = useCallback(async (lang) => {
    const success = await changeLanguage(lang);
    if (success) {
      setCurrentLanguage(lang);
    }
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case TAB_RESULTS:
        return (
          <ResultsScreen
            calculation={lastCalculation}
            inputSnapshot={lastInputSnapshot}
            onGoBack={() => setScreen(TAB_HOME)}
            onSave={handleSaveToHistory}
            isDark={isDark}
          />
        );
      case TAB_HISTORY:
        return (
          <HistoryScreen
            history={history}
            onEdit={handleEditFromHistory}
            isDark={isDark}
          />
        );
      case TAB_SETTINGS:
        return (
          <SettingsScreen
            isDark={isDark}
            onDarkChange={setIsDark}
            onDeleteHistory={handleDeleteHistory}
            defaultSheetSizes={defaultSheetSizes}
            onDefaultSheetSizesChange={handleDefaultSheetSizesChange}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
        );
      default:
        // key forces remount when switching edit vs fresh so prefill applies
        const prefill = editPrefill || {};
        return (
          <HomeScreen
            key={editPrefill ? 'edit' : `home-${(defaultSheetSizes || []).join(',')}`}
            onCalculate={handleCalculate}
            defaultRunningLength={prefill.runningLengthMeterPerTon ?? 1270}
            defaultSheetSizes={prefill.selectedSheetLengthsFt ?? defaultSheetSizes}
            defaultCosting={prefill.costingMaterialRs ?? ''}
            defaultThickness={prefill.thicknessMm ?? ''}
            defaultWidthMm={prefill.sheetWidthMm ?? 1000}
            isDark={isDark}
          />
        );
    }
  };

  const navActiveColor = isDark ? '#2dd4bf' : '#0d9488';
  const navInactiveColor = isDark ? '#94a3b8' : '#64748b';
  const navColor = (tab) => (screen === tab ? navActiveColor : navInactiveColor);
  const navLabelStyle = (tab) => ({
    fontSize: 12,
    color: navColor(tab),
    fontWeight: screen === tab ? '600' : '400',
  });

  const headerBg = isDark ? '#1e293b' : '#fff';
  return (
    <View style={[styles.app, isDark && styles.appDark]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.content, { paddingTop: CONTENT_TOP_PADDING, backgroundColor: headerBg }]}>
        {renderScreen()}
      </View>
      <View
        style={[
          styles.bottomNav,
          isDark && styles.bottomNavDark,
          { paddingBottom: NAV_BOTTOM_PADDING },
        ]}
      >
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setScreen(TAB_HISTORY)}
        >
          <Ionicons
            name={screen === TAB_HISTORY ? 'time' : 'time-outline'}
            size={24}
            color={navColor(TAB_HISTORY)}
            style={styles.navIcon}
          />
          <Text style={navLabelStyle(TAB_HISTORY)}>{t('nav.history')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setScreen(TAB_HOME)}
        >
          <Ionicons
            name={screen === TAB_HOME ? 'home' : 'home-outline'}
            color={navColor(TAB_HOME)}
            size={24}
            style={styles.navIcon}
          />
          <Text style={navLabelStyle(TAB_HOME)}>{t('nav.home')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setScreen(TAB_SETTINGS)}
        >
          <Ionicons
            name={screen === TAB_SETTINGS ? 'settings' : 'settings-outline'}
            size={24}
            color={navColor(TAB_SETTINGS)}
            style={styles.navIcon}
          />
          <Text style={navLabelStyle(TAB_SETTINGS)}>{t('nav.settings')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#f1f5f9' },
  appDark: { backgroundColor: '#0f172a' },
  content: { flex: 1 },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1.5,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomNavDark: { backgroundColor: '#0f172a', borderTopColor: '#334155' },
  navItem: { alignItems: 'center', paddingVertical: 6 },
  navIcon: { marginBottom: 4 },
});
