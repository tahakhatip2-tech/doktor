import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteClinics() {
    const clinicsToDelete = [
        { id: 6, name: 'EMAD MEDIC' },
        { id: 7, name: 'الدكتور معاد' },
        { id: 2, name: 'د. عماد' },
        { id: 9, name: 'عيادة غزة' },
        { id: 18, name: 'Zeyad' }
    ];

    console.log('🗑️  بدء عملية حذف العيادات...\n');

    for (const clinic of clinicsToDelete) {
        try {
            console.log(`\n🔄 حذف العيادة: ${clinic.name} (ID: ${clinic.id})`);

            // حذف جميع البيانات المرتبطة
            await prisma.$transaction(async (tx) => {
                // 1. حذف الإشعارات
                const notifications = await tx.notification.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${notifications.count} إشعار`);

                // 2. حذف السجلات الطبية
                const medicalRecords = await tx.medicalRecord.deleteMany({
                    where: { 
                        appointment: {
                            userId: clinic.id
                        }
                    }
                });
                console.log(`   ✓ حذف ${medicalRecords.count} سجل طبي`);

                // 3. حذف الوصفات الطبية
                const prescriptions = await tx.prescription.deleteMany({
                    where: { 
                        OR: [
                            { doctorId: clinic.id },
                            { pharmacyId: clinic.id }
                        ]
                    }
                });
                console.log(`   ✓ حذف ${prescriptions.count} وصفة طبية`);

                // 4. حذف المواعيد
                const appointments = await tx.appointment.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${appointments.count} موعد`);

                // 5. حذف الأطباء التابعين
                const doctors = await tx.clinicDoctor.deleteMany({
                    where: { clinicId: clinic.id }
                });
                console.log(`   ✓ حذف ${doctors.count} طبيب`);

                // 6. حذف التقييمات
                const reviews = await tx.clinicReview.deleteMany({
                    where: { clinicId: clinic.id }
                });
                console.log(`   ✓ حذف ${reviews.count} تقييم`);

                // 7. حذف العروض والإعجابات والتعليقات
                const offers = await tx.offer.findMany({
                    where: { userId: clinic.id },
                    select: { id: true }
                });
                
                for (const offer of offers) {
                    await tx.offerComment.deleteMany({
                        where: { offerId: offer.id }
                    });
                    await tx.offerLike.deleteMany({
                        where: { offerId: offer.id }
                    });
                }
                
                const deletedOffers = await tx.offer.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${deletedOffers.count} عرض`);

                // 8. حذف الإعجابات والتعليقات للعيادة
                const offerLikes = await tx.offerLike.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${offerLikes.count} إعجاب`);

                const offerComments = await tx.offerComment.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${offerComments.count} تعليق`);

                // 9. حذف المحادثات الداخلية
                const conversations = await tx.internalConversation.deleteMany({
                    where: { clinicId: clinic.id }
                });
                console.log(`   ✓ حذف ${conversations.count} محادثة داخلية`);

                // 10. حذف محادثات واتساب والرسائل
                const chats = await tx.whatsAppChat.findMany({
                    where: { userId: clinic.id },
                    select: { id: true }
                });
                
                for (const chat of chats) {
                    await tx.whatsAppMessage.deleteMany({
                        where: { chatId: chat.id }
                    });
                }
                
                const deletedChats = await tx.whatsAppChat.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${deletedChats.count} محادثة واتساب`);

                // 11. حذف قوالب الرد التلقائي
                const templates = await tx.autoReplyTemplate.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${templates.count} قالب رد تلقائي`);

                // 12. حذف الحملات
                const campaigns = await tx.campaign.findMany({
                    where: { userId: clinic.id },
                    select: { id: true }
                });
                
                for (const campaign of campaigns) {
                    await tx.campaignRecipient.deleteMany({
                        where: { campaignId: campaign.id }
                    });
                }
                
                const deletedCampaigns = await tx.campaign.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${deletedCampaigns.count} حملة`);

                // 13. حذف الخدمات
                const services = await tx.service.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${services.count} خدمة`);

                // 14. حذف جهات الاتصال
                const contacts = await tx.contact.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${contacts.count} جهة اتصال`);

                // 15. حذف المجموعات والمنشورات
                const groups = await tx.group.findMany({
                    where: { userId: clinic.id },
                    select: { id: true }
                });
                
                for (const group of groups) {
                    await tx.post.deleteMany({
                        where: { groupId: group.id }
                    });
                }
                
                const deletedGroups = await tx.group.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${deletedGroups.count} مجموعة`);

                // 16. حذف خطوط الأنابيب والمراحل
                const pipelines = await tx.pipeline.findMany({
                    where: { userId: clinic.id },
                    select: { id: true }
                });
                
                for (const pipeline of pipelines) {
                    await tx.stage.deleteMany({
                        where: { pipelineId: pipeline.id }
                    });
                }
                
                const deletedPipelines = await tx.pipeline.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${deletedPipelines.count} خط أنابيب`);

                // 17. حذف علامات العملاء
                const tags = await tx.customerTag.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${tags.count} علامة`);

                // 18. حذف المدفوعات
                const payments = await tx.payment.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${payments.count} دفعة`);

                // 19. حذف الإعدادات
                const settings = await tx.setting.deleteMany({
                    where: { userId: clinic.id }
                });
                console.log(`   ✓ حذف ${settings.count} إعداد`);

                // 20. أخيراً، حذف المستخدم (العيادة)
                await tx.user.delete({
                    where: { id: clinic.id }
                });
                console.log(`   ✅ تم حذف العيادة بنجاح`);
            });

        } catch (error) {
            console.error(`   ❌ خطأ في حذف العيادة ${clinic.name}:`, error.message);
        }
    }

    console.log('\n✅ اكتملت عملية الحذف!\n');
}

deleteClinics()
    .catch((e) => {
        console.error('❌ خطأ عام:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
