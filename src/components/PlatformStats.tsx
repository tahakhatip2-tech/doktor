import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContacts } from "@/hooks/useContacts";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Send,
  MessageCircle,
  Camera,
  Globe
} from "lucide-react";

const platformConfig: Record<string, { icon: any; name: string; color: string; bg: string }> = {
  facebook: { icon: Facebook, name: 'فيسبظˆظƒ', color: 'text-blue-600', bg: 'bg-blue-600/10' },
  instagram: { icon: Instagram, name: 'انسطھط؛رام', color: 'text-pink-600', bg: 'bg-pink-600/10' },
  twitter: { icon: Twitter, name: 'طھظˆظٹطھر', color: 'text-sky-500', bg: 'bg-sky-500/10' },
  linkedin: { icon: Linkedin, name: 'لظٹنظƒد إن', color: 'text-blue-700', bg: 'bg-blue-700/10' },
  tiktok: { icon: Camera, name: 'طھظٹظƒ طھظˆظƒ', color: 'text-foreground', bg: 'bg-foreground/10' },
  youtube: { icon: Youtube, name: 'ظٹظˆطھظٹظˆب', color: 'text-red-600', bg: 'bg-red-600/10' },
  telegram: { icon: Send, name: 'طھظٹلظٹجرام', color: 'text-sky-500', bg: 'bg-sky-500/10' },
  whatsapp: { icon: MessageCircle, name: 'ظˆاطھساب', color: 'text-primary', bg: 'bg-primary/10' },
};

const PlatformStats = () => {
  const { contacts } = useContacts();

  // Count contacts by platform
  const platformCounts = contacts.reduce((acc, contact) => {
    const platform = contact.platform || 'other';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedPlatforms = Object.entries(platformCounts)
    .sort(([, a], [, b]) => (b as any) - (a as any));

  if (sortedPlatforms.length === 0) {
    return null;
  }

  return (
    <Card className="relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10"></div>
      <CardHeader className="relative z-20">
        <CardTitle className="text-lg font-black text-slate-900">إحصائيات المنصات</CardTitle>
      </CardHeader>
      <CardContent className="relative z-20">
        <div className="space-y-4">
          {sortedPlatforms.map(([platform, count]) => {
            const config = platformConfig[platform] || {
              icon: Globe,
              name: platform,
              color: 'text-slate-500',
              bg: 'bg-slate-100',
            };
            const Icon = config.icon;
            const percentage = Math.round(((count as any) / contacts.length) * 100);

            return (
              <div key={platform} className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.bg} shadow-sm border border-slate-100`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-slate-700">{config.name}</span>
                    <span className="text-sm font-black text-slate-900">{(count as any)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full ${config.bg.replace('/10', '')}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformStats;
