import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toastWithSound } from '@/lib/toast-with-sound';
import { Loader2 } from "lucide-react";

interface DealDialogProps {
    contact: any | null;
    open: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export function DealDialog({ contact, open, onClose, onUpdate }: DealDialogProps) {
    const [loading, setLoading] = useState(false);
    const [dealValue, setDealValue] = useState(contact?.deal_value || 0);
    const [priority, setPriority] = useState(contact?.priority || 'medium');
    const [probability, setProbability] = useState(contact?.probability || 0);

    const handleSave = async () => {
        if (!contact) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/api/crm/contacts/${contact.id}/deal`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    deal_value: dealValue,
                    priority,
                    probability
                })
            });

            if (res.ok) {
                toastWithSound.success('طھم طھحدظٹث طھظپاصظٹل الصظپقة');
                onUpdate();
                onClose();
            }
        } catch (error) {
            toastWithSound.error('ظپشل الطھحدظٹث');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent dir="rtl">
                <DialogHeader>
                    <DialogTitle>طھظپاصظٹل الصظپقة - {contact?.name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">قظٹمة الصظپقة</Label>
                        <Input
                            type="number"
                            value={dealValue}
                            onChange={(e) => setDealValue(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">الأظˆلظˆظٹة</Label>
                        <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">منخظپضة ًںں¢</SelectItem>
                                <SelectItem value="medium">مطھظˆسطة ًںں،</SelectItem>
                                <SelectItem value="high">عالظٹة ًں”´</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">الاحطھمالظٹة %</Label>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={probability}
                            onChange={(e) => setProbability(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        حظپظ
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
