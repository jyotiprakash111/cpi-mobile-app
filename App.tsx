import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { FormSchema } from './src/types/schema';
import { DEFAULT_SCHEMA, getActiveSchema, setActiveSchema } from './src/schema/schemaRegistry';
import { darkTheme, highContrastTheme, lightTheme, ThemeColors } from './src/styles/theme';
import { CommissioningFormScreen } from './src/screens/CommissioningFormScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SchemaManagerScreen } from './src/screens/SchemaManagerScreen';
import { loadAppSettings, saveAppSettings } from './src/storage/formStorage';
import { AnimatedSplashScreen } from './src/components/common/AnimatedSplashScreen';

export default function App() {
  const [currentSchema, setCurrentSchema] = useState<FormSchema>(DEFAULT_SCHEMA);
  const [currentScreen, setCurrentScreen] = useState<'form' | 'history' | 'schema'>('form');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Load active schema and user settings on app launch (offline cold start)
  useEffect(() => {
    async function initApp() {
      try {
        const schema = await getActiveSchema();
        setCurrentSchema(schema);

        const settings = await loadAppSettings();
        setIsHighContrast(settings.highContrastMode);
      } catch (err) {
        console.warn('App initialization error:', err);
      } finally {
        setIsReady(true);
      }
    }
    initApp();
  }, []);

  const handleToggleHighContrast = async () => {
    const nextVal = !isHighContrast;
    setIsHighContrast(nextVal);
    await saveAppSettings({ highContrastMode: nextVal });
  };

  const handleUpdateSchema = async (newSchema: FormSchema) => {
    setCurrentSchema(newSchema);
    await setActiveSchema(newSchema);
  };

  const handleResetSchema = async () => {
    setCurrentSchema(DEFAULT_SCHEMA);
    await setActiveSchema(null);
  };

  const currentTheme: ThemeColors = isHighContrast ? highContrastTheme : lightTheme;

  return (
    <SafeAreaProvider>
      {showSplash ? (
        <AnimatedSplashScreen
          onFinish={() => setShowSplash(false)}
          minDurationMs={2400}
        />
      ) : (
        <SafeAreaView
          style={[styles.safeArea, { backgroundColor: currentTheme.surface }]}
          edges={['top', 'left', 'right']}
        >
          <StatusBar style={isHighContrast ? 'dark' : 'dark'} />

          <View style={[styles.appRoot, { backgroundColor: currentTheme.background }]}>
            {currentScreen === 'form' && (
              <CommissioningFormScreen
                schema={currentSchema}
                onUpdateSchema={handleUpdateSchema}
                onResetSchema={handleResetSchema}
                onOpenHistory={() => setCurrentScreen('history')}
                theme={currentTheme}
                isHighContrast={isHighContrast}
                onToggleHighContrast={handleToggleHighContrast}
              />
            )}

            {currentScreen === 'history' && (
              <HistoryScreen
                onBack={() => setCurrentScreen('form')}
                theme={currentTheme}
              />
            )}

            {currentScreen === 'schema' && (
              <SchemaManagerScreen
                currentSchema={currentSchema}
                onApplySchema={handleUpdateSchema}
                onResetDefault={handleResetSchema}
                onBack={() => setCurrentScreen('form')}
                theme={currentTheme}
              />
            )}
          </View>
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  appRoot: {
    flex: 1,
  },
});
