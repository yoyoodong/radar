import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import { format } from 'date-fns';
import { 
  Radar, 
  Filter, 
  Tag, 
  Clock, 
  User as UserIcon, 
  ChevronDown, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Lightbulb,
  Sparkles,
  DollarSign,
  Trophy,
  Search,
  ExternalLink,
  LayoutGrid,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  try {
    return twMerge(clsx(inputs));
  } catch (e) {
    console.error('cn error:', e);
    return inputs.join(' ');
  }
}

// --- Types ---
interface IntelligenceItem {
  id: string | number;
  platform: '小红书' | '抖音' | 'B站';
  content: string;
  author: string;
  created_at: string;
  status: string;
  sentiment: '正面' | '负面' | '中性';
  source_url?: string;
  keyword?: string;
}

const TAG_OPTIONS = [
  { label: '竞品痛点', icon: Filter, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { label: '新功能许愿', icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { label: '外观好评', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { label: '定价敏感', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { label: '核心褒奖', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
];

const PLATFORMS = ['全部', '小红书', '抖音', 'B站'];
const TAG_FILTERS = ['全部', '未标记', ...TAG_OPTIONS.map(t => t.label)];

// --- Mock Data Seeding (Aligned with SQL Schema) ---
const SEED_DATA = [
  { id: 1, platform: '小红书', author: 'AI画框迷', content: '最近入手的这款 AI 画框真的惊艳，能根据心情自动变换画作风格，就是偶尔生成的画有点抽象。', status: '核心褒奖', sentiment: '正面', keyword: 'AI画框', source_url: 'https://www.xiaohongshu.com/explore/1', created_at: new Date().toISOString() },
  { id: 2, platform: '抖音', author: '智能家居控', content: '智能日历如果能和手机日程实时同步就完美了，现在的同步速度有点慢，经常错过会议。', status: '竞品痛点', sentiment: '负面', keyword: '智能日历', source_url: 'https://www.douyin.com/video/1', created_at: new Date().toISOString() },
  { id: 3, platform: '小红书', author: '极简生活', content: '电子相册的边框如果能再窄一点就好了，现在的黑边看着有点厚重，不够精致。', status: '新功能许愿', sentiment: '中性', keyword: '电子相册', source_url: 'https://www.xiaohongshu.com/explore/2', created_at: new Date().toISOString() },
  { id: 4, platform: '抖音', author: '数码测评师', content: '这款电子画框的显示效果确实不错，色彩还原度很高，就是 3000 块的价格确实有点贵。', status: '定价敏感', sentiment: '中性', keyword: '电子画框', source_url: 'https://www.douyin.com/video/2', created_at: new Date().toISOString() },
  { id: 5, platform: '小红书', author: '艺术爱好者', content: '智能画框的木质外壳质感很好，放在客厅非常有格调，朋友来家里都问链接。', status: '外观好评', sentiment: '正面', keyword: '智能画框', source_url: 'https://www.xiaohongshu.com/explore/3', created_at: new Date().toISOString() },
  { id: 6, platform: '抖音', author: '路人甲', content: '有人用过这种智能日历吗？感觉挺新颖的，不知道实用性强不强。', status: '未标记', sentiment: '中性', keyword: '智能日历', source_url: 'https://www.douyin.com/video/3', created_at: new Date().toISOString() },
];

const SentimentSummary = ({ items }: { items: IntelligenceItem[] }) => {
  const data = useMemo(() => {
    const counts = {
      '正面': 0,
      '负面': 0,
      '中性': 0
    };
    items.forEach(item => {
      if (counts[item.sentiment] !== undefined) {
        counts[item.sentiment]++;
      }
    });
    return [
      { name: '正面', value: counts['正面'], color: '#10b981' },
      { name: '负面', value: counts['负面'], color: '#ef4444' },
      { name: '中性', value: counts['中性'], color: '#71717a' }
    ].filter(d => d.value > 0);
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8 shadow-sm"
      >
        <div className="w-full h-[200px] md:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-1/2 space-y-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <TrendingUp size={16} className="text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-widest">情感分布概览</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.map(d => (
              <div key={d.name} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-zinc-300 font-medium">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{d.value}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">条</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Components ---

const TagBadge = ({ label }: { label: string }) => {
  const option = TAG_OPTIONS.find(o => o.label === label);
  if (!option) return <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-wider">{label || '未标记'}</span>;
  
  const Icon = option.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium", option.bg, option.color, option.border)}>
      <Icon size={10} />
      {label}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-5 space-y-4 animate-pulse shadow-sm">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-zinc-800" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-zinc-800 rounded w-1/3" />
        <div className="h-2 bg-zinc-800 rounded w-1/4" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-zinc-800 rounded w-full" />
      <div className="h-3 bg-zinc-800 rounded w-5/6" />
      <div className="h-3 bg-zinc-800 rounded w-4/6" />
    </div>
    <div className="pt-4 border-t border-zinc-800/30 flex justify-end">
      <div className="h-8 w-24 bg-zinc-800 rounded-lg" />
    </div>
  </div>
);

const IntelligenceCard: React.FC<{ 
  item: IntelligenceItem; 
  onTagClick: (item: IntelligenceItem) => void;
  isExample?: boolean;
}> = ({ item, onTagClick, isExample }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  let dateStr = '未知时间';
  try {
    if (item.created_at) {
      dateStr = format(new Date(item.created_at), 'yyyy-MM-dd HH:mm');
    }
  } catch (e) {
    console.error('Date format error:', e);
  }

  const sentimentColor = 
    item.sentiment === '正面' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
    item.sentiment === '负面' ? 'text-red-500 bg-red-500/10 border-red-500/20' :
    'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-300 shadow-sm"
    >
      {/* Example Badge */}
      {isExample && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-blue-600/20 text-blue-400 text-[8px] font-bold px-2 py-0.5 rounded-bl-lg border-l border-b border-blue-600/30 uppercase tracking-tighter">
            示例数据
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold",
              item.platform === '小红书' ? "bg-red-500/10 text-red-500" : item.platform === '抖音' ? "bg-blue-500/10 text-blue-500" : "bg-zinc-500/10 text-zinc-500"
            )}>
              {item.platform[0]}
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                {item.author}
                <TagBadge label={item.status} />
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-bold", sentimentColor)}>
                  {item.sentiment}
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                <Clock size={10} />
                {dateStr}
                {item.keyword && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="text-blue-400">{item.keyword}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {item.source_url && (
            <a 
              href={item.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
              title="查看原文"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Content */}
        <div 
          className={cn(
            "text-sm text-zinc-400 leading-relaxed cursor-pointer transition-all",
            !isExpanded && "line-clamp-4"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {item.content}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-800/50 flex justify-end">
          <button 
            onClick={() => onTagClick(item)}
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Tag size={14} />
            打标签
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const TaggingModal = ({ item, onClose, onSave }: { item: IntelligenceItem, onClose: () => void, onSave: (tag: string) => void }) => {
  const [selectedTag, setSelectedTag] = useState(item.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await onSave(selectedTag);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Tag size={20} className="text-blue-500" />
              情报打标签
            </h3>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">情报摘要</div>
            <p className="text-sm text-zinc-400 line-clamp-3 italic">"{item.content}"</p>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">选择标签</div>
            <div className="grid grid-cols-1 gap-2">
              {TAG_OPTIONS.map((tag) => {
                const Icon = tag.icon;
                const isSelected = selectedTag === tag.label;
                return (
                  <button
                    key={tag.label}
                    onClick={() => setSelectedTag(tag.label)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all duration-200",
                      isSelected 
                        ? cn("bg-zinc-800 border-zinc-600", tag.color) 
                        : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span className="text-sm font-medium">{tag.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 size={16} />}
                  </button>
                );
              })}
              
              {/* Reset to Unmarked Option */}
              <button
                onClick={() => setSelectedTag('未标记')}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all duration-200 mt-2",
                  selectedTag === '未标记'
                    ? "bg-zinc-800 border-zinc-600 text-zinc-300" 
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <X size={18} />
                  <span className="text-sm font-medium">重置为未标记</span>
                </div>
                {selectedTag === '未标记' && <CheckCircle2 size={16} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isSubmitting ? '保存中...' : '确认标记'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-lg flex items-center gap-3 border",
        type === 'success' ? "bg-zinc-900 border-emerald-500/30 text-emerald-500" : "bg-zinc-900 border-red-500/30 text-red-500"
      )}
    >
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
};

export default function App() {
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Caught error:', event.error);
      setError(event.error?.message || 'Unknown error');
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8 text-center text-white">
        <div className="space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold">应用崩溃</h1>
          <p className="text-zinc-500">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-zinc-800 rounded-lg">刷新</button>
        </div>
      </div>
    );
  }

  const [items, setItems] = useState<IntelligenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('全部');
  const [tagFilter, setTagFilter] = useState('全部');
  const [taggingItem, setTaggingItem] = useState<IntelligenceItem | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const isConfigured = useMemo(() => {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    return url.length > 0 && key.length > 0 && !url.includes('placeholder');
  }, []);
  
  useEffect(() => {
    console.log('Supabase Config Check:', {
      url: !!import.meta.env.VITE_SUPABASE_URL,
      key: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      isConfigured
    });
  }, [isConfigured]);

  // Fetch Data from Supabase
  const fetchData = async (isInitial = false) => {
    if (!isConfigured) {
      // Simulate network delay for mock mode to show skeletons
      if (isInitial) {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setItems(SEED_DATA as any);
      setLoading(false);
      return;
    }

    if (isInitial) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crawler_intelligence')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setItems(data);
      } else if (isInitial) {
        setIsSeeding(true);
        await seedInitialData();
        setIsSeeding(false);
      }
      setHasFetched(true);
    } catch (error) {
      console.error('Fetch error:', error);
      // Only fallback to seed data if we are NOT configured
      if (!isConfigured && items.length === 0) {
        setItems(SEED_DATA as any);
      }
      setHasFetched(true);
    } finally {
      if (!isSeeding) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    
    if (isConfigured) {
      // Subscribe to real-time updates
      const channel = supabase
        .channel('crawler_intelligence_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'crawler_intelligence' }, () => {
          fetchData(false);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isConfigured]);

  const seedInitialData = async () => {
    if (!isConfigured) return; 
    try {
      const { error } = await supabase
        .from('crawler_intelligence')
        .insert(SEED_DATA);
      
      if (error) {
        console.warn('Seeding failed:', error.message);
        return;
      }
      fetchData(false);
    } catch (error) {
      console.error('Seed error:', error);
    }
  };

  const handleUpdateTag = async (tag: string) => {
    if (!taggingItem) return;
    
    if (!isConfigured) {
      // Local update for mock mode
      setItems(prev => prev.map(item => 
        item.id === taggingItem.id ? { ...item, status: tag } : item
      ));
      setTaggingItem(null);
      setToast({ message: '标签标记成功 (本地)', type: 'success' });
      return;
    }

    try {
      const { error } = await supabase
        .from('crawler_intelligence')
        .update({ status: tag })
        .eq('id', taggingItem.id);

      if (error) throw error;

      setTaggingItem(null);
      setToast({ message: '标签标记成功', type: 'success' });
    } catch (error) {
      console.error('Update error:', error);
      setToast({ message: '标记失败，请重试', type: 'error' });
    }
  };

  const [activeView, setActiveView] = useState<'radar' | 'dashboard'>('radar');
  const [dashboardFilter, setDashboardFilter] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const platformMatch = platformFilter === '全部' || item.platform === platformFilter;
      const tagMatch = tagFilter === '全部' || item.status === tagFilter;
      return platformMatch && tagMatch;
    });
  }, [items, platformFilter, tagFilter]);

  // Dashboard Stats
  const dashboardStats = useMemo(() => {
    const total = items.length;
    const validInsights = items.filter(i => i.status !== '未标记').length;
    const positiveCount = items.filter(i => i.sentiment === '正面').length;
    const healthRate = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
    
    return { total, validInsights, healthRate };
  }, [items]);

  const dashboardChartData = useMemo(() => {
    return TAG_OPTIONS.map(tag => ({
      name: tag.label,
      value: items.filter(i => i.status === tag.label).length,
      color: tag.color.replace('text-', '#').replace('500', '500') // Simplified color mapping
    })).filter(d => d.value > 0);
  }, [items]);

  const sentimentData = useMemo(() => {
    const total = items.length || 1;
    return [
      { name: '正面', value: items.filter(i => i.sentiment === '正面').length, color: '#10b981' },
      { name: '中性', value: items.filter(i => i.sentiment === '中性').length, color: '#71717a' },
      { name: '负面', value: items.filter(i => i.sentiment === '负面').length, color: '#ef4444' },
    ];
  }, [items]);

  const dashboardInsights = useMemo(() => {
    let base = items.filter(i => i.status !== '未标记');
    if (dashboardFilter) {
      base = base.filter(i => i.status === dashboardFilter);
    }
    return base.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  }, [items, dashboardFilter]);

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-blue-500/30">
      {/* Configuration Warning Banner */}
      {!isConfigured && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[10px] text-yellow-500 font-medium flex items-center gap-2">
              <AlertCircle size={12} />
              Supabase 未配置，当前正在使用离线模拟数据。请在 Secrets 面板中添加 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。
            </p>
            <div className="flex items-center gap-4 text-[10px]">
              <div className="flex gap-2">
                <span className="text-zinc-500">URL:</span>
                <span className={import.meta.env.VITE_SUPABASE_URL ? "text-emerald-500" : "text-red-500"}>
                  {import.meta.env.VITE_SUPABASE_URL ? `已检测 (${(import.meta.env.VITE_SUPABASE_URL as string).substring(0, 8)}...)` : "未检测"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-500">KEY:</span>
                <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? "text-emerald-500" : "text-red-500"}>
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? `已检测 (${(import.meta.env.VITE_SUPABASE_ANON_KEY as string).substring(0, 4)}...)` : "未检测"}
                </span>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-2 py-0.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded border border-yellow-500/30 transition-colors"
              >
                刷新检测
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header / Control Bar */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Radar className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">MagicFrame 产品洞察站</h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">VOC Analysis Center • Supabase Powered</p>
              </div>
            </div>

            {/* View Switcher - Enhanced Visibility */}
            <nav className="flex shrink-0 items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800 ml-2 sm:ml-4">
              <button 
                onClick={() => setActiveView('radar')}
                className={cn(
                  "px-3 sm:px-4 py-1.5 rounded-md text-[11px] sm:text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
                  activeView === 'radar' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <LayoutGrid size={14} />
                收集
              </button>
              <button 
                onClick={() => setActiveView('dashboard')}
                className={cn(
                  "px-3 sm:px-4 py-1.5 rounded-md text-[11px] sm:text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap relative",
                  activeView === 'dashboard' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <BarChart3 size={14} />
                洞察
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              </button>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {activeView === 'radar' ? (
              <>
                <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-1">
                  {PLATFORMS.map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatformFilter(p)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                        platformFilter === p ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <select 
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="appearance-none bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 pr-10 text-xs font-medium text-zinc-300 focus:outline-none focus:border-zinc-600 cursor-pointer transition-all"
                  >
                    {TAG_FILTERS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
                </div>
              </>
            ) : (
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} />
                实时数据看板
              </div>
            )}

            <div className="h-8 w-px bg-zinc-800" />

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs font-bold text-white">{activeView === 'radar' ? filteredItems.length : items.length}</div>
                <div className="text-[10px] text-zinc-500 uppercase">情报总数</div>
              </div>
              <button 
                onClick={() => fetchData()}
                className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center hover:bg-zinc-900 transition-colors text-zinc-500 hover:text-white"
                title="刷新数据"
              >
                <Clock size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'radar' ? (
          <>
            {/* Sentiment Summary */}
            <SentimentSummary items={(items.length > 0 || !hasFetched) ? items : (SEED_DATA as any)} />

            <div className="space-y-8">
              {(!hasFetched || loading || isSeeding) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                      <IntelligenceCard 
                        key={item.id} 
                        item={item} 
                        onTagClick={setTaggingItem}
                        isExample={!isConfigured}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Empty State Info */}
                  <div className="flex flex-col items-center justify-center text-center py-12 space-y-4 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl shadow-sm">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700">
                      <Search size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-white">当前收集暂未扫到相关情报</h3>
                      <p className="text-sm text-zinc-500 max-w-xs mx-auto">尝试调整筛选条件，或查看下方的排版示例预览交互效果。</p>
                    </div>
                  </div>

                  {/* Layout Preview / Example Data - Only show if NOT configured */}
                  {!isConfigured && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-zinc-800" />
                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Sparkles size={12} />
                          排版示例预览
                        </div>
                        <div className="h-px flex-1 bg-zinc-800" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
                        {SEED_DATA.slice(0, 3).map((item, idx) => (
                          <IntelligenceCard 
                            key={`example-${idx}`} 
                            item={{ ...item, id: `example-${idx}`, created_at: new Date().toISOString() } as any} 
                            onTagClick={setTaggingItem}
                            isExample={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-8">
            {(!hasFetched || loading || isSeeding) ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-zinc-900/50 border border-zinc-800 rounded-2xl animate-pulse" />
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 h-[600px] bg-zinc-900/50 border border-zinc-800 rounded-2xl animate-pulse" />
                  <div className="h-[600px] bg-zinc-900/50 border border-zinc-800 rounded-2xl animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                {/* Module A: KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl shadow-sm"
              >
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">情报总数</div>
                <div className="text-4xl font-black text-white">{dashboardStats.total}</div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  实时同步中
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl shadow-sm"
              >
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">有效洞察数</div>
                <div className="text-4xl font-black text-emerald-500">{dashboardStats.validInsights}</div>
                <div className="mt-2 text-[10px] text-zinc-500">
                  已标记占比 {dashboardStats.total > 0 ? Math.round((dashboardStats.validInsights / dashboardStats.total) * 100) : 0}%
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl shadow-sm"
              >
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">情绪健康度</div>
                <div className="text-4xl font-black text-blue-500">{dashboardStats.healthRate}%</div>
                <div className="mt-2 text-[10px] text-zinc-500">正面情绪占比</div>
              </motion.div>
            </div>

            {/* Module B & C: Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Charts Area */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <PieChartIcon size={16} className="text-blue-500" />
                      业务洞察分布
                    </h3>
                    {dashboardFilter && (
                      <button 
                        onClick={() => setDashboardFilter(null)}
                        className="text-[10px] text-blue-500 hover:underline"
                      >
                        清除过滤
                      </button>
                    )}
                  </div>
                  
                  {dashboardChartData.length > 0 ? (
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="w-full h-[300px] md:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={dashboardChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              onClick={(data) => setDashboardFilter(data.name)}
                              className="cursor-pointer"
                            >
                              {dashboardChartData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.color} 
                                  stroke={dashboardFilter === entry.name ? '#fff' : 'none'}
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                              itemStyle={{ color: '#e4e4e7' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full md:w-1/2 space-y-3">
                        {dashboardChartData.map(d => (
                          <button 
                            key={d.name}
                            onClick={() => setDashboardFilter(d.name)}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                              dashboardFilter === d.name ? "bg-zinc-800 border-zinc-600" : "bg-black/20 border-zinc-800/50 hover:border-zinc-700"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                              <span className="text-xs font-medium text-zinc-300">{d.name}</span>
                            </div>
                            <span className="text-xs font-bold text-white">{d.value}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-zinc-600 space-y-2">
                      <AlertCircle size={32} />
                      <p className="text-xs">暂未积累足够的标签数据，请先前往收集页进行标记</p>
                    </div>
                  )}
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-6">
                    <TrendingUp size={16} className="text-blue-500" />
                    全网情绪洞察
                  </h3>
                  <div className="space-y-6">
                    {sentimentData.map(s => (
                      <div key={s.name} className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                          <span className="text-zinc-500">{s.name}</span>
                          <span className="text-zinc-300">{s.value} 条 ({items.length > 0 ? Math.round((s.value / items.length) * 100) : 0}%)</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${items.length > 0 ? (s.value / items.length) * 100 : 0}%` }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Actionable Insights Panel */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-yellow-500" />
                    原声穿透面板
                  </h3>
                  {dashboardFilter && (
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] rounded-full border border-blue-500/20">
                      {dashboardFilter}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[800px]">
                  {dashboardInsights.length > 0 ? (
                    dashboardInsights.map((item) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-black/40 border border-zinc-800 rounded-xl p-4 space-y-3 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <TagBadge label={item.status} />
                          <span className="text-[10px] text-zinc-500">{item.platform}</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                          {item.content}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-zinc-500">
                          <span>{item.author}</span>
                          <span>{format(new Date(item.created_at), 'MM-dd HH:mm')}</span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 py-20 space-y-2">
                      <Search size={32} />
                      <p className="text-xs">暂无相关用户原声</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )}
  </main>

      {/* Modals & Toasts */}
      <AnimatePresence>
        {taggingItem && (
          <TaggingModal 
            item={taggingItem} 
            onClose={() => setTaggingItem(null)} 
            onSave={handleUpdateTag} 
          />
        )}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
