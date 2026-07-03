import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteEMADMEDIC() {
    const clinic = { id: 6, name: 'EMAD MEDIC' };

    try {
        console.log(`\n🔄 حذف العيادة: ${clinic.name} (ID: ${clinic.id})\n`);

        // حذف البيانات خطوة بخطوة بدون transaction لتجنب timeout
        
        // 1. حذف الإشعارات
        const notifications = await prisma.notification.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${notifications.count} إشعار`);

        // 2. حذف السجلات الطبية
        const medicalRecords = await prisma.medicalRecord.deleteMany({
            where: { 
                appointment: {
                    userId: clinic.id
                }
            }
        });
        console.log(`✓ حذف ${medicalRecords.count} سجل طبي`);

        // 3. حذف الوصفات الطبية
        const prescriptions = await prisma.prescription.deleteMany({
            where: { 
                OR: [
                    { doctorId: clinic.id },
                    { pharmacyId: clinic.id }
                ]
            }
        });
        console.log(`✓ حذف ${prescriptions.count} وصفة طبية`);

        // 4. حذف المواعيد
        const appointments = await prisma.appointment.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${appointments.count} موعد`);

        // 5. حذف الأطباء التابعين
        const doctors = await prisma.clinicDoctor.deleteMany({
            where: { clinicId: clinic.id }
        });
        console.log(`✓ حذف ${doctors.count} طبيب`);

        // 6. حذف التقييمات
        const reviews = await prisma.clinicReview.deleteMany({
            where: { clinicId: clinic.id }
        });
        console.log(`✓ حذف ${reviews.count} تقييم`);

        // 7. حذف العروض والإعجابات والتعليقات
        const offers = await prisma.offer.findMany({
            where: { userId: clinic.id },
            select: { id: true }
        });
        
        for (const offer of offers) {
            await prisma.offerComment.deleteMany({
                where: { offerId: offer.id }
            });
            await prisma.offerLike.deleteMany({
                where: { offerId: offer.id }
            });
        }
        
        const deletedOffers = await prisma.offer.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${deletedOffers.count} عرض`);

        // 8. حذف الإعجابات والتعليقات
        const offerLikes = await prisma.offerLike.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${offerLikes.count} إعجاب`);

        const offerComments = await prisma.offerComment.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${offerComments.count} تعليق`);

        // 9. حذف المحادثات الداخلية
        const conversations = await prisma.internalConversation.deleteMany({
            where: { clinicId: clinic.id }
        });
        console.log(`✓ حذف ${conversations.count} محادثة داخلية`);

        // 10. حذف رسائل واتساب أولاً
        const chats = await prisma.whatsAppChat.findMany({
            where: { userId: clinic.id },
            select: { id: true }
        });
        
        let totalMessages = 0;
        for (const chat of chats) {
            const messages = await prisma.whatsAppMessage.deleteMany({
                where: { chatId: chat.id }
            });
            totalMessages += messages.count;
        }
        console.log(`✓ حذف ${totalMessages} رسالة واتساب`);
        
        // ثم حذف المحادثات
        const deletedChats = await prisma.whatsAppChat.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${deletedChats.count} محادثة واتساب`);

        // 11. حذف سجلات واتساب
        const logs = await prisma.whatsAppLog.deleteMany({
            where: { 
                template: {
                    userId: clinic.id
                }
            }
        });
        console.log(`✓ حذف ${logs.count} سجل واتساب`);

        // 12. حذف قوالب الرد التلقائي
        const templates = await prisma.autoReplyTemplate.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${templates.count} قالب رد تلقائي`);

        // 13. حذف مستلمي الحملات أولاً
        const campaigns = await prisma.campaign.findMany({
            where: { userId: clinic.id },
            select: { id: true }
        });
        
        let totalRecipients = 0;
        for (const campaign of campaigns) {
            const recipients = await prisma.campaignRecipient.deleteMany({
                where: { campaignId: campaign.id }
            });
            totalRecipients += recipients.count;
        }
        console.log(`✓ حذف ${totalRecipients} مستلم حملة`);
        
        // ثم حذف الحملات
        const deletedCampaigns = await prisma.campaign.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${deletedCampaigns.count} حملة`);

        // 14. حذف الخدمات
        const services = await prisma.service.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${services.count} خدمة`);

        // 15. حذف جهات الاتصال
        const contacts = await prisma.contact.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${contacts.count} جهة اتصال`);

        // 16. حذف المنشورات أولاً
        const groups = await prisma.group.findMany({
            where: { userId: clinic.id },
            select: { id: true }
        });
        
        let totalPosts = 0;
        for (const group of groups) {
            const posts = await prisma.post.deleteMany({
                where: { groupId: group.id }
            });
            totalPosts += posts.count;
        }
        console.log(`✓ حذف ${totalPosts} منشور`);
        
        // ثم حذف المجموعات
        const deletedGroups = await prisma.group.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${deletedGroups.count} مجموعة`);

        // 17. حذف المراحل أولاً
        const pipelines = await prisma.pipeline.findMany({
            where: { userId: clinic.id },
            select: { id: true }
        });
        
        let totalStages = 0;
        for (const pipeline of pipelines) {
            const stages = await prisma.stage.deleteMany({
                where: { pipelineId: pipeline.id }
            });
            totalStages += stages.count;
        }
        console.log(`✓ حذف ${totalStages} مرحلة`);
        
        // ثم حذف خطوط الأنابيب
        const deletedPipelines = await prisma.pipeline.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${deletedPipelines.count} خط أنابيب`);

        // 18. حذف علامات العملاء
        const tags = await prisma.customerTag.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${tags.count} علامة`);

        // 19. حذف المدفوعات
        const payments = await prisma.payment.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${payments.count} دفعة`);

        // 20. حذف الإعدادات
        const settings = await prisma.setting.deleteMany({
            where: { userId: clinic.id }
        });
        console.log(`✓ حذف ${settings.count} إعداد`);

        // 21. أخيراً، حذف المستخدم (العيادة)
        await prisma.user.delete({
            where: { id: clinic.id }
        });
        console.log(`\n✅ تم حذف العيادة ${clinic.name} بنجاح!\n`);

    } catch (error) {
        console.error(`\n❌ خطأ في حذف العيادة:`, error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteEMADMEDIC();
