import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Boxes,
    Tag,
    Award,
    Sliders,
    ShoppingBag,
    RotateCcw,
    Users,
    Settings,
    Bell,
    LogOut,
    ChevronRight,
    ChevronDown,
    ExternalLink,
    Store,
    Sun,
    Moon,
    Menu,
    X,
    Search,
    Ticket,
    Truck,
    Percent,
    MessageSquare,
    BarChart3,
    Image
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import BrandsPage from './pages/BrandsPage';
import AttributesPage from './pages/AttributesPage';
import InventoryPage from './pages/InventoryPage';
import CustomerListPage from './pages/CustomerListPage';
import OrderListPage from './pages/OrderListPage';
import ReturnsPage from './pages/ReturnsPage';
import CouponsPage from './pages/CouponsPage';
import ShippingPage from './pages/ShippingPage';
import TaxesPage from './pages/TaxesPage';
import ReviewsPage from './pages/ReviewsPage';
import NotificationPage from './pages/NotificationPage';
import ReportsPage from './pages/ReportsPage';
import MediaLibraryPage from './pages/MediaLibraryPage';

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-muted)' }}>
                Authenticating admin session...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    const userMenuRef = useRef(null);
    const searchInputRef = useRef(null);

    // Auto-close mobile drawer and dropdown on route change
    useEffect(() => {
        setIsMobileNavOpen(false);
        setIsUserMenuOpen(false);
    }, [location.pathname]);

    // Click outside listener for Admin User Dropdown Menu
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Global keyboard shortcut (Ctrl + K / Cmd + K) to focus search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleGlobalSearch = (e) => {
        e.preventDefault();
        if (!globalSearchQuery.trim()) return;
        navigate(`/products?search=${encodeURIComponent(globalSearchQuery.trim())}`);
    };

    const getPageTitle = () => {
        if (location.pathname.includes('/products')) return 'Product Management';
        if (location.pathname.includes('/categories')) return 'Category Management';
        if (location.pathname.includes('/brands')) return 'Brand Management';
        if (location.pathname.includes('/attributes')) return 'Attribute & Variant Management';
        if (location.pathname.includes('/inventory')) return 'Inventory Management';
        if (location.pathname.includes('/orders')) return 'Order Management';
        if (location.pathname.includes('/returns')) return 'Return & Refund Management';
        if (location.pathname.includes('/coupons')) return 'Coupon Management';
        if (location.pathname.includes('/customers')) return 'Customer Management';
        if (location.pathname.includes('/notifications')) return 'Notification Center';
        if (location.pathname.includes('/reports')) return 'Reports & Analytics';
        return 'Executive Dashboard';
    };

    return (
        <div className="admin-layout">
            {/* Mobile Drawer Overlay Backdrop */}
            <div
                className={`sidebar-overlay ${isMobileNavOpen ? 'active' : ''}`}
                onClick={() => setIsMobileNavOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`}>
                {/* Brand / Logo Header */}
                <div className="sidebar-brand">
                    <div className="sidebar-brand-logo">
                        <Store size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span className="sidebar-brand-title">APC Commerce</span>
                        <span className="sidebar-brand-subtitle">Console v2.8</span>
                    </div>
                    {isMobileNavOpen && (
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ marginLeft: 'auto', padding: '4px' }}
                            onClick={() => setIsMobileNavOpen(false)}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Grouped Sidebar Navigation */}
                <nav className="sidebar-nav">
                    {/* SECTION 1: OVERVIEW */}
                    <div className="nav-section-label">
                        <span>Overview</span>
                    </div>

                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <LayoutDashboard size={17} />
                            <span>Executive Dashboard</span>
                        </div>
                    </NavLink>

                    {/* SECTION 2: STORE CATALOG & STOCK */}
                    <div className="nav-section-label" style={{ marginTop: '10px' }}>
                        <span>Catalog & Stock</span>
                    </div>

                    <NavLink
                        to="/products"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <Package size={17} />
                            <span>Products & SKUs</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/inventory"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <Boxes size={17} />
                            <span>Inventory Control</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/categories"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <Tag size={17} />
                            <span>Categories</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/brands"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <Award size={17} />
                            <span>Brands</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/attributes"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <Sliders size={17} />
                            <span>Attributes & Variants</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/media"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <Image size={17} />
                            <span>Media Asset Library</span>
                        </div>
                    </NavLink>

                    {/* SECTION 3: SALES & FULFILLMENT */}
                    <div className="nav-section-label" style={{ marginTop: '10px' }}>
                        <span>Sales & Orders</span>
                    </div>

                    <NavLink
                        to="/orders"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <ShoppingBag size={17} />
                            <span>Orders & Shipping</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/returns"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <RotateCcw size={17} />
                            <span>Returns & Refunds</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/shipping"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <Truck size={17} />
                            <span>Shipping & Fulfillment</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/taxes"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <Percent size={17} />
                            <span>Taxes & GST</span>
                        </div>
                    </NavLink>

                    {/* SECTION 4: CUSTOMERS & CRM */}
                    <div className="nav-section-label" style={{ marginTop: '10px' }}>
                        <span>Customers & CRM</span>
                    </div>

                    <NavLink
                        to="/customers"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <Users size={17} />
                            <span>Customer Accounts</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/reviews"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <MessageSquare size={17} />
                            <span>Review Moderation</span>
                        </div>
                    </NavLink>

                    {/* SECTION 5: PROMOTIONS & MARKETING */}
                    <div className="nav-section-label" style={{ marginTop: '10px' }}>
                        <span>Promotions & Marketing</span>
                    </div>

                    <NavLink
                        to="/coupons"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <Ticket size={17} />
                            <span>Coupons & Discounts</span>
                        </div>
                    </NavLink>

                    {/* SECTION 5: SETTINGS */}
                    <div className="nav-section-label" style={{ marginTop: '10px' }}>
                        <span>System Config</span>
                    </div>

                    <NavLink
                        to="/notifications"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <Bell size={17} />
                            <span>Notifications</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/reports"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <BarChart3 size={17} />
                            <span>Reports & Analytics</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <Settings size={17} />
                            <span>Store Settings</span>
                        </div>
                    </NavLink>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="admin-main">
                <header className="admin-header">
                    {/* Left: Hamburger & Page Identifier */}
                    <div className="header-title-area">
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm mobile-menu-btn"
                            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                            title="Toggle Mobile Navigation"
                            style={{ padding: '6px', marginRight: '4px' }}
                        >
                            {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>

                        {location.pathname !== '/' && location.pathname !== '' && (
                            <h1 className="header-page-title">{getPageTitle()}</h1>
                        )}
                    </div>

                    {/* Center: Global Search & Command Bar taking up whitespace */}
                    <form className="header-search-center" onSubmit={handleGlobalSearch}>
                        <div className="header-search-input-wrap">
                            <Search size={15} style={{ color: 'var(--admin-muted)', flexShrink: 0 }} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="header-search-input"
                                placeholder="Search products, orders, inventory, customers..."
                                value={globalSearchQuery}
                                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                            />
                            <span className="header-search-badge">Ctrl K</span>
                        </div>
                    </form>

                    {/* Right: Theme Toggle, Notifications & Admin User Dropdown */}
                    <div className="header-actions-area">
                        {/* Theme Toggle Button */}
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                padding: 0,
                                borderRadius: '8px'
                            }}
                        >
                            {theme === 'dark' ? <Sun size={16} style={{ color: '#f59e0b' }} /> : <Moon size={16} style={{ color: '#6366f1' }} />}
                        </button>

                        {/* Notification Bell with Badge */}
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="System Notifications"
                            style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                padding: 0,
                                borderRadius: '8px'
                            }}
                        >
                            <Bell size={16} />
                            <span style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--admin-danger)',
                                border: '2px solid var(--admin-card-bg)'
                            }} />
                        </button>

                        {/* Interactive Admin User Profile Dropdown Menu */}
                        <div className="user-menu-dropdown-container" ref={userMenuRef}>
                            <div
                                className={`user-menu-trigger-btn ${isUserMenuOpen ? 'active' : ''}`}
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                title="Admin User Menu"
                            >
                                <div className="user-avatar">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div className="user-menu-trigger-info">
                                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                        {user?.name || 'Administrator'}
                                    </span>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--admin-muted)', fontWeight: 600 }}>
                                        Super Admin
                                    </span>
                                </div>
                                <ChevronDown
                                    size={14}
                                    style={{
                                        color: 'var(--admin-muted)',
                                        transition: 'transform 0.2s ease',
                                        transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                />
                            </div>

                            {/* Dropdown Popup Menu */}
                            {isUserMenuOpen && (
                                <div className="user-menu-dropdown">
                                    {/* User Details Header */}
                                    <div className="user-menu-header">
                                        <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {user?.name || 'Administrator'}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {user?.email || 'admin@example.com'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Actions */}
                                    <div className="user-menu-body">
                                        <NavLink
                                            to="/settings"
                                            className="user-menu-item"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Settings size={15} />
                                                <span>Store Settings</span>
                                            </div>
                                        </NavLink>

                                        <div className="user-menu-divider" />

                                        {/* Logout Button (Exclusively inside Admin menu) */}
                                        <button
                                            type="button"
                                            className="user-menu-item danger"
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                logout();
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <LogOut size={15} />
                                                <span>Sign Out</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="admin-content">
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/categories" element={<CategoriesPage />} />
                        <Route path="/brands" element={<BrandsPage />} />
                        <Route path="/attributes" element={<AttributesPage />} />
                        <Route path="/orders" element={<OrderListPage />} />
                        <Route path="/returns" element={<ReturnsPage />} />
                        <Route path="/customers" element={<CustomerListPage />} />
                        <Route path="/coupons" element={<CouponsPage />} />
                        <Route path="/shipping" element={<ShippingPage />} />
                        <Route path="/taxes" element={<TaxesPage />} />
                        <Route path="/reviews" element={<ReviewsPage />} />
                        <Route path="/notifications" element={<NotificationPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/media" element={<MediaLibraryPage />} />
                        <Route path="*" element={<DashboardPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter basename="/admin">
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <AdminLayout />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}
