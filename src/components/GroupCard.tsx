import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Eye, Settings } from "lucide-react";

interface GroupCardProps {
  name: string;
  platform: string;
  members: string;
  newPosts: number;
  status: "active" | "paused";
}

export const GroupCard = ({ name, platform, members, newPosts, status }: GroupCardProps) => {
  return (
    <Card className="relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group p-6">
      <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10"></div>
      <div className="flex items-start justify-between mb-4 relative z-20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-600 transition-colors border border-blue-100 group-hover:border-blue-600 shadow-sm flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">{name}</h3>
            <p className="text-sm font-bold text-slate-500">{platform}</p>
          </div>
        </div>
        <Badge variant={status === "active" ? "default" : "secondary"} className={
          status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-600"
        }>
          {status === "active" ? "نشط" : "متوقف"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 relative z-20">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-600">{members} عضو</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-sm font-bold text-green-600">{newPosts} منشور جديد</span>
        </div>
      </div>

      <div className="flex gap-2 relative z-20">
        <Button variant="default" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold" size="sm">
          <Eye className="h-4 w-4 ml-2" />
          عرض المنشورات
        </Button>
        <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 text-slate-600">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
