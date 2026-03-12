import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Clock, ExternalLink } from "lucide-react";

interface PostCardProps {
  groupName: string;
  content: string;
  timeAgo: string;
  comments: number;
  extractedContacts: number;
  platform: string;
}

export const PostCard = ({ groupName, content, timeAgo, comments, extractedContacts, platform }: PostCardProps) => {
  return (
    <Card className="relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group p-6 animate-slide-up">
      <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10"></div>
      <div className="flex items-start justify-between mb-4 relative z-20">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 font-bold bg-blue-50">
              {platform}
            </Badge>
            <span className="text-sm font-extrabold text-slate-900">{groupName}</span>
          </div>
          <p className="text-slate-700 font-medium line-clamp-2">{content}</p>
        </div>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4 text-sm font-bold text-slate-500 mb-4 relative z-20">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
          <Clock className="h-4 w-4 text-orange-500" />
          <span>{timeAgo}</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <span>{comments} تعليق</span>
        </div>
        {extractedContacts > 0 && (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-md">
            <Users className="h-4 w-4" />
            <span>{extractedContacts} جهة اتصال</span>
          </div>
        )}
      </div>

      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold relative z-20" size="sm">
        عرض التفاصيل واستخراج البيانات
      </Button>
    </Card>
  );
};
