import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface ChatBubbleProps {
  message: string;
  time: string;
  isOwnMessage: boolean;
  isRead?: boolean;
}

export function ChatBubble({ message, time, isOwnMessage, isRead }: ChatBubbleProps) {
  return (
    <View style={[styles.container, isOwnMessage ? styles.ownContainer : styles.otherContainer]}>
      <View style={[styles.bubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, isOwnMessage ? styles.ownText : styles.otherText]}>
          {message}
        </Text>
        <View style={styles.metaData}>
          <Text style={[styles.time, isOwnMessage ? styles.ownTime : styles.otherTime]}>
            {time}
          </Text>
          {isOwnMessage && (
            <Ionicons
              name={isRead ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={isRead ? '#60a5fa' : '#cbd5e1'}
              style={styles.checkIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 4,
    flexDirection: 'row',
  },
  ownContainer: {
    justifyContent: 'flex-start', // RTL -> right
  },
  otherContainer: {
    justifyContent: 'flex-end', // RTL -> left
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4, // RTL specific
  },
  otherBubble: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 4, // RTL specific
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Cairo-Regular',
    lineHeight: 22,
    textAlign: 'left',
  },
  ownText: {
    color: '#ffffff',
  },
  otherText: {
    color: '#334155',
  },
  metaData: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  time: {
    fontSize: 10,
    fontFamily: 'Cairo-Regular',
  },
  ownTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherTime: {
    color: '#94a3b8',
  },
  checkIcon: {
    marginLeft: 4,
  },
});
