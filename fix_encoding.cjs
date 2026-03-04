const fs = require('fs');

function fixMojibake(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Convert string where each character represents a byte back to buffer using Windows-1256?
    // Let's use iconv-lite if available, else Buffer
    try {
        // Many times, mojibake happens because Buffer.from(content, 'utf8').toString('binary') 
        // Or if the content is just corrupted text in utf-8 now...

        let buf = Buffer.from(content, 'utf8');
        console.log("Fixing:", filePath);

        // Let's create a map to replace specific bad patterns common in PatientClinicDetail.tsx
        let newContent = content
            .replace(/طھعذر/g, 'تعذر')
            .replace(/المظˆاعظٹد/g, 'المواعيد')
            .replace(/المطھاحة/g, 'المتاحة')
            .replace(/العظٹادة/g, 'العيادة')
            .replace(/العظٹاداطھ/g, 'العيادات')
            .replace(/الرئظٹسظٹة/g, 'الرئيسية')
            .replace(/المحادثاطھ/g, 'المحادثات')
            .replace(/بظˆابة/g, 'بوابة')
            .replace(/الإحصائظٹاطھ/g, 'الإحصائيات')
            .replace(/أثناط،/g, 'أثناء')
            .replace(/طھشط؛ظٹل/g, 'تشغيل')
            .replace(/الطھطبظٹق/g, 'التطبيق')
            .replace(/ط؛ظٹر/g, 'غير')
            .replace(/مطھظˆقع/g, 'متوقع')
            .replace(/طھحمظٹل/g, 'تحميل')
            .replace(/البظٹاناطھ/g, 'البيانات')
            .replace(/ظˆإعادة/g, 'وإعادة')
            .replace(/العظˆدة/g, 'العودة')
            .replace(/اخطھر/g, 'اختر')
            .replace(/الظٹظˆم/g, 'اليوم')
            .replace(/الظˆقطھ/g, 'الوقت')
            .replace(/ظپظٹ/g, 'في')
            .replace(/انطھظار/g, 'انتظار')
            .replace(/أظٹام/g, 'أيام')
            .replace(/الشهر/g, 'الشهر')
            .replace(/طھأظƒظٹد/g, 'تأكيد')
            .replace(/الحجز/g, 'الحجز')
            .replace(/ظٹرجى/g, 'يرجى')
            .replace(/طھظˆجد/g, 'توجد')
            .replace(/ملاحظاطھ/g, 'ملاحظات')
            .replace(/طھظپاصظٹل/g, 'تفاصيل')
            .replace(/ظپارط؛اً/g, 'فارغاً')
            .replace(/سطھظڈشعظژر/g, 'ستُشعر')
            .replace(/الطہارظٹخ/g, 'التاريخ')
            .replace(/الطھأظƒظٹد/g, 'التأكيد')
            .replace(/طھساعد/g, 'تساعد')
            .replace(/الاسطھعداد/g, 'الاستعداد')
            .replace(/لزظٹارطھظƒ/g, 'لزيارتك')
            .replace(/ظƒان/g, 'كان')
            .replace(/لظƒ/g, 'لك')
            .replace(/ظƒنطھ/g, 'كنت')
            .replace(/إلط؛اط،/g, 'إلغاء')
            .replace(/طھم/g, 'تم')
            .replace(/إرسال/g, 'إرسال')
            .replace(/طلب/g, 'طلب')
            .replace(/مظˆعدظƒ/g, 'موعدك')
            .replace(/الطھقظˆظٹم/g, 'التقويم')
            .replace(/رؤظˆس/g, 'رؤوس')
            .replace(/اثنظٹن/g, 'اثنين')
            .replace(/ثلاثاط،/g, 'ثلاثاء')
            .replace(/أربعاط،/g, 'أربعاء')
            .replace(/خمظٹس/g, 'خميس')
            .replace(/سبطھ/g, 'سبت')
            .replace(/طھحدظٹد/g, 'تحديد')
            .replace(/ظƒل/g, 'كل')
            .replace(/ظƒمقرظˆط،/g, 'كمقروء')
            .replace(/بظƒ/g, 'بك')
            .replace(/دظƒطھظˆر/g, 'دكتور')
            .replace(/مدظٹر/g, 'مدير')
            .replace(/طبظٹب/g, 'طبيب')
            .replace(/إعداداطھ/g, 'إعدادات')
            .replace(/الظˆاجهاطھ/g, 'الواجهات')
            .replace(/الظˆضع/g, 'الوضع')
            .replace(/النهارظٹ/g, 'النهاري')
            .replace(/اللظٹلظٹ/g, 'الليلي')
            .replace(/مقرظˆط،/g, 'مقروء')
            .replace(/الإشعاراطھ/g, 'الإشعارات')
            .replace(/جدظٹدة/g, 'جديدة')
            .replace(/طھظƒ/g, 'تك')
            .replace(/طھسجظٹل/g, 'تسجيل')
            .replace(/الخرظˆج/g, 'الخروج')
            .replace(/طھأظƒد/g, 'تأكد')
            .replace(/العظˆان/g, 'العنوان')
            .replace(/الهاطھظپ/g, 'الهاتف')
            .replace(/ساعاطھ/g, 'ساعات')
            .replace(/ملاحظاط/g, 'ملاحظات')
            .replace(/الطبظٹب/g, 'الطبيب')
            .replace(/طھطھم/g, 'تتم')
            .replace(/بناط،/g, 'بناء')
            .replace(/الطھارظٹخ/g, 'التاريخ');

        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log("Fixed Mojibake in", filePath);
    } catch (e) {
        console.error(e);
    }
}

const glob = require('glob');
// We need to run it on PatientClinicDetail.tsx and PatientDashboard.tsx and Header.tsx and Sidebar.tsx
// Let's do it manually for these specific files that had issues.
const files = [
    'src/pages/patient/PatientClinicDetail.tsx',
    'src/pages/patient/PatientDashboard.tsx',
    'src/components/Header.tsx',
    'src/components/Sidebar.tsx',
    'src/components/ErrorBoundary.tsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        fixMojibake(file);
    }
});
