import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const TabIcon = ({ 
  isFocused, 
  options, 
  badgeCount, 
  isCenter 
}: { 
  isFocused: boolean; 
  options: any; 
  badgeCount?: number;
  isCenter: boolean;
}) => {
  const scale = useRef(new Animated.Value(isFocused ? 1 : 0.9)).current;
  const translateY = useRef(new Animated.Value(isFocused ? -4 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? (isCenter ? 1.2 : 1.1) : 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(translateY, {
        toValue: isFocused && !isCenter ? -4 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      })
    ]).start();
  }, [isFocused]);

  if (isCenter) {
    return (
      <Animated.View style={[styles.centerButton, { transform: [{ scale }] }]}>
        {options.tabBarIcon ? (
          options.tabBarIcon({
            focused: isFocused,
            color: '#fff',
            size: 26,
          })
        ) : (
          <Ionicons name="home" size={26} color="#fff" />
        )}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale }, { translateY }] }}>
      <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        {options.tabBarIcon ? (
          options.tabBarIcon({
            focused: isFocused,
            color: isFocused ? colors.primary : '#94a3b8',
            size: 24,
          })
        ) : (
          <Ionicons name="alert-circle-outline" size={24} color={isFocused ? colors.primary : '#94a3b8'} />
        )}
        {badgeCount != null && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  
  // Check if we should hide the tab bar completely for the active screen
  const focusedRoute = state.routes[state.index];
  const focusedOptions = descriptors[focusedRoute.key].options;
  if ((focusedOptions.tabBarStyle as any)?.display === 'none') {
    return null;
  }

  // Filter out hidden routes — only show tabs that have a tabBarIcon defined (set explicitly in layout)
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    // Hidden tabs (href: null) won't have tabBarIcon set — use this as the reliable filter
    return typeof options.tabBarIcon === 'function';
  });

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
      <View style={styles.tabBar}>
        {visibleRoutes.map((route, visibleIndex) => {
          const routeIndex = state.routes.findIndex(r => r.key === route.key);
          const { options } = descriptors[route.key];

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === routeIndex;
          const badgeCount = (options as any).tabBarBadge as number | undefined;
          
          // The center index depends on how many visible routes there are. Usually 5 routes => index 2 is center.
          const isCenter = Math.floor(visibleRoutes.length / 2) === visibleIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tabItem, isCenter && styles.centerItemWrapper]}
              activeOpacity={0.8}
            >
              <TabIcon isFocused={isFocused} options={options} badgeCount={badgeCount} isCenter={isCenter} />
              
              {!isCenter && (
                <Text style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.primary : '#94a3b8' },
                  isFocused && styles.tabLabelActive,
                ]}>
                  {label as string}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    height: 68,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  centerItemWrapper: {
    position: 'relative',
    top: -24,
    justifyContent: 'flex-start',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 4,
    borderColor: '#f8fafc',
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Cairo-SemiBold',
    marginTop: 4,
  },
  tabLabelActive: {
    fontFamily: 'Cairo-Bold',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Cairo-Bold',
  },
});
