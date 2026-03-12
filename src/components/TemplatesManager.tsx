import { useState } from "react";
import { useTemplates, Template } from "@/hooks/useTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, MessageSquare, Loader2, ShieldCheck } from "lucide-react";

export const TemplatesManager = () => {
    const { templates = [], addTemplate, deleteTemplate, updateTemplate, isLoading } = useTemplates();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
    const [trigger, setTrigger] = useState("");
    const [response, setResponse] = useState("");

    const handleOpenDialog = (template?: Template) => {
        if (template) {
            setCurrentTemplate(template);
            setTrigger(template.trigger);
            setResponse(template.response);
        } else {
            setCurrentTemplate(null);
            setTrigger("");
            setResponse("");
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!trigger.trim() || !response.trim()) return;

        if (currentTemplate) {
            await updateTemplate(currentTemplate.id, trigger, response);
        } else {
            await addTemplate(trigger, response);
        }
        setIsDialogOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="relative">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">جاري تحميل القواعد الذكية...</p>
            </div>
        );
    }

    const templateList = Array.isArray(templates) ? templates : [];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-foreground flex items-center gap-2">
                        <MessageSquare className="h-8 w-8 text-blue-500" />
                        النماذج والردود الآلية
                    </h2>
                    <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider pl-1 border-l-2 border-blue-500/30">
                        إدارة الكلمات المفتاحية والردود الذكية للمجيب الآلي
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => handleOpenDialog()}
                            className="gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(37,99,235,0.1)] hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] rounded-none h-10 px-6 font-bold transition-all hover:scale-105 text-xs uppercase tracking-wider group relative overflow-hidden"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                            <span className="relative z-10">+ رد آلي جديد</span>
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-xl rounded-none border border-blue-500/20 bg-background/95 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black flex items-center gap-2">
                                {currentTemplate ? (
                                    <>
                                        <Pencil className="h-5 w-5 text-blue-500" />
                                        تعديل الرد الآلي
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-5 w-5 text-blue-500" />
                                        إضافة رد آلي جديد
                                    </>
                                )}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Trigger */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-foreground/80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    الكلمة المفتاحية (Trigger)
                                </label>
                                <Input
                                    placeholder="مثال: السعر، الموعد، العنوان"
                                    className="h-12 rounded-none border-blue-500/20 bg-blue-500/5 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-bold"
                                    value={trigger}
                                    onChange={(e) => setTrigger(e.target.value)}
                                />
                                <p className="text-[10px] font-bold text-muted-foreground bg-blue-500/5 p-2 border-r-2 border-blue-500/20">
                                    عندما يرسل العميل هذه الكلمة، سيقوم البوت بالرد تلقائياً
                                </p>
                            </div>

                            {/* Response */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-foreground/80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    نص الرد الآلي (Response)
                                </label>
                                <Textarea
                                    placeholder="اكتب نص الرد هنا..."
                                    className="min-h-[150px] rounded-none border-blue-500/20 bg-blue-500/5 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all leading-relaxed font-medium"
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="ghost"
                                onClick={() => setIsDialogOpen(false)}
                                className="rounded-none font-bold"
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="rounded-none bg-blue-600 hover:bg-blue-700 font-bold px-8"
                            >
                                {currentTemplate ? "حفظ التعديلات" : "إضافة الرد"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Professional Divider */}
            <div className="w-full flex items-center justify-center gap-4 my-2 opacity-80">
                <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
            </div>

            {/* Content Table Card */}
            <Card className="border border-orange-500 bg-white shadow-sm overflow-hidden rounded-md relative group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10" />

                <CardHeader className="border-b border-slate-100 bg-slate-50 py-4 relative z-20">
                    <CardTitle className="flex items-center gap-3 text-sm font-black text-slate-900 uppercase tracking-wider">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        القواعد النشطة <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm shadow-sm border border-blue-100">{templateList.length}</span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0 relative z-20 bg-white">
                    {templateList.length === 0 ? (
                        <div className="text-center py-20 px-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-6 border border-dashed border-blue-200 shadow-sm">
                                <MessageSquare className="h-8 w-8 text-blue-400" />
                            </div>
                            <p className="text-slate-900 font-bold mb-1">لا توجد قواعد رد آلي حتى الآن</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-6">
                                ابدأ ببرمجة الكلمات المفتاحية لتسهيل الرد على العملاء
                            </p>
                            <Button
                                onClick={() => handleOpenDialog()}
                                variant="outline"
                                className="rounded-md gap-2 border-blue-200 hover:bg-blue-50 text-blue-600 font-bold shadow-sm"
                            >
                                <Plus className="h-4 w-4" />
                                أضف أول قاعدة
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow className="hover:bg-transparent border-slate-100">
                                        <TableHead className="text-right font-black text-[10px] uppercase text-slate-500 h-10 w-[200px]">
                                            الكلمة المفتاحية
                                        </TableHead>
                                        <TableHead className="text-right font-black text-[10px] uppercase text-slate-500 h-10">
                                            نص الرد
                                        </TableHead>
                                        <TableHead className="w-[100px] text-left font-black text-[10px] uppercase text-slate-500 h-10">
                                            إجراءات
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {templateList.map((template) => (
                                        <TableRow key={template.id} className="border-slate-100 hover:bg-slate-50 transition-colors group/row">
                                            <TableCell className="font-bold py-4 align-top">
                                                <span className="inline-flex px-3 py-1 rounded-md font-black text-[11px] text-blue-600 border border-blue-200 bg-blue-50 shadow-sm">
                                                    {template.trigger}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-700 max-w-xl py-4 align-top" dir="auto">
                                                <div className="text-xs leading-relaxed font-bold whitespace-pre-wrap pl-4 border-l-2 border-slate-100">
                                                    {template.response}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 align-top">
                                                <div className="flex items-center justify-end gap-1 opacity-50 group-hover/row:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenDialog(template)}
                                                        className="h-8 w-8 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteTemplate(template.id)}
                                                        className="h-8 w-8 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
