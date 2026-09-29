import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedSplashScreenProps {
  onFinish: () => void;
  minDurationMs?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onFinish,
  minDurationMs = 2400,
}) => {
  const [statusText, setStatusText] = useState('Initializing offline engine...');

  // Animation values
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.9)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const lineScale = useRef(new Animated.Value(0)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeTranslateY = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Staggered sequence for logo & animated text
    Animated.parallel([
      // Logo pop & fade in
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      // Text reveal
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.spring(textScale, {
            toValue: 1,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Expanding golden underline
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(lineScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Badge slide-up
      Animated.sequence([
        Animated.delay(800),
        Animated.parallel([
          Animated.timing(badgeOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(badgeTranslateY, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Progress bar fill
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: minDurationMs - 400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Continuous subtle pulse on the solar icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Status text sequence
    const t1 = setTimeout(() => setStatusText('Loading commissioning schemas...'), 700);
    const t2 = setTimeout(() => setStatusText('Verifying offline database...'), 1400);
    const t3 = setTimeout(() => setStatusText('Field ready'), 2000);

    // 4. Fade out container and complete
    const finishTimeout = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, minDurationMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(finishTimeout);
    };
  }, [minDurationMs, onFinish]);

  const handleSkip = () => {
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* Background Decorative Rings */}
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <TouchableOpacity
        style={styles.touchableArea}
        activeOpacity={1}
        onPress={handleSkip}
      >
        <View style={styles.contentContainer}>
          {/* Animated Solar Energy Icon */}
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                opacity: logoOpacity,
                transform: [{ scale: Animated.multiply(logoScale, pulseAnim) }],
              },
            ]}
          >
            <View style={styles.iconCircleOuter}>
              <View style={styles.iconCircleInner}>
                <Ionicons name="sunny" size={44} color="#F59E0B" />
              </View>
            </View>
          </Animated.View>

          {/* Animated Typography: costplusinc */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: textOpacity,
                transform: [{ scale: textScale }],
              },
            ]}
          >
            <View style={styles.textRow}>
              <Text style={styles.brandMain}>costplus</Text>
              <Text style={styles.brandAccent}>inc</Text>
            </View>
            <Text style={styles.brandDot}>.</Text>
          </Animated.View>

          {/* Animated Accent Line */}
          <Animated.View
            style={[
              styles.accentLineWrapper,
              {
                transform: [{ scaleX: lineScale }],
              },
            ]}
          >
            <View style={styles.accentLineGradient} />
          </Animated.View>

          {/* Subtitle & Badge */}
          <Animated.View
            style={[
              styles.subtitleBadge,
              {
                opacity: badgeOpacity,
                transform: [{ translateY: badgeTranslateY }],
              },
            ]}
          >
            <Text style={styles.subtitleText}>
              FIELD COMMISSIONING & AUDIT SUITE
            </Text>
            <Text style={styles.subtitleSubText}>
              Philippine Rural Electrification Protocol
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Loading Progress Bar */}
        <View style={styles.bottomSection}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>{statusText}</Text>
            <Text style={styles.versionText}>v1.0.0 · OFFLINE</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#070D1E',
    zIndex: 999999,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  touchableArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(13, 110, 253, 0.18)',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    bottom: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconWrapper: {
    marginBottom: 20,
  },
  iconCircleOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  iconCircleInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0F1E36',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandMain: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  brandAccent: {
    fontSize: 38,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: -1,
  },
  brandDot: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0D6EFD',
  },
  accentLineWrapper: {
    width: 140,
    height: 3,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 2,
    overflow: 'hidden',
  },
  accentLineGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F59E0B',
  },
  subtitleBadge: {
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
  },
  subtitleSubText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
  },
  bottomSection: {
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 20,
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  versionText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
