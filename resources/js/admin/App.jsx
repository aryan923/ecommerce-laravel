import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Boxes,
    Tag,
    Award,
    Sliders,
    ShoppingBag,
    Users,
    Settings,
    Bell,
    LogOut,
    ChevronRight,
    Store
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sun, Moon, Menu, X } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import BrandsPage from './pages/BrandsPage';
import AttributesPage from './pages/AttributesPage';
import InventoryPage from './pages/InventoryPage';

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
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

    React.useEffect(() => {
        setIsMobileNavOpen(false);
    }, [location.pathname]);

    const getPageTitle = () => {
        if (location.pathname.includes('/products')) return 'Product Management';
        if (location.pathname.includes('/categories')) return 'Category Management';
        if (location.pathname.includes('/brands')) return 'Brand Management';
        if (location.pathname.includes('/attributes')) return 'Attribute & Variant Management';
        if (location.pathname.includes('/inventory')) return 'Inventory Management';
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
                <div className="sidebar-brand">
                    <div className="sidebar-brand-logo">
                        <Store size={20} />
                    </div>
                    <span className="sidebar-brand-title">Admin Console</span>
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

                <nav className="sidebar-nav">
                    <div className="nav-section-label">Core Modules</div>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink
                        to="/products"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Package size={18} />
                        <span>Products</span>
                    </NavLink>
                    <NavLink
                        to="/inventory"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Boxes size={18} />
                        <span>Inventory</span>
                    </NavLink>
                    <NavLink
                        to="/categories"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Tag size={18} />
                        <span>Categories</span>
                    </NavLink>
                    <NavLink
                        to="/brands"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Award size={18} />
                        <span>Brands</span>
                    </NavLink>
                    <NavLink
                        to="/attributes"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Sliders size={18} />
                        <span>Attributes</span>
                    </NavLink>
                    <NavLink
                        to="/orders"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <ShoppingBag size={18} />
                        <span>Orders</span>
                    </NavLink>
                    <NavLink
                        to="/customers"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Users size={18} />
                        <span>Customers</span>
                    </NavLink>

                    <div className="nav-section-label" style={{ marginTop: '16px' }}>System</div>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Settings size={18} />
                        <span>Settings</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={toggleTheme}
                        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        {theme === 'dark' ? <Sun size={16} style={{ color: '#f59e0b' }} /> : <Moon size={16} style={{ color: '#6366f1' }} />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text)' }}>{user?.name || 'Admin User'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'admin@example.com'}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="admin-main">
                <header className="admin-header">
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
                        <span className="header-breadcrumb-prefix" style={{ color: 'var(--admin-muted)', fontSize: '0.9rem' }}>Admin</span>
                        <ChevronRight className="header-breadcrumb-icon" size={14} style={{ color: 'var(--admin-subtle)' }} />
                        <h1 className="header-page-title">{getPageTitle()}</h1>
                    </div>

                    <div className="header-actions-area">
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            {theme === 'dark' ? <Sun size={16} style={{ color: '#f59e0b' }} /> : <Moon size={16} style={{ color: '#6366f1' }} />}
                            <span className="header-btn-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                        </button>

                        <button className="btn btn-secondary btn-sm" title="Notifications">
                            <Bell size={16} />
                        </button>

                        <div className="header-user-badge">
                            <div className="user-avatar" style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <span className="header-user-name" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name || 'Admin'}</span>
                        </div>

                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={logout}
                            title="Sign Out"
                            style={{ color: 'var(--admin-danger)' }}
                        >
                            <LogOut size={16} />
                            <span className="header-btn-label">Logout</span>
                        </button>
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
