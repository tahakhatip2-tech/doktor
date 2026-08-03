import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Input, Button } from './index';
import { colors } from '../../theme/colors';

interface PreliminaryExamsModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { initialTests: string; medicalProcedures: string }) => void;
  isLoading?: boolean;
  initialData?: { initialTests?: string; medicalProcedures?: string };
}

export function PreliminaryExamsModal({ visible, onClose, onSubmit, isLoading = false, initialData }: PreliminaryExamsModalProps) {
  const [initialTests, setInitialTests] = useState('');
  const [medicalProcedures, setMedicalProcedures] = useState('');

  useEffect(() => {
    if (visible) {
      setInitialTests(initialData?.initialTests || '');
      setMedicalProcedures(initialData?.medicalProcedures || '');
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    onSubmit({ initialTests, medicalProcedures });
  };

  const isFormValid = initialTests.trim() !== '' || medicalProcedures.trim() !== '';

  return (
    <Modal visible={visible} onClose={onClose} size="md">
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="medical-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>الفحوصات الأولية</Text>
          <Text style={styles.subtitle}>الرجاء إدخال العلامات الحيوية والإجراءات التمريضية التي تمت قبل بدء كشف الطبيب.</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="العلامات الحيوية والفحوصات المبدئية"
            placeholder="مثال: ضغط الدم 120/80، النبض 75، الحرارة 37..."
            value={initialTests}
            onChangeText={setInitialTests}
            multiline
            numberOfLines={3}
          />
          <Input
            label="الإجراءات الطبية / التمريضية (اختياري)"
            placeholder="مثال: غيار جرح، إعطاء حقنة مسكنة، فحص سكري..."
            value={medicalProcedures}
            onChangeText={setMedicalProcedures}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isLoading}>
            <Text style={styles.cancelText}>إلغاء</Text>
          </TouchableOpacity>
          <Button
            title="حفظ الفحوصات"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!isFormValid || isLoading}
            style={styles.submitButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Cairo-Bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    color: '#64748b',
  },
  submitButton: {
    flex: 2,
  },
});
