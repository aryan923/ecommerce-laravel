import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    AlertTriangle,
    RotateCcw,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    ArrowUpRight,
    ArrowRight,
    RefreshCw,
    Activity,
    Layers,
    Award,
    CreditCard,
    Truck,
    Sparkles,
    ChevronRight,
    Boxes,
    BarChart2,
    Check,
    Copy,
    Tag,
    ShieldAlert
} from 'lucide-react';
import { loadCurrenciesFromApi, getCurrencyList, formatCurrency } from '../utils/currency';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [kpis, setKpis] = useState(null);
    const [salesChart, setSalesChart] = useState(null);
    const [orderStats, setOrderStats] = useState(null);
    const [topPerformers, setTopPerformers] = useState(null);
    const [highlights, setHighlights] = useState(null);
    const [period, setPeriod] = useState('last_30_days');
    const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'orders'
    const [activeTopTab, setActiveTopTab] = useState('products'); // 'products' | 'categories'
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    // Multi-Currency State
    const [displayCurrency, setDisplayCurrency] = useState('INR');
    const [currenciesList, setCurrenciesList] = useState(getCurrencyList());

    useEffect(() => {
        const initCurrencies = async () => {
            await loadCurrenciesFromApi();
            setCurrenciesList(getCurrencyList());
        };
        initCurrencies();
    }, []);

    const fetchDashboardData = async () => {
        setRefreshing(true);
        try {
            const [kpisRes, chartRes, statsRes, topRes, highlightsRes] = await Promise.all([
                axios.get('/api/v1/admin/dashboard/kpis'),
                axios.get(`/api/v1/admin/dashboard/sales-chart?period=${period}`),
                axios.get('/api/v1/admin/dashboard/order-stats'),
                axios.get('/api/v1/admin/dashboard/top-performers'),
                axios.get('/api/v1/admin/dashboard/highlights'),
            ]);

            setKpis(kpisRes.data?.data || {});
            setSalesChart(chartRes.data?.data || {});
            setOrderStats(statsRes.data?.data || {});
            setTopPerformers(topRes.data?.data || {});
            setHighlights(highlightsRes.data?.data || {});
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [period]);

    const handleCopy = (text, key, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(key);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Calculate chart scaling
    const chartPoints = salesChart?.chart || [];
    const maxRevenueVal = chartPoints.length
        ? Math.max(...chartPoints.map(c => c.total_sales), 100)
        : 100;
    const maxOrdersVal = chartPoints.length
        ? Math.max(...chartPoints.map(c => c.order_count), 10)
        : 10;

    const totalOrders = kpis?.total_orders || 0;
    const totalRevenue = kpis?.total_revenue || 0;
    const aov = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
    const deliveredCount = kpis?.delivered_orders || 0;
    const fulfillmentRate = totalOrders > 0 ? ((deliveredCount / totalOrders) * 100).toFixed(1) : '100.0';
    const readyToShip = kpis?.ready_to_ship || 0;
    const pendingReturnsCount = kpis?.pending_returns || 0;
    const pendingRefundsCount = kpis?.pending_refunds || 0;
    const lowStockCount = kpis?.low_stock_count || 0;

    // Payment methods calculations
    const paymentMethods = kpis?.payment_methods || [];
    const totalPaymentVolume = paymentMethods.reduce((sum, pm) => sum + (pm.volume || 0), 0) || 1;

    const periodOptions = [
        { key: 'today', label: 'Today' },
        { key: 'yesterday', label: 'Yesterday' },
        { key: 'last_7_days', label: '7 Days' },
        { key: 'last_30_days', label: '30 Days' },
        { key: 'this_month', label: 'This Month' },
        { key: 'last_month', label: 'Last Month' },
    ];

    const getOrderStatusStyle = (st) => {
        switch (st) {
            case 'delivered':
                return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.25)' };
            case 'shipped':
            case 'out_for_delivery':
                return { bg: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9', border: 'rgba(14, 165, 233, 0.25)' };
            case 'paid':
            case 'confirmed':
            case 'processing':
                return { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: 'rgba(99, 102, 241, 0.25)' };
            case 'cancelled':
            case 'failed':
                return { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.25)' };
            case 'pending_payment':
            default:
                return { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' };
        }
    };

    return (
        <div>
            {/* Header Control Toolbar */}
            <div className="page-header-row">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h2 className="page-header-title">
                            Store Performance Overview
                        </h2>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em'
                        }}>
                            <span className="order-status-dot pulse" style={{ width: '5px', height: '5px', backgroundColor: '#10b981' }} />
                            Live
                        </span>
                    </div>
                    <p className="page-header-subtitle">
                        Monitor sales, fulfillment pipelines, inventory stock levels, and customer orders
                    </p>
                </div>

                {/* Toolbar Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Timeframe Segmented Switcher */}
                    <div style={{
                        display: 'flex',
                        backgroundColor: 'var(--admin-card-bg)',
                        padding: '2px',
                        borderRadius: '8px',
                        border: '1px solid var(--admin-border)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        {periodOptions.map((opt) => {
                            const isSelected = period === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setPeriod(opt.key)}
                                    style={{
                                        border: 'none',
                                        backgroundColor: isSelected ? 'var(--admin-primary)' : 'transparent',
                                        color: isSelected ? '#ffffff' : 'var(--admin-muted)',
                                        fontWeight: isSelected ? 700 : 600,
                                        fontSize: '0.74rem',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Currency Selector */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)' }}>Currency:</span>
                        <select
                            className="form-select"
                            style={{
                                padding: '2px 14px 2px 2px',
                                fontSize: '0.78rem',
                                border: 'none',
                                backgroundColor: 'transparent',
                                fontWeight: 800,
                                color: 'var(--admin-text)',
                                cursor: 'pointer'
                            }}
                            value={displayCurrency}
                            onChange={(e) => setDisplayCurrency(e.target.value)}
                        >
                            {currenciesList.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.code} ({c.symbol})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Refresh Button */}
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={fetchDashboardData}
                        disabled={refreshing}
                        title="Reload Dashboard"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px' }}
                    >
                        <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* 4 Hero KPI Cards (Standard 4 Cards Per Row) */}
            <div className="stat-cards-grid-4">
                {/* 1. Total Store Revenue */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Total Store Revenue
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {loading ? '...' : formatCurrency(totalRevenue, displayCurrency, true)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#10b981', fontWeight: 700 }}>+Active</span>
                            <span>lifetime captured</span>
                        </div>
                    </div>
                </div>

                {/* 2. Selected Period Sales */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Period Sales ({period.replace(/_/g, ' ').toUpperCase()})
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                            {loading ? '...' : formatCurrency(kpis?.today_revenue || 0, displayCurrency, true)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            <strong>{kpis?.today_orders || 0}</strong> orders in window
                        </div>
                    </div>
                </div>

                {/* 3. Total Orders Placed */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Total Orders
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingCart size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {loading ? '...' : totalOrders.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{kpis?.pending_orders || 0}</span>
                            <span>in pipeline</span>
                        </div>
                    </div>
                </div>

                {/* 4. Average Order Value (AOV) */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Average Order Value
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a855f7' }}>
                            {loading ? '...' : formatCurrency(aov, displayCurrency, true)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Avg customer spend
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Action Alerts Bar (When returns or low stock need attention) */}
            {(readyToShip > 0 || pendingReturnsCount + pendingRefundsCount > 0 || lowStockCount > 0) && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '8px',
                    marginBottom: '10px'
                }}>
                    {readyToShip > 0 && (
                        <Link
                            to="/orders"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                                border: '1px solid rgba(99, 102, 241, 0.25)',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                transition: 'transform 0.15s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Truck size={16} style={{ color: 'var(--admin-primary)' }} />
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                                    <strong>{readyToShip} Orders</strong> ready to ship
                                </span>
                            </div>
                            <ChevronRight size={14} style={{ color: 'var(--admin-primary)' }} />
                        </Link>
                    )}

                    {pendingReturnsCount + pendingRefundsCount > 0 && (
                        <Link
                            to="/returns"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                transition: 'transform 0.15s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <RotateCcw size={16} style={{ color: '#ef4444' }} />
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                                    <strong>{pendingReturnsCount + pendingRefundsCount} Returns/Refunds</strong> pending
                                </span>
                            </div>
                            <ChevronRight size={14} style={{ color: '#ef4444' }} />
                        </Link>
                    )}

                    {lowStockCount > 0 && (
                        <Link
                            to="/inventory"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                                border: '1px solid rgba(245, 158, 11, 0.25)',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                transition: 'transform 0.15s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                                    <strong>{lowStockCount} Items</strong> under low stock limit
                                </span>
                            </div>
                            <ChevronRight size={14} style={{ color: '#f59e0b' }} />
                        </Link>
                    )}
                </div>
            )}

            {/* Middle 2-Column Section: (65% Sales Chart + 35% Fulfillment Funnel & Payment Breakdown) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '10px',
                marginBottom: '10px'
            }}>
                {/* Sales Revenue & Volume Trend Chart */}
                <div style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BarChart2 size={16} style={{ color: 'var(--admin-primary)' }} />
                                <span>Sales Revenue Trend</span>
                            </h3>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>
                                Daily performance for selected window ({period.replace(/_/g, ' ')})
                            </p>
                        </div>

                        {/* Metric Selector (Revenue / Orders) */}
                        <div style={{ display: 'flex', backgroundColor: 'var(--admin-card-hover)', padding: '2px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                            <button
                                type="button"
                                onClick={() => setChartMetric('revenue')}
                                style={{
                                    border: 'none',
                                    backgroundColor: chartMetric === 'revenue' ? 'var(--admin-card-bg)' : 'transparent',
                                    color: chartMetric === 'revenue' ? 'var(--admin-primary)' : 'var(--admin-muted)',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Revenue
                            </button>
                            <button
                                type="button"
                                onClick={() => setChartMetric('orders')}
                                style={{
                                    border: 'none',
                                    backgroundColor: chartMetric === 'orders' ? 'var(--admin-card-bg)' : 'transparent',
                                    color: chartMetric === 'orders' ? 'var(--admin-primary)' : 'var(--admin-muted)',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Orders
                            </button>
                        </div>
                    </div>

                    {chartPoints.length > 0 ? (
                        <div>
                            <div className="ecom-chart-wrap" style={{ height: '200px' }}>
                                {chartPoints.map((point, idx) => {
                                    const val = chartMetric === 'revenue' ? point.total_sales : point.order_count;
                                    const maxVal = chartMetric === 'revenue' ? maxRevenueVal : maxOrdersVal;
                                    const heightPct = Math.max(8, Math.min(100, (val / maxVal) * 100));

                                    return (
                                        <div key={idx} className="ecom-chart-col">
                                            <div
                                                className="ecom-chart-bar-single"
                                                style={{
                                                    height: `${heightPct}%`,
                                                    background: chartMetric === 'revenue'
                                                        ? 'linear-gradient(180deg, var(--admin-primary) 0%, rgba(99, 102, 241, 0.4) 100%)'
                                                        : 'linear-gradient(180deg, #0ea5e9 0%, rgba(14, 165, 233, 0.4) 100%)'
                                                }}
                                                title={`${point.date}: ${formatCurrency(point.total_sales, displayCurrency, true)} (${point.order_count} orders)`}
                                            />
                                            <span className="ecom-chart-axis-label">
                                                {point.date.slice(-5)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Chart Telemetry Footer */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: '10px',
                                marginTop: '8px',
                                borderTop: '1px solid var(--admin-border)',
                                fontSize: '0.78rem'
                            }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div>
                                        <span style={{ color: 'var(--admin-muted)' }}>Period Gross: </span>
                                        <strong style={{ color: 'var(--admin-text)' }}>
                                            {formatCurrency(chartPoints.reduce((s, p) => s + p.total_sales, 0), displayCurrency, true)}
                                        </strong>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--admin-muted)' }}>Period Orders: </span>
                                        <strong style={{ color: 'var(--admin-text)' }}>
                                            {chartPoints.reduce((s, p) => s + p.order_count, 0)}
                                        </strong>
                                    </div>
                                </div>
                                <span style={{ color: 'var(--admin-muted)', fontSize: '0.72rem' }}>
                                    Hover bar for exact day telemetry
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-muted)' }}>
                            <Activity size={24} style={{ opacity: 0.4, marginBottom: '6px' }} />
                            <span>No sales records recorded for this time period.</span>
                        </div>
                    )}
                </div>

                {/* Fulfillment Pipeline & Payment Channel Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Order Fulfillment Funnel */}
                    <div style={{
                        backgroundColor: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Layers size={15} style={{ color: '#0ea5e9' }} />
                                <span>Order Fulfillment Pipeline</span>
                            </h3>
                            <Link to="/orders" style={{ fontSize: '0.74rem', color: 'var(--admin-primary)', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                                View All <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {orderStats && [
                                { key: 'pending_payment', label: 'Unpaid', color: '#f59e0b' },
                                { key: 'paid', label: 'Paid', color: '#6366f1' },
                                { key: 'processing', label: 'Processing', color: '#8b5cf6' },
                                { key: 'shipped', label: 'Shipped', color: '#0ea5e9' },
                                { key: 'delivered', label: 'Delivered', color: '#10b981' },
                                { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
                            ].map((st) => (
                                <Link
                                    key={st.key}
                                    to="/orders"
                                    style={{
                                        backgroundColor: 'var(--admin-card-hover)',
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '8px',
                                        padding: '8px 10px',
                                        textDecoration: 'none',
                                        display: 'block',
                                        transition: 'transform 0.15s ease'
                                    }}
                                >
                                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: orderStats[st.key] > 0 ? 'var(--admin-text)' : 'var(--admin-muted)' }}>
                                        {orderStats[st.key] ?? 0}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: st.color, marginTop: '2px' }}>
                                        {st.label}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Payment Gateways Breakdown */}
                    <div style={{
                        backgroundColor: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CreditCard size={15} style={{ color: '#10b981' }} />
                                <span>Payment Channels</span>
                            </h3>
                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', fontWeight: 600 }}>By Share</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {paymentMethods.length > 0 ? (
                                paymentMethods.map((pm, idx) => {
                                    const pct = ((pm.volume / totalPaymentVolume) * 100).toFixed(0);
                                    return (
                                        <div key={idx}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '3px' }}>
                                                <span style={{ color: 'var(--admin-text)' }}>{pm.method}</span>
                                                <span style={{ color: 'var(--admin-muted)' }}>
                                                    {formatCurrency(pm.volume, displayCurrency, true)} ({pct}%)
                                                </span>
                                            </div>
                                            <div className="ecom-progress-track" style={{ height: '5px' }}>
                                                <div className="ecom-progress-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', textAlign: 'center', padding: '8px 0' }}>
                                    No payment transactions recorded yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom 2-Column Section: (55% Recent Orders Stream + 45% Top Products & Inventory) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                gap: '10px'
            }}>
                {/* Recent Orders Stream */}
                <div style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShoppingCart size={15} style={{ color: 'var(--admin-primary)' }} />
                            <span>Recent Orders Stream</span>
                        </h3>
                        <Link to="/orders" style={{ fontSize: '0.74rem', color: 'var(--admin-primary)', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                    <th style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {highlights?.recent_orders?.length ? (
                                    highlights.recent_orders.map((ord) => {
                                        const stStyle = getOrderStatusStyle(ord.status);
                                        return (
                                            <tr key={ord.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Link to="/orders" style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--admin-primary)', textDecoration: 'none' }}>
                                                            {ord.order_number}
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleCopy(ord.order_number, `ord_${ord.id}`, e)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', color: 'var(--admin-muted)' }}
                                                            title="Copy Order #"
                                                        >
                                                            {copiedId === `ord_${ord.id}` ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                                                        </button>
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '1px' }}>
                                                        {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {ord.items?.length || 1} items
                                                    </div>
                                                </td>

                                                <td>
                                                    <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>
                                                        {ord.user?.name || ord.guest_name || 'Customer'}
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>
                                                        {ord.payment_method?.toUpperCase() || 'COD'}
                                                    </div>
                                                </td>

                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{
                                                        fontSize: '0.68rem',
                                                        fontWeight: 800,
                                                        padding: '2px 6px',
                                                        borderRadius: '6px',
                                                        textTransform: 'uppercase',
                                                        backgroundColor: stStyle.bg,
                                                        color: stStyle.color,
                                                        border: `1px solid ${stStyle.border}`
                                                    }}>
                                                        {ord.status?.replace(/_/g, ' ')}
                                                    </span>
                                                </td>

                                                <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--admin-text)' }}>
                                                    {formatCurrency(ord.grand_total || 0, displayCurrency, true)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--admin-muted)' }}>
                                            No recent storefront orders.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Velocity Products & Categories */}
                <div style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Award size={18} style={{ color: '#f59e0b' }} />
                            {/* Tabbed Switcher */}
                            <div style={{ display: 'flex', backgroundColor: 'var(--admin-card-hover)', padding: '2px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                                <button
                                    type="button"
                                    onClick={() => setActiveTopTab('products')}
                                    style={{
                                        border: 'none',
                                        backgroundColor: activeTopTab === 'products' ? 'var(--admin-card-bg)' : 'transparent',
                                        color: activeTopTab === 'products' ? 'var(--admin-primary)' : 'var(--admin-muted)',
                                        fontSize: '0.76rem',
                                        fontWeight: 800,
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Top Products
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTopTab('categories')}
                                    style={{
                                        border: 'none',
                                        backgroundColor: activeTopTab === 'categories' ? 'var(--admin-card-bg)' : 'transparent',
                                        color: activeTopTab === 'categories' ? 'var(--admin-primary)' : 'var(--admin-muted)',
                                        fontSize: '0.76rem',
                                        fontWeight: 800,
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Top Categories
                                </button>
                            </div>
                        </div>

                        <span style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', fontWeight: 600 }}>By Captured Sales</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activeTopTab === 'products' ? (
                            topPerformers?.top_products?.length ? (
                                topPerformers.top_products.map((p, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingBottom: '10px', borderBottom: idx < topPerformers.top_products.length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                            <div className="ecom-rank-num">{idx + 1}</div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {p.product_name}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', fontFamily: 'monospace' }}>
                                                    SKU: {p.sku} • {p.units_sold} units sold
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.92rem', color: '#10b981', flexShrink: 0 }}>
                                            {formatCurrency(p.total_revenue || 0, displayCurrency, true)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)', fontSize: '0.84rem' }}>
                                    No product sales recorded yet.
                                </div>
                            )
                        ) : (
                            topPerformers?.top_categories?.length ? (
                                topPerformers.top_categories.map((c, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingBottom: '10px', borderBottom: idx < topPerformers.top_categories.length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="ecom-rank-num">{idx + 1}</div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--admin-text)' }}>
                                                    {c.category_name}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>
                                                    {c.units_sold} units sold
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.92rem', color: '#10b981', flexShrink: 0 }}>
                                            {formatCurrency(c.total_revenue || 0, displayCurrency, true)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)', fontSize: '0.84rem' }}>
                                    No category sales recorded yet.
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
