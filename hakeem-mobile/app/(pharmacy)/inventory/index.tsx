import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { Card, Input, AppHeader, Button, Badge } from '../../../src/components/common';

const MOCK_INVENTORY = [
  { id: 1, name: 'Amoxil 500mg Capsule', category: 'مضادات حيوية', stock: 120, price: '8.50', status: 'available' },
  { id: 2, name: 'Panadol Advance 500mg', category: 'مسكنات', stock: 45, price: '3.00', status: 'low_stock' },
  { id: 3, name: 'Vitamin C 1000mg Effervescent', category: 'فيتامينات', stock: 0, price: '5.25', status: 'out_of_stock' },
  { id: 4, name: 'Omeprazole 20mg', category: 'أدوية معدة', stock: 80, price: '12.00', status: 'available' },
];

export default function PharmacyInventoryScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');

  const filteredData = MOCK_INVENTORY.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.includes(search);
    if (!matchesSearch) return false;
    
    if (filter === 'low_stock') return item.status === 'low_stock';
    if (filter === 'out_of_stock') return item.status === 'out_of_stock';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <Badge label="متوفر" variant="success" />;
      case 'low_stock': return <Badge label="مخزون منخفض" variant="warning" />;
      case 'out_of_stock': return <Badge label="نفد من المخزون" variant="error" />;
      default: return null;
    }
  };

  const renderItem = ({ item }: { item: typeof MOCK_INVENTORY[0] }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.nameRow}>
          <View style={[styles.iconBox, { backgroundColor: item.status === 'out_of_stock' ? `${colors.error}15` : `${colors.success}15` }]}>
            <Ionicons name="medical" size={20} color={item.status === 'out_of_stock' ? colors.error : colors.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>المخزون</Text>
          <Text style={[styles.statValue, item.status === 'out_of_stock' && { color: colors.error }]}>
            {item.stock} علبة
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>السعر</Text>
          <Text style={styles.statValue}>{item.price} د.أ</Text>
        </View>
        <View style={[styles.statBox, { alignItems: 'flex-end', borderRightWidth: 0 }]}>
          {getStatusBadge(item.status)}
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader 
        title="المخزون" 
        showBack={false}
        rightComponent={
          <TouchableOpacity>
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.header}>
        <Input 
          value={search}
          onChangeText={setSearch}
          placeholder="ابحث عن دواء أو تصنيف..."
          icon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
          style={{ marginBottom: 12 }}
        />
        
        <View style={styles.filtersRow}>
          <TouchableOpacity 
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>الكل</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filter === 'low_stock' && styles.filterChipActive]}
            onPress={() => setFilter('low_stock')}
          >
            <Text style={[styles.filterText, filter === 'low_stock' && styles.filterTextActive]}>نواقص</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filter === 'out_of_stock' && styles.filterChipActive]}
            onPress={() => setFilter('out_of_stock')}
          >
            <Text style={[styles.filterText, filter === 'out_of_stock' && styles.filterTextActive]}>نفد تماماً</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingBottom: 12, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  filtersRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  listContainer: { padding: 20, gap: 16, paddingBottom: 40 },
  card: { padding: 16 },
  cardHeader: { marginBottom: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  itemName: { flex: 1, fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, textAlign: 'left' },
  itemCategory: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left', marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 12 },
  statBox: { flex: 1, paddingHorizontal: 4, borderRightWidth: 1, borderRightColor: colors.borderLight, justifyContent: 'center' },
  statLabel: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  statValue: { fontFamily: 'Cairo-Bold', fontSize: 14, color: colors.textMain },
});
