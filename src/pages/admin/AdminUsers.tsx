import { useState, useEffect } from "react";
import { dataApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    UserX,
    UserCheck,
    Trash2,
    Eye,
    Calendar,
    Mail,
    Phone,
    Building,
    MoreVertical,
    Filter,
    Download,
    RefreshCw
} from "lucide-react";
import { toastWithSound } from "@/lib/toast-with-sound";
import { motion } from "framer-motion";

const AdminUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [subscriptionFilter, setSubscriptionFilter] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [search, roleFilter, statusFilter, subscriptionFilter, currentPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (roleFilter) params.append('role', roleFilter);
            if (statusFilter) params.append('status', statusFilter);
            if (subscriptionFilter) params.append('subscriptionStatus', subscriptionFilter);
            params.append('page', currentPage.toString());
            params.append('limit', '20');

            const data = await dataApi.get(`/admin/users?${params.toString()}`);
            setUsers(data.users);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching users:', error);
            toastWithSound.error('فشل في جلب المستخدمين');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (userId: number, newStatus: string) => {
        try {
            const endpoint = newStatus === 'active' 
                ? `/admin/users/${userId}/activate`
                : `/admin/users/${userId}/suspend`;
            
            await dataApi.patch(endpoint);
            toastWithSound.success('تم تحديث حالة المستخدم');
            fetchUsers();
        } catch (error) {
            toastWithSound.error('فشل في تحديث الحالة');
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع بياناته!')) {
            return;
        }

        try {
            await dataApi.delete(`/admin/users/${userId}`);
            toastWithSound.success('تم حذف المستخدم');
            fetchUsers();
        } catch (error) {
            toastWithSound.error('فشل في حذف المستخدم');
        }
    };

    const handleExtendTrial = async (userId: number) => {
        try {
            await dataApi.patch(`/admin/users/${userId}/extend-trial`, { days: 30 });
            toastWithSound.success('تم تمديد الفترة التجريبية 30 يوم');
            fetchUsers();
        } catch (error) {
            toastWithSound.error('فشل في تمديد الفترة التجريبية');
        }
    };

    const viewUserDetails = async (userId: number) => {
        try {
            const data = await dataApi.get(`/admin/users/${userId}`);
            setSelectedUser(data);
            setShowDetailsDialog(true);
        } catch (error) {
            toastWithSound.error('فشل في جلب تفاصيل المستخدم');
        }
    };

    const exportUsers = () => {
        const csv = [
            ['الرقم', 'البريد', 'الاسم', 'العيادة', 'الهاتف', 'الدور', 'الحالة', 'الاشتراك', 'تاريخ الانتهاء'].join(','),
            ...users.map(u => [
                u.id,
                u.email,
                u.name || '',
                u.clinic_name || '',
                u.phone || '',
                u.role,
                u.status,
                u.subscriptionStatus,
                u.expiryDate ? new Date(u.expiryDate).toLocaleDateString('ar-JO') : ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const getRoleBadge = (role: string) => {
        const colors: any = {
            ADMIN: 'bg-red-100 text-red-700 border-red-200',
            USER: 'bg-blue-100 text-blue-700 border-blue-200',
            PHARMACY: 'bg-green-100 text-green-700 border-green-200',
            AGENT: 'bg-purple-100 text-purple-700 border-purple-200'
        };
        return colors[role] || 'bg-gray-100 text-gray-700';
    };

    const getStatusBadge = (status: string) => {
        return status === 'active'
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-red-100 text-red-700 border-red-200';
    };

    const getSubscriptionBadge = (status: string) => {
        const colors: any = {
            FREE: 'bg-gray-100 text-gray-700 border-gray-200',
            TRIAL: 'bg-orange-100 text-orange-700 border-orange-200',
            ACTIVE: 'bg-green-100 text-green-700 border-green-200',
            PAST_DUE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            CANCELED: 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card className="p-6 border-orange-100 shadow-md">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="بحث بالبريد، الاسم، الهاتف..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pr-10"
                        />
                    </div>

                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="جميع الأدوار" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">جميع الأدوار</SelectItem>
                            <SelectItem value="USER">طبيب</SelectItem>
                            <SelectItem value="PHARMACY">صيدلية</SelectItem>
                            <SelectItem value="ADMIN">مدير</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="جميع الحالات" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">جميع الحالات</SelectItem>
                            <SelectItem value="active">نشط</SelectItem>
                            <SelectItem value="banned">محظور</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="جميع الاشتراكات" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">جميع الاشتراكات</SelectItem>
                            <SelectItem value="FREE">مجاني</SelectItem>
                            <SelectItem value="TRIAL">تجريبي</SelectItem>
                            <SelectItem value="ACTIVE">نشط</SelectItem>
                            <SelectItem value="CANCELED">ملغي</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={fetchUsers}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={exportUsers}>
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Users Table */}
            <Card className="border-orange-100 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-right py-4 px-4 font-bold text-slate-700">المستخدم</th>
                                <th className="text-right py-4 px-4 font-bold text-slate-700">الدور</th>
                                <th className="text-right py-4 px-4 font-bold text-slate-700">الحالة</th>
                                <th className="text-right py-4 px-4 font-bold text-slate-700">الاشتراك</th>
                                <th className="text-right py-4 px-4 font-bold text-slate-700">الانتهاء</th>
                                <th className="text-right py-4 px-4 font-bold text-slate-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12">
                                        <div className="flex justify-center">
                                            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-500">
                                        لا يوجد مستخدمين
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{user.clinic_name || user.name || 'غير محدد'}</span>
                                                <span className="text-sm text-slate-500">{user.email}</span>
                                                {user.phone && (
                                                    <span className="text-xs text-slate-400">{user.phone}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge className={getRoleBadge(user.role)}>
                                                {user.role === 'USER' ? 'طبيب' : 
                                                 user.role === 'PHARMACY' ? 'صيدلية' : 
                                                 user.role === 'ADMIN' ? 'مدير' : user.role}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge className={getStatusBadge(user.status)}>
                                                {user.status === 'active' ? 'نشط' : 'محظور'}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge className={getSubscriptionBadge(user.subscriptionStatus)}>
                                                {user.subscriptionStatus === 'TRIAL' ? 'تجريبي' :
                                                 user.subscriptionStatus === 'ACTIVE' ? 'نشط' :
                                                 user.subscriptionStatus === 'CANCELED' ? 'ملغي' : 'مجاني'}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-slate-600">
                                            {user.expiryDate 
                                                ? new Date(user.expiryDate).toLocaleDateString('ar-JO')
                                                : '-'
                                            }
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => viewUserDetails(user.id)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleExtendTrial(user.id)}
                                                >
                                                    <Calendar className="h-4 w-4" />
                                                </Button>
                                                {user.status === 'active' ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleStatusChange(user.id, 'banned')}
                                                    >
                                                        <UserX className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleStatusChange(user.id, 'active')}
                                                    >
                                                        <UserCheck className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-200">
                        <Button
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            السابق
                        </Button>
                        <span className="text-sm text-slate-600">
                            صفحة {currentPage} من {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            التالي
                        </Button>
                    </div>
                )}
            </Card>

            {/* User Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>تفاصيل المستخدم</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
                                    <p className="text-slate-900">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700">الهاتف</label>
                                    <p className="text-slate-900">{selectedUser.phone || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700">اسم العيادة</label>
                                    <p className="text-slate-900">{selectedUser.clinic_name || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700">التخصص</label>
                                    <p className="text-slate-900">{selectedUser.clinic_specialty || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-blue-600">{selectedUser._count?.appointments || 0}</p>
                                    <p className="text-sm text-slate-600">مواعيد</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-green-600">{selectedUser._count?.contacts || 0}</p>
                                    <p className="text-sm text-slate-600">مرضى</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-orange-600">{selectedUser._count?.payments || 0}</p>
                                    <p className="text-sm text-slate-600">مدفوعات</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminUsers;
