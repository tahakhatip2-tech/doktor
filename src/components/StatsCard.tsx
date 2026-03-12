import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: "up" | "down";
}

export const StatsCard = ({ title, value, change, icon: Icon, trend }: StatsCardProps) => {
  return (
    <Card className="relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group p-6 animate-scale-in">
      <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10"></div>
      <div className="relative z-20">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-600 transition-colors border border-blue-100 group-hover:border-blue-600 shadow-sm">
            <Icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <span className={`text-sm font-bold ${trend === "up" ? "text-green-600" : "text-red-500"}`}>
            {change}
          </span>
        </div>
        <h3 className="text-slate-500 font-bold mb-1">{title}</h3>
        <p className="text-3xl font-black text-slate-900 font-display">{value}</p>
      </div>
    </Card>
  );
};
