import React from 'react';
import { DASHBOARD_STATS, MONTHLY_SALES_DATA } from '../constants';
import { 
  TrendingUp, 
  Users, 
  Car, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui/UIComponents';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Yönetim Paneli</h1>
          <p className="text-slate-500 mt-1">Hoşgeldin Ferhat, işte güncel durumun.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline">Rapor Al</Button>
            <Button>Hızlı Satış Ekle</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Toplam Ciro" 
          value={`₺${(DASHBOARD_STATS.totalRevenue / 1000000).toFixed(1)}M`}
          change="+12.5%"
          trend="up"
          icon={Wallet}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <KPICard 
          title="Net Kar" 
          value={`₺${(DASHBOARD_STATS.netProfit / 1000000).toFixed(2)}M`}
          change="+8.2%"
          trend="up"
          icon={TrendingUp}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <KPICard 
          title="Aktif İlanlar" 
          value={DASHBOARD_STATS.activeListings.toString()}
          change="-2"
          trend="down"
          icon={Car}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />
        <KPICard 
          title="Toplam Müşteri" 
          value={DASHBOARD_STATS.totalCustomers.toString()}
          change="+5"
          trend="up"
          icon={Users}
          iconColor="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Aylık Satış Analizi</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal size={16}/></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_SALES_DATA}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₺${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} 
                    formatter={(value: number) => [`₺${value.toLocaleString()}`, 'Satış']}
                  />
                  <Area type="monotone" dataKey="satis" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Son Bildirimler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
               <NotificationItem 
                 color="bg-blue-500"
                 title="Yeni Araç Konsinyesi"
                 desc="İstoç Mega Motors, 2020 Passat paylaştı."
                 time="10 dk önce"
               />
               <NotificationItem 
                 color="bg-amber-500"
                 title="Sigorta Hatırlatması"
                 desc="Ahmet Yılmaz'ın kaskosu 3 gün içinde bitiyor."
                 time="2 saat önce"
                 actionLabel="Teklif Oluştur"
               />
               <NotificationItem 
                 color="bg-emerald-500"
                 title="WhatsApp Bot Satışı"
                 desc="Bot, 'Tramer' sorusuna otomatik yanıt verdi."
                 time="5 saat önce"
               />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, change, trend, icon: Icon, iconColor, bgColor }: any) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
          {change}
        </span>
        <span className="text-slate-400 ml-2 text-xs">geçen aya göre</span>
      </div>
    </CardContent>
  </Card>
);

const NotificationItem = ({ color, title, desc, time, actionLabel }: any) => (
  <div className="flex items-start gap-4">
    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${color}`}></div>
    <div className="flex-1">
        <div className="flex justify-between items-start">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{time}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
        {actionLabel && (
          <button className="mt-2 text-xs font-medium text-primary hover:text-primary/80 hover:underline">
            {actionLabel}
          </button>
        )}
    </div>
  </div>
);

export default Dashboard;