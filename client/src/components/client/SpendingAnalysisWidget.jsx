import { FaChartLine, FaExclamationTriangle, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SpendingAnalysisWidget = ({ analysis }) => {
    if (!analysis || !analysis.spendingTrend?.length) return null;

    const { spendingTrend, anomalies, categories, summary } = analysis;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* 1. Summary Alert */}
            <div className="bg-white border-l-4 border-yellow-500 rounded-r-xl p-4 shadow-sm flex items-start gap-3">
                <FaExclamationTriangle className="text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-neutral-900">AI Insight Detected</h3>
                    <p className="text-sm text-neutral-600">{summary || "Unusual spending patterns detected in this statement."}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 2. Spending Trend Chart */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-card">
                    <h3 className="text-sm font-bold text-neutral-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <FaChartLine className="text-primary-500" /> Spending Trend
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={spendingTrend}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(val) => [`₹${val.toLocaleString()}`, 'Amount']}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Anomalies List */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-card">
                    <h3 className="text-sm font-bold text-neutral-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <FaExclamationTriangle className="text-danger-500" /> Detected Anomalies
                    </h3>
                    <div className="space-y-3">
                        {anomalies.map((anomaly, idx) => (
                            <div key={idx} className="flex gap-3 p-3 bg-danger-50 rounded-xl border border-danger-100">
                                <div className="mt-1">
                                    <div className="w-2 h-2 rounded-full bg-danger-500 animate-pulse" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-danger-900 text-sm">{anomaly.description}</h4>
                                        <span className="font-mono text-xs font-bold text-danger-700">₹{anomaly.amount.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-danger-600 mt-1">{anomaly.date} • {anomaly.severity?.toUpperCase()} SEVERITY</p>
                                </div>
                            </div>
                        ))}
                        {anomalies.length === 0 && (
                            <div className="text-center py-8 text-neutral-400 text-sm">No anomalies detected.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Categorization & GST Impact */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-card">
                <h3 className="text-sm font-bold text-neutral-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <FaMoneyBillWave className="text-success-500" /> GST Input Credit Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 border border-neutral-100 rounded-xl hover:shadow-md transition">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: cat.color }}>
                                {cat.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <span className="font-bold text-neutral-800">{cat.name}</span>
                                    <span className="font-mono text-neutral-600">₹{cat.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${cat.gstInput.includes('Eligible') ? 'bg-success-100 text-success-700' :
                                            cat.gstInput.includes('Ineligible') ? 'bg-danger-100 text-danger-700' : 'bg-warning-100 text-warning-700'
                                        }`}>
                                        {cat.gstInput}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SpendingAnalysisWidget;
