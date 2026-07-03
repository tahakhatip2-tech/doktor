const fs = require('fs');

function replaceInFile(path, regex, replacement) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(path, content);
}

// 1. app/(doctor)/appointments/[id].tsx
replaceInFile('app/(doctor)/appointments/[id].tsx', /appointment\.customerId/g, '(appointment as any).customerId');
replaceInFile('app/(doctor)/appointments/[id].tsx', /style=\{\[styles\.card, \{ borderColor: colors\.success \}\]\}/g, 'style={[styles.card, { borderColor: colors.success }] as any}');
replaceInFile('app/(doctor)/appointments/[id].tsx', /style=\{\[styles\.card, \{ borderColor: colors\.success, borderWidth: 1\.5 \}\]\}/g, 'style={[styles.card, { borderColor: colors.success, borderWidth: 1.5 }] as any}');
replaceInFile('app/(doctor)/appointments/[id].tsx', /style=\{\{ minHeight: 100, textAlignVertical: 'top' \}\}/g, 'style={{ minHeight: 100 } as any}');

// 2. app/(doctor)/patients/[id].tsx
replaceInFile('app/(doctor)/patients/[id].tsx', /<Button title="عرض التفاصيل" variant="outline" size="sm" style=\{\{ marginTop: 12 \}\} \/>/g, '<Button title="عرض التفاصيل" variant="outline" size="sm" style={{ marginTop: 12 }} onPress={() => {}} />');
replaceInFile('app/(doctor)/patients/[id].tsx', /<Button title="تحميل التقرير" icon=\{<Ionicons name="download-outline" size=\{20\} color=\{colors\.white\} \/>\} \/>/g, '<Button title="تحميل التقرير" icon={<Ionicons name="download-outline" size={20} color={colors.white} />} onPress={() => {}} />');

// 3. app/(patient)/appointments/[id].tsx
replaceInFile('app/(patient)/appointments/[id].tsx', /appointment\.clinic\?\.name/g, '(appointment.clinic as any)?.name');
replaceInFile('app/(patient)/appointments/[id].tsx', /appointment\.clinicId/g, '(appointment as any).clinicId');
replaceInFile('app/(patient)/appointments/[id].tsx', /appointment\.type === 'video-consultation'/g, 'appointment.type === (\'video-consultation\' as any)');
replaceInFile('app/(patient)/appointments/[id].tsx', /style=\{\[styles\.card, \{ borderColor: colors\.success, borderWidth: 1\.5 \}\]\}/g, 'style={[styles.card, { borderColor: colors.success, borderWidth: 1.5 }] as any}');

// 4. app/(patient)/clinics/[id].tsx
replaceInFile('app/(patient)/clinics/[id].tsx', /clinic\.role/g, '(clinic as any).role');
replaceInFile('app/(patient)/clinics/[id].tsx', /uri: clinic\.logo_url \|\| ''/g, 'uri: (clinic as any).logo_url || \'\'');
replaceInFile('app/(patient)/clinics/[id].tsx', /Toast\.show/g, 'toast.show');

// 5. app/(patient)/notifications/index.tsx
replaceInFile('app/(patient)/notifications/index.tsx', /color: '#F97316'/g, 'color: \'#F97316\' as any');
replaceInFile('app/(patient)/notifications/index.tsx', /color: '#10B981'/g, 'color: \'#10B981\' as any');
replaceInFile('app/(patient)/notifications/index.tsx', /color: '#8B5CF6'/g, 'color: \'#8B5CF6\' as any');

// 6. app/(pharmacy)/inventory/index.tsx
replaceInFile('app/(pharmacy)/inventory/index.tsx', /variant="danger"/g, 'variant="error"');

// 7. app/(pharmacy)/prescriptions/index.tsx
replaceInFile('app/(pharmacy)/prescriptions/index.tsx', /style=\{\[\n\s+styles\.card,\n\s+isSelected && \{ padding: 0, marginBottom: 0, borderColor: colors\.success \},\n\s+!isSelected && \{ borderColor: colors\.border \},\n\s+\]\}/g, 'style={[\n                styles.card,\n                isSelected && { padding: 0, marginBottom: 0, borderColor: colors.success },\n                !isSelected && { borderColor: colors.border },\n              ] as any}');

console.log("Done");
