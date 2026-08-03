import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type?: 'success' | 'warning' | 'info' | 'error';
  onPress?: () => void;
}

export function NotificationItem({
  title,
  message,
  time,
  isRead,
  type = 'info',
  onPress,
}: NotificationItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return colors.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, !isRead && styles.unreadContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrapper, { backgroundColor: getIconColor() + '15' }]}>
        <Ionicons name={getIcon()} size={24} color={getIconColor()} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, !isRead && styles.unreadText]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
      {!isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'flex-start',
  },
  unreadContainer: {
    backgroundColor: '#f8fafc',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12, // RTL
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    color: '#334155',
    flex: 1,
    textAlign: 'left',
  },
  unreadText: {
    color: '#0f172a',
  },
  time: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: '#94a3b8',
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#64748b',
    textAlign: 'left',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 12,
    marginTop: 6,
  },
});
