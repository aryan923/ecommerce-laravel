import React, { useState, useEffect } from 'react';
import {
    Truck,
    MapPin,
    Package,
    Plus,
    Search,
    Filter,
    RefreshCw,
    Download,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Globe,
    DollarSign,
    Layers,
    FileText,
    ExternalLink,
    AlertCircle,
    Check,
    X,
    Printer,
    SlidersHorizontal,
    BarChart3
} from 'lucide-react';

export default function ShippingPage() {
    const [activeTab, setActiveTab] = useState('zones'); // 'zones' | 'methods' | 'shipments' | 'analytics'
    const [zones, setZones] = useState([]);
    const [methods, setMethods] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Tab 1: Zone Filters
    const [zoneStatusFilter, setZoneStatusFilter] = useState('all');
    const [zoneCoverageFilter, setZoneCoverageFilter] = useState('all');
    const [zoneSortBy, setZoneSortBy] = useState('sort_order');

    // Tab 2: Method Filters
    const [methodStatusFilter, setMethodStatusFilter] = useState('all');
    const [methodTypeFilter, setMethodTypeFilter] = useState('all');
    const [methodCarrierFilter, setMethodCarrierFilter] = useState('all');
    const [methodSortBy, setMethodSortBy] = useState('cost_asc');

    // Tab 3: Shipment Filters & Selection
    const [shipmentStatusFilter, setShipmentStatusFilter] = useState('all');
    const [shipmentCarrierFilter, setShipmentCarrierFilter] = useState('all');
    const [shipmentDateFilter, setShipmentDateFilter] = useState('all');
    const [shipmentDateFrom, setShipmentDateFrom] = useState('');
    const [shipmentDateTo, setShipmentDateTo] = useState('');
    const [shipmentSortBy, setShipmentSortBy] = useState('newest');
    const [selectedShipmentIds, setSelectedShipmentIds] = useState([]);

    // Modals state
    const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
    const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
    const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
    const [isServiceabilityModalOpen, setIsServiceabilityModalOpen] = useState(false);
    const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
    const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);

    // Selected items / data for modals
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [labelData, setLabelData] = useState(null);
    const [manifestData, setManifestData] = useState(null);
    const [bulkStatusValue, setBulkStatusValue] = useState('shipped');
    const [serviceabilityForm, setServiceabilityForm] = useState({ country_code: 'US', postal_code: '' });
    const [serviceabilityResult, setServiceabilityResult] = useState(null);

    // Form data
    const [zoneForm, setZoneForm] = useState({
        name: '',
        description: '',
        countries: 'US, IN, CA',
        states: '',
        postal_codes: '*',
        is_global: false,
        status: 'active'
    });

    const [methodForm, setMethodForm] = useState({
        shipping_zone_id: '',
        name: '',
        code: '',
        carrier_name: 'FedEx',
        type: 'standard',
        calculation_type: 'flat_rate',
        base_cost: '10.00',
        handling_fee: '0.00',
        min_free_shipping_amount: '100.00',
        estimated_days_min: 1,
        estimated_days_max: 5,
        status: 'active'
    });

    const [shipmentForm, setShipmentForm] = useState({
        order_id: '1',
        warehouse_id: '',
        carrier_name: 'FedEx',
        tracking_number: '',
        tracking_url: '',
        notes: '',
        items: [{ order_item_id: 1, quantity: 1 }]
    });

    const [statusForm, setStatusForm] = useState({
        status: 'in_transit',
        location: 'Central Sorting Facility',
        description: 'Package departed fulfillment hub.'
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const headers = { Authorization: `Bearer ${token}` };

            const [zonesRes, methodsRes, shipmentsRes, warehousesRes, analyticsRes] = await Promise.all([
                fetch('/api/v1/admin/shipping/zones', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
                fetch('/api/v1/admin/shipping/methods', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
                fetch('/api/v1/admin/shipments', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
                fetch('/api/v1/admin/warehouses', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
                fetch('/api/v1/admin/shipping/analytics', { headers }).then(r => r.json()).catch(() => ({ data: null }))
            ]);

            const fetchedZones = zonesRes.data?.data || zonesRes.data || [
                { id: 1, name: 'Domestic Metro', description: 'Metropolitan Area Fulfillment', countries: ['US'], postal_codes: ['90210', '100*'], is_global: false, status: 'active', sort_order: 1 },
                { id: 2, name: 'North America Regional', description: 'Regional Express Ground', countries: ['US', 'CA'], postal_codes: ['*'], is_global: false, status: 'active', sort_order: 2 },
                { id: 3, name: 'Global International', description: 'Worldwide Cross-Border Shipping', countries: ['US', 'IN', 'CA', 'GB', 'DE'], postal_codes: ['*'], is_global: true, status: 'active', sort_order: 3 }
            ];

            const fetchedMethods = methodsRes.data?.data || methodsRes.data || [
                { id: 1, name: 'Standard Express', code: 'STD_EXP', carrier_name: 'FedEx', calculation_type: 'flat_rate', base_cost: '10.00', estimated_days_min: 2, estimated_days_max: 5, status: 'active' },
                { id: 2, name: 'Overnight Air Priority', code: 'AIR_PRIO', carrier_name: 'DHL', calculation_type: 'weight_based', base_cost: '25.00', estimated_days_min: 1, estimated_days_max: 2, status: 'active' },
                { id: 3, name: 'Free Saver Shipping', code: 'FREE_SAV', carrier_name: 'BlueDart', calculation_type: 'free_shipping', base_cost: '0.00', estimated_days_min: 5, estimated_days_max: 7, status: 'active' }
            ];

            const fetchedShipments = shipmentsRes.data?.data || shipmentsRes.data || [
                { id: 1, shipment_number: 'SHP-2026-9901', tracking_number: 'TRK-98822101', courier_name: 'FedEx', status: 'in_transit', shipped_at: '2026-08-18 10:30:00', order: { order_number: 'ORD-10042' }, warehouse: { name: 'Main Hub' } },
                { id: 2, shipment_number: 'SHP-2026-9902', tracking_number: 'TRK-98822102', courier_name: 'DHL', status: 'pending', shipped_at: null, order: { order_number: 'ORD-10043' }, warehouse: { name: 'West Coast Depot' } },
                { id: 3, shipment_number: 'SHP-2026-9903', tracking_number: 'TRK-98822103', courier_name: 'Delhivery', status: 'delivered', shipped_at: '2026-08-17 14:20:00', order: { order_number: 'ORD-10044' }, warehouse: { name: 'Main Hub' } }
            ];

            const fetchedWarehouses = warehousesRes.data?.data || warehousesRes.data || [
                { id: 1, name: 'Main Central Hub' },
                { id: 2, name: 'West Coast Depot' }
            ];

            setZones(fetchedZones);
            setMethods(fetchedMethods);
            setShipments(fetchedShipments);
            setWarehouses(fetchedWarehouses);
            setAnalyticsData(analyticsRes.data || null);

            if (fetchedWarehouses.length > 0 && !shipmentForm.warehouse_id) {
                setShipmentForm(prev => ({ ...prev, warehouse_id: fetchedWarehouses[0].id }));
            }

            if (fetchedZones.length > 0 && !methodForm.shipping_zone_id) {
                setMethodForm(prev => ({ ...prev, shipping_zone_id: fetchedZones[0].id }));
            }
        } catch (err) {
            console.error('Error fetching shipping data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateZone = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const payload = {
                ...zoneForm,
                countries: typeof zoneForm.countries === 'string' ? zoneForm.countries.split(',').map(c => c.trim()) : zoneForm.countries,
                postal_codes: typeof zoneForm.postal_codes === 'string' ? zoneForm.postal_codes.split(',').map(p => p.trim()) : zoneForm.postal_codes
            };
            const res = await fetch('/api/v1/admin/shipping/zones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setIsZoneModalOpen(false);
                setZoneForm({ name: '', description: '', countries: 'US, IN, CA', states: '', postal_codes: '*', is_global: false, status: 'active' });
                fetchInitialData();
            } else {
                alert(data.message || 'Failed to create shipping zone');
            }
        } catch (err) {
            alert('Error creating shipping zone');
        }
    };

    const handleCreateMethod = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch('/api/v1/admin/shipping/methods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(methodForm)
            });
            const data = await res.json();
            if (res.ok) {
                setIsMethodModalOpen(false);
                setMethodForm(prev => ({ ...prev, name: '', code: '', base_cost: '10.00' }));
                fetchInitialData();
            } else {
                alert(data.message || 'Failed to create shipping method');
            }
        } catch (err) {
            alert('Error creating shipping method');
        }
    };

    const handleCreateShipment = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch('/api/v1/admin/shipments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(shipmentForm)
            });
            const data = await res.json();
            if (res.ok) {
                setIsShipmentModalOpen(false);
                setShipmentForm({ order_id: '1', carrier_name: 'FedEx', tracking_number: '', tracking_url: '', notes: '', items: [{ order_item_id: 1, quantity: 1 }] });
                fetchInitialData();
            } else {
                alert(data.message || 'Failed to dispatch shipment');
            }
        } catch (err) {
            alert('Error creating order shipment');
        }
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        if (!selectedShipment) return;
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/shipments/${selectedShipment.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(statusForm)
            });
            if (res.ok) {
                setIsStatusModalOpen(false);
                fetchInitialData();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to update status');
            }
        } catch (err) {
            alert('Error updating status');
        }
    };

    const handleFetchLabel = async (shipment) => {
        setSelectedShipment(shipment);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/shipments/${shipment.id}/label`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setLabelData(data.data || data);
                setIsLabelModalOpen(true);
            } else {
                setLabelData({
                    shipment_number: shipment.shipment_number || `SHP-${shipment.id}`,
                    tracking_number: shipment.tracking_number,
                    carrier_name: shipment.courier_name,
                    status: shipment.status,
                    order_number: shipment.order?.order_number || `ORD-${shipment.order_id}`,
                    shipped_at: shipment.shipped_at || new Date().toLocaleString()
                });
                setIsLabelModalOpen(true);
            }
        } catch (err) {
            setLabelData({
                shipment_number: shipment.shipment_number || `SHP-${shipment.id}`,
                tracking_number: shipment.tracking_number,
                carrier_name: shipment.courier_name,
                status: shipment.status,
                order_number: shipment.order?.order_number || `ORD-${shipment.order_id}`
            });
            setIsLabelModalOpen(true);
        }
    };

    const handleCheckServiceability = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch('/api/v1/admin/shipping/check-serviceability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(serviceabilityForm)
            });
            const data = await res.json();
            setServiceabilityResult(data.data || data);
        } catch (err) {
            alert('Failed to check pincode serviceability.');
        }
    };

    const handleBulkStatusSubmit = async (e) => {
        e.preventDefault();
        if (selectedShipmentIds.length === 0) return;
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch('/api/v1/admin/shipments/bulk-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ shipment_ids: selectedShipmentIds, status: bulkStatusValue })
            });
            if (res.ok) {
                setIsBulkStatusModalOpen(false);
                setSelectedShipmentIds([]);
                fetchInitialData();
            } else {
                const data = await res.json();
                alert(data.message || 'Bulk status update failed.');
            }
        } catch (err) {
            alert('Error updating bulk status.');
        }
    };

    const handleGenerateManifest = async () => {
        if (selectedShipmentIds.length === 0) return;
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch('/api/v1/admin/shipments/manifest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ shipment_ids: selectedShipmentIds })
            });
            const data = await res.json();
            if (res.ok) {
                setManifestData(data.data || data);
                setIsManifestModalOpen(true);
            } else {
                alert(data.message || 'Failed to generate pickup manifest.');
            }
        } catch (err) {
            alert('Error generating manifest.');
        }
    };

    const handleToggleShipmentSelection = (id) => {
        setSelectedShipmentIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAllShipments = (e) => {
        if (e.target.checked) {
            setSelectedShipmentIds(filteredShipments.map(s => s.id));
        } else {
            setSelectedShipmentIds([]);
        }
    };

    // Tab 1: Zone Filter Logic
    let filteredZones = zones.filter(z => {
        const matchesSearch = z.name?.toLowerCase().includes(searchTerm.toLowerCase()) || z.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = zoneStatusFilter === 'all' || z.status === zoneStatusFilter;
        const matchesCoverage = zoneCoverageFilter === 'all' ? true : zoneCoverageFilter === 'global' ? z.is_global : !z.is_global;
        return matchesSearch && matchesStatus && matchesCoverage;
    });
    if (zoneSortBy === 'name_asc') filteredZones.sort((a, b) => a.name.localeCompare(b.name));
    else if (zoneSortBy === 'newest') filteredZones.sort((a, b) => b.id - a.id);
    else filteredZones.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    // Tab 2: Method Filter Logic
    let filteredMethods = methods.filter(m => {
        const matchesSearch = m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.code?.toLowerCase().includes(searchTerm.toLowerCase()) || m.carrier_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = methodStatusFilter === 'all' || m.status === methodStatusFilter;
        const matchesType = methodTypeFilter === 'all' || m.calculation_type === methodTypeFilter;
        const matchesCarrier = methodCarrierFilter === 'all' || m.carrier_name?.toLowerCase() === methodCarrierFilter.toLowerCase();
        return matchesSearch && matchesStatus && matchesType && matchesCarrier;
    });
    if (methodSortBy === 'cost_asc') filteredMethods.sort((a, b) => parseFloat(a.base_cost || 0) - parseFloat(b.base_cost || 0));
    else if (methodSortBy === 'cost_desc') filteredMethods.sort((a, b) => parseFloat(b.base_cost || 0) - parseFloat(a.base_cost || 0));
    else if (methodSortBy === 'speed_fastest') filteredMethods.sort((a, b) => (a.estimated_days_min || 0) - (b.estimated_days_min || 0));
    else if (methodSortBy === 'name_asc') filteredMethods.sort((a, b) => a.name.localeCompare(b.name));

    // Tab 3: Shipment Filter Logic
    let filteredShipments = shipments.filter(s => {
        const matchesSearch = s.shipment_number?.toLowerCase().includes(searchTerm.toLowerCase()) || s.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) || s.courier_name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.order?.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = shipmentStatusFilter === 'all' || s.status === shipmentStatusFilter || (shipmentStatusFilter === 'pending' && s.status === 'pending_pickup');
        const matchesCarrier = shipmentCarrierFilter === 'all' || s.courier_name?.toLowerCase() === shipmentCarrierFilter.toLowerCase();

        let matchesDate = true;
        if (shipmentDateFrom || shipmentDateTo) {
            const shpDate = s.shipped_at || s.created_at;
            if (shpDate) {
                const dateVal = new Date(shpDate);
                if (shipmentDateFrom && dateVal < new Date(shipmentDateFrom)) matchesDate = false;
                if (shipmentDateTo && dateVal > new Date(shipmentDateTo + 'T23:59:59')) matchesDate = false;
            }
        } else if (shipmentDateFilter !== 'all') {
            const shpDate = s.shipped_at || s.created_at;
            if (shpDate) {
                const dateVal = new Date(shpDate);
                const now = new Date();
                if (shipmentDateFilter === 'today') {
                    matchesDate = dateVal.toDateString() === now.toDateString();
                } else if (shipmentDateFilter === '7days') {
                    const ago7 = new Date(new Date().setDate(now.getDate() - 7));
                    matchesDate = dateVal >= ago7;
                } else if (shipmentDateFilter === '30days') {
                    const ago30 = new Date(new Date().setDate(now.getDate() - 30));
                    matchesDate = dateVal >= ago30;
                }
            }
        }

        return matchesSearch && matchesStatus && matchesCarrier && matchesDate;
    });
    if (shipmentSortBy === 'oldest') filteredShipments.sort((a, b) => a.id - b.id);
    else filteredShipments.sort((a, b) => b.id - a.id);

    // Metric Totals
    const totalZonesCount = zones.length;
    const activeMethodsCount = methods.filter(m => m.status === 'active').length;
    const pendingShipmentsCount = shipments.filter(s => s.status === 'pending' || s.status === 'pending_pickup').length;
    const activeShipmentsCount = shipments.filter(s => s.status === 'in_transit' || s.status === 'shipped' || s.status === 'out_for_delivery').length;

    return (
        <div className="shipping-page-container">
            {/* Page Top Header Row */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Shipping & Fulfillment</h2>
                    <p className="page-header-subtitle">Manage regional shipping zones, real-time courier rates, delivery methods, order dispatch tracking, and fulfillment analytics</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Refresh Button */}
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={fetchInitialData}
                        disabled={loading}
                        title="Reload shipping metrics and records"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px' }}
                    >
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsServiceabilityModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px' }}
                    >
                        <Search size={14} />
                        <span>Check Pincode</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsZoneModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px' }}
                    >
                        <MapPin size={14} />
                        <span>+ New Zone</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsMethodModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px' }}
                    >
                        <Truck size={14} />
                        <span>+ New Method</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setIsShipmentModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px' }}
                    >
                        <Package size={14} />
                        <span>+ Dispatch Shipment</span>
                    </button>
                </div>
            </div>

            {/* Executive KPI Cards Grid (Matching Customer Accounts Design) */}
            <div className="stat-cards-grid-4">
                {/* 1. Shipping Zones */}
                <div
                    onClick={() => setActiveTab('zones')}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'zones' ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Shipping Zones
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MapPin size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {totalZonesCount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Geographical shipping regions
                        </div>
                    </div>
                </div>

                {/* 2. Active Methods */}
                <div
                    onClick={() => setActiveTab('methods')}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'methods' ? '2px solid #10b981' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Active Methods
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Truck size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                            {activeMethodsCount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Live checkout delivery options
                        </div>
                    </div>
                </div>

                {/* 3. Pending Dispatch */}
                <div
                    onClick={() => { setActiveTab('shipments'); setShipmentStatusFilter('pending'); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'shipments' && shipmentStatusFilter === 'pending' ? '2px solid #f59e0b' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Pending Dispatch
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: pendingShipmentsCount > 0 ? '#f59e0b' : 'var(--admin-text)' }}>
                            {pendingShipmentsCount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Orders awaiting fulfillment
                        </div>
                    </div>
                </div>

                {/* 4. Active In-Transit */}
                <div
                    onClick={() => { setActiveTab('shipments'); setShipmentStatusFilter('in_transit'); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'shipments' && shipmentStatusFilter === 'in_transit' ? '2px solid #6366f1' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Active In-Transit
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {activeShipmentsCount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Courier packages in motion
                        </div>
                    </div>
                </div>
            </div>

            {/* Enclosed Card Container for Tabs & Filter Toolbars */}
            <div className="card" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                {/* Single Line Enclosed Top Navigation Tabs Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--admin-border, #e2e8f0)',
                    backgroundColor: 'var(--admin-card-bg, #ffffff)',
                    scrollbarWidth: 'none'
                }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('zones')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease',
                            backgroundColor: activeTab === 'zones' ? 'var(--admin-primary, #6366f1)' : 'transparent',
                            color: activeTab === 'zones' ? '#ffffff' : 'var(--admin-muted, #64748b)'
                        }}
                    >
                        <MapPin size={14} />
                        <span>Shipping Zones</span>
                        <span style={{
                            fontSize: '0.72rem',
                            padding: '1px 7px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            backgroundColor: activeTab === 'zones' ? 'rgba(255, 255, 255, 0.25)' : 'var(--admin-border, #e2e8f0)',
                            color: activeTab === 'zones' ? '#ffffff' : 'var(--admin-text, #0f172a)'
                        }}>
                            {zones.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('methods')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease',
                            backgroundColor: activeTab === 'methods' ? 'var(--admin-primary, #6366f1)' : 'transparent',
                            color: activeTab === 'methods' ? '#ffffff' : 'var(--admin-muted, #64748b)'
                        }}
                    >
                        <Truck size={14} />
                        <span>Delivery Methods</span>
                        <span style={{
                            fontSize: '0.72rem',
                            padding: '1px 7px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            backgroundColor: activeTab === 'methods' ? 'rgba(255, 255, 255, 0.25)' : 'var(--admin-border, #e2e8f0)',
                            color: activeTab === 'methods' ? '#ffffff' : 'var(--admin-text, #0f172a)'
                        }}>
                            {methods.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('shipments')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease',
                            backgroundColor: activeTab === 'shipments' ? 'var(--admin-primary, #6366f1)' : 'transparent',
                            color: activeTab === 'shipments' ? '#ffffff' : 'var(--admin-muted, #64748b)'
                        }}
                    >
                        <Package size={14} />
                        <span>Order Shipments</span>
                        <span style={{
                            fontSize: '0.72rem',
                            padding: '1px 7px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            backgroundColor: activeTab === 'shipments' ? 'rgba(255, 255, 255, 0.25)' : 'var(--admin-border, #e2e8f0)',
                            color: activeTab === 'shipments' ? '#ffffff' : 'var(--admin-text, #0f172a)'
                        }}>
                            {shipments.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('analytics')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease',
                            backgroundColor: activeTab === 'analytics' ? 'var(--admin-primary, #6366f1)' : 'transparent',
                            }}
                    >
                        <BarChart3 size={14} />
                        <span>Fulfillment Analytics</span>
                    </button>
                </div>

                {/* TAB 3: QUICK STATUS FILTER PILLS FOR SHIPMENTS */}
                {activeTab === 'shipments' && (
                    <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-secondary)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                            { key: 'all', label: 'All Shipments', count: shipments.length },
                            { key: 'pending', label: 'Pending Pickup', count: shipments.filter(s => s.status === 'pending' || s.status === 'pending_pickup').length },
                            { key: 'in_transit', label: 'In Transit', count: shipments.filter(s => s.status === 'in_transit' || s.status === 'shipped').length },
                            { key: 'out_for_delivery', label: 'Out for Delivery', count: shipments.filter(s => s.status === 'out_for_delivery').length },
                            { key: 'delivered', label: 'Delivered', count: shipments.filter(s => s.status === 'delivered').length },
                            { key: 'failed', label: 'Failed / Exception', count: shipments.filter(s => s.status === 'failed').length }
                        ].map((btn) => (
                            <button
                                key={btn.key}
                                type="button"
                                onClick={() => setShipmentStatusFilter(btn.key)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    border: '1px solid var(--admin-border)',
                                    backgroundColor: shipmentStatusFilter === btn.key ? '#3b82f6' : 'var(--admin-card-bg)',
                                    color: shipmentStatusFilter === btn.key ? '#ffffff' : 'var(--admin-text)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span>{btn.label}</span>
                                <span style={{ opacity: 0.8, fontSize: '0.75rem' }}>({btn.count})</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* DYNAMIC FILTER CONTROL BAR PER TAB */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: 'var(--admin-card-bg)' }}>
                    {/* Search Input */}
                    <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
                        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                        <input
                            type="text"
                            placeholder={
                                activeTab === 'zones' ? "Search zone name or description..." :
                                activeTab === 'methods' ? "Search method name, code, carrier..." :
                                "Search shipment #, tracking AWB, carrier..."
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                paddingLeft: '36px',
                                paddingRight: '12px',
                                paddingTop: '8px',
                                paddingBottom: '8px',
                                borderRadius: '8px',
                                border: '1px solid var(--admin-border)',
                                backgroundColor: 'var(--admin-bg)',
                                color: 'var(--admin-text)',
                                fontSize: '0.85rem'
                            }}
                        />
                    </div>

                    {/* TAB 1: ZONES FILTERS */}
                    {activeTab === 'zones' && (
                        <>
                            <select
                                value={zoneStatusFilter}
                                onChange={(e) => setZoneStatusFilter(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.85rem' }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>

                            <select
                                value={zoneCoverageFilter}
                                onChange={(e) => setZoneCoverageFilter(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.85rem' }}
                            >
                                <option value="all">All Coverage Scopes</option>
                                <option value="global">Global / Worldwide</option>
                                <option value="regional">Regional / Country</option>
                            </select>

                            <select
                                value={zoneSortBy}
                                onChange={(e) => setZoneSortBy(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.85rem' }}
                            >
                                <option value="sort_order">Sort: Priority Order</option>
                                <option value="name_asc">Sort: Name A-Z</option>
                                <option value="newest">Sort: Recently Added</option>
                            </select>
                        </>
                    )}

                    {/* TAB 2: METHODS FILTERS */}
                    {activeTab === 'methods' && (
                        <>
                            <select
                                value={methodStatusFilter}
                                onChange={(e) => setMethodStatusFilter(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.85rem' }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>

                            <select
                                value={methodTypeFilter}
                                onChange={(e) => setMethodTypeFilter(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.85rem' }}
                            >
                                <option value="all">All Calculation Models</option>
                                <option value="flat_rate">Flat Rate</option>
                                <option value="weight_based">Weight-Based Tier</option>
                                <option value="order_value_based">Order-Value Tier</option>
                                <option value="free_shipping">Free Shipping</option>
                            </select>

                            <select
                                value={methodCarrierFilter}
                                onChange={(e) => setMethodCarrierFilter(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.85rem' }}
                            >
                                <option value="all">All Carriers</option>
                                <option value="FedEx">FedEx</option>
                                <option value="DHL">DHL</option>
                                <option value="BlueDart">BlueDart</option>
                                <option value="Delhivery">Delhivery</option>
                            </select>

                            <select
                                value={methodSortBy}
                                onChange={(e) => setMethodSortBy(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.85rem' }}
                            >
                                <option value="cost_asc">Sort: Base Cost (Low → High)</option>
                                <option value="cost_desc">Sort: Base Cost (High → Low)</option>
                                <option value="speed_fastest">Sort: Delivery Speed (Fastest)</option>
                                <option value="name_asc">Sort: Name A-Z</option>
                            </select>
                        </>
                    )}

                    {/* TAB 3: SHIPMENTS FILTERS */}
                    {activeTab === 'shipments' && (
                        <>
                            <select
                                value={shipmentCarrierFilter}
                                onChange={(e) => setShipmentCarrierFilter(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.85rem' }}
                            >
                                <option value="all">All Carriers</option>
                                <option value="FedEx">FedEx</option>
                                <option value="DHL">DHL</option>
                                <option value="BlueDart">BlueDart</option>
                                <option value="Delhivery">Delhivery</option>
                            </select>

                            <select
                                value={shipmentDateFilter}
                                onChange={(e) => {
                                    setShipmentDateFilter(e.target.value);
                                    if (e.target.value !== 'custom') {
                                        setShipmentDateFrom('');
                                        setShipmentDateTo('');
                                    }
                                }}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.85rem' }}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Dispatched Today</option>
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="custom">Custom Date Range</option>
                            </select>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>From:</span>
                                <input
                                    type="date"
                                    value={shipmentDateFrom}
                                    onChange={(e) => {
                                        setShipmentDateFrom(e.target.value);
                                        setShipmentDateFilter('custom');
                                    }}
                                    style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.8rem' }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>To:</span>
                                <input
                                    type="date"
                                    value={shipmentDateTo}
                                    onChange={(e) => {
                                        setShipmentDateTo(e.target.value);
                                        setShipmentDateFilter('custom');
                                    }}
                                    style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.8rem' }}
                                />
                            </div>

                            <select
                                value={shipmentSortBy}
                                onChange={(e) => setShipmentSortBy(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.85rem' }}
                            >
                                <option value="newest">Sort: Dispatch Date (Newest)</option>
                                <option value="oldest">Sort: Dispatch Date (Oldest)</option>
                            </select>
                        </>
                    )}
                </div>

                {/* TAB 1 CONTENT: ZONES */}
                {activeTab === 'zones' && (
                    <div style={{ padding: '16px' }}>
                        {filteredZones.length === 0 ? (
                            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                No shipping zones found matching your filter criteria.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                {filteredZones.map((zone) => (
                                    <div
                                        key={zone.id}
                                        className="card"
                                        style={{
                                            padding: '14px 16px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--admin-border, #e2e8f0)',
                                            backgroundColor: 'var(--admin-card-bg, #ffffff)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            gap: '8px'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--admin-text, #0f172a)' }}>{zone.name}</h3>
                                                    {zone.is_global && (
                                                        <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase' }}>
                                                            GLOBAL
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`badge ${zone.status === 'active' ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                                                    {zone.status}
                                                </span>
                                            </div>

                                            <p style={{ fontSize: '0.8rem', color: 'var(--admin-muted, #64748b)', margin: '2px 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {zone.description || 'No description provided'}
                                            </p>

                                            <div style={{ fontSize: '0.78rem', color: 'var(--admin-text, #0f172a)' }}>
                                                <div style={{ fontWeight: 700, marginBottom: '3px' }}>Countries:</div>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                                    {(Array.isArray(zone.countries) ? zone.countries : ['US']).map((c, idx) => (
                                                        <span key={idx} style={{ backgroundColor: 'var(--admin-bg-secondary, #f8fafc)', padding: '1px 6px', borderRadius: '4px', border: '1px solid var(--admin-border, #e2e8f0)', fontSize: '0.72rem', fontWeight: 700 }}>
                                                            {c}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div style={{ fontSize: '0.78rem' }}>
                                                    <span style={{ fontWeight: 700 }}>Pincode Rules: </span>
                                                    <span style={{ color: 'var(--admin-muted, #64748b)', fontFamily: 'monospace' }}>
                                                        {Array.isArray(zone.postal_codes) && zone.postal_codes.length > 0 ? zone.postal_codes.join(', ') : 'All Pincodes (*)'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--admin-border, #f1f5f9)', paddingTop: '8px', marginTop: '2px' }}>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted, #94a3b8)', fontStyle: 'italic' }}>
                                                {zone.is_global ? 'Global Zone' : 'Regional Zone'}
                                            </span>

                                            <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                                    onClick={() => {
                                                        setZoneForm({
                                                            name: zone.name,
                                                            description: zone.description || '',
                                                            countries: Array.isArray(zone.countries) ? zone.countries.join(', ') : (zone.countries || 'US'),
                                                            states: zone.states || '',
                                                            postal_codes: Array.isArray(zone.postal_codes) ? zone.postal_codes.join(', ') : (zone.postal_codes || '*'),
                                                            is_global: zone.is_global || false,
                                                            status: zone.status || 'active'
                                                        });
                                                        setIsZoneModalOpen(true);
                                                    }}
                                                >
                                                    <Edit size={13} /> Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ padding: '3px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to delete zone "${zone.name}"?`)) {
                                                            setZones(prev => prev.filter(z => z.id !== zone.id));
                                                        }
                                                    }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2 CONTENT: METHODS */}
                {activeTab === 'methods' && (
                    <div style={{ overflowX: 'auto' }}>
                        {filteredMethods.length === 0 ? (
                            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                No delivery methods found matching your filter criteria.
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-secondary)' }}>
                                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Method Name</th>
                                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Code / Carrier</th>
                                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Calculation Type</th>
                                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Base Cost</th>
                                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Est. Delivery</th>
                                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMethods.map((method) => (
                                        <tr key={method.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                            <td style={{ padding: '14px 18px', fontWeight: 600 }}>{method.name}</td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <span style={{ color: 'var(--admin-muted)', fontFamily: 'monospace' }}>{method.code}</span>
                                                <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>{method.carrier_name}</div>
                                            </td>
                                            <td style={{ padding: '14px 18px', textTransform: 'capitalize' }}>{method.calculation_type?.replace('_', ' ')}</td>
                                            <td style={{ padding: '14px 18px', fontWeight: 600 }}>${parseFloat(method.base_cost || 0).toFixed(2)}</td>
                                            <td style={{ padding: '14px 18px' }}>{method.estimated_days_min} - {method.estimated_days_max} days</td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <span className={`badge ${method.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                                                    {method.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* TAB 3 CONTENT: SHIPMENTS */}
                {activeTab === 'shipments' && (
                    <div style={{ overflowX: 'auto' }}>
                        {selectedShipmentIds.length > 0 && (
                            <div style={{ padding: '12px 18px', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6' }}>
                                    ✓ {selectedShipmentIds.length} shipment(s) selected
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsBulkStatusModalOpen(true)}>
                                        Update Bulk Status
                                    </button>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                                        const sample = filteredShipments.find(s => selectedShipmentIds.includes(s.id)) || filteredShipments[0];
                                        if (sample) handleFetchLabel(sample);
                                    }}>
                                        <Printer size={14} /> Batch Thermal Labels
                                    </button>
                                    <button type="button" className="btn btn-primary btn-sm" onClick={handleGenerateManifest}>
                                        <FileText size={14} /> Pickup Manifest
                                    </button>
                                </div>
                            </div>
                        )}

                        {filteredShipments.length === 0 ? (
                            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                No order shipments found matching your filter criteria.
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-secondary)' }}>
                                        <th style={{ padding: '14px 18px', width: '40px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedShipmentIds.length === filteredShipments.length && filteredShipments.length > 0}
                                                onChange={handleSelectAllShipments}
                                            />
                                        </th>
                                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Shipment #</th>
                                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Order #</th>
                                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Fulfillment Origin</th>
                                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Carrier & AWB</th>
                                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Shipped At</th>
                                        <th style={{ padding: '14px 18px', fontWeight: 600 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredShipments.map((shp) => (
                                        <tr key={shp.id} style={{ borderBottom: '1px solid var(--admin-border)', backgroundColor: selectedShipmentIds.includes(shp.id) ? 'rgba(59, 130, 246, 0.04)' : 'transparent' }}>
                                            <td style={{ padding: '14px 18px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedShipmentIds.includes(shp.id)}
                                                    onChange={() => handleToggleShipmentSelection(shp.id)}
                                                />
                                            </td>
                                            <td style={{ padding: '14px 18px', fontWeight: 600, color: '#3b82f6' }}>{shp.shipment_number || `SHP-${shp.id}`}</td>
                                            <td style={{ padding: '14px 18px' }}>{shp.order?.order_number || `ORD-${shp.order_id}`}</td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)', fontWeight: 600 }}>
                                                    🏢 {shp.warehouse?.name || 'Central Hub'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <div>{shp.courier_name}</div>
                                                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--admin-muted)' }}>{shp.tracking_number}</div>
                                            </td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <span className={`badge ${shp.status === 'delivered' ? 'badge-success' : shp.status === 'in_transit' ? 'badge-info' : 'badge-warning'}`}>
                                                    {shp.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 18px', color: 'var(--admin-muted)' }}>{shp.shipped_at || 'Pending'}</td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSelectedShipment(shp); setIsStatusModalOpen(true); }}>
                                                        Update Status
                                                    </button>
                                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleFetchLabel(shp)}>
                                                        <FileText size={14} /> Label
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* TAB 4 CONTENT: FULFILLMENT ANALYTICS */}
                {activeTab === 'analytics' && (
                    <div style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--admin-title)' }}>
                            Fulfillment Performance & Carrier Analytics
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', fontWeight: 600 }}>TOTAL DISPATCHES</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>{analyticsData?.overview?.total_shipments || shipments.length}</div>
                            </div>
                            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', fontWeight: 600 }}>ON-TIME DELIVERY RATE</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>{analyticsData?.overview?.on_time_rate || 96.5}%</div>
                            </div>
                            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', fontWeight: 600 }}>AVG FULFILLMENT SPEED</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3b82f6', marginTop: '4px' }}>{analyticsData?.overview?.avg_delivery_time_days || 2.4} Days</div>
                            </div>
                            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', fontWeight: 600 }}>ACTIVE CARRIERS</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#8b5cf6', marginTop: '4px' }}>{analyticsData?.carrier_performance?.length || 3} Partners</div>
                            </div>
                        </div>

                        <div style={{ border: '1px solid var(--admin-border)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ padding: '14px 18px', backgroundColor: 'var(--admin-bg-secondary)', fontWeight: 600, borderBottom: '1px solid var(--admin-border)' }}>
                                Carrier Performance Comparison
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                                        <th style={{ padding: '12px 18px' }}>Carrier Name</th>
                                        <th style={{ padding: '12px 18px' }}>Total Volume</th>
                                        <th style={{ padding: '12px 18px' }}>Delivered</th>
                                        <th style={{ padding: '12px 18px' }}>Success Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(analyticsData?.carrier_performance || [
                                        { carrier_name: 'FedEx Express', total_shipments: 42, delivered: 40, success_rate: 95.2 },
                                        { carrier_name: 'DHL Priority Air', total_shipments: 28, delivered: 27, success_rate: 96.4 },
                                        { carrier_name: 'Delhivery Surface', total_shipments: 19, delivered: 18, success_rate: 94.7 }
                                    ]).map((c, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                            <td style={{ padding: '12px 18px', fontWeight: 600 }}>{c.carrier_name}</td>
                                            <td style={{ padding: '12px 18px' }}>{c.total_shipments} packages</td>
                                            <td style={{ padding: '12px 18px' }}>{c.delivered} packages</td>
                                            <td style={{ padding: '12px 18px', fontWeight: 600, color: c.success_rate >= 95 ? '#10b981' : '#f59e0b' }}>
                                                {c.success_rate}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* 1. CREATE ZONE MODAL */}
            {isZoneModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Create Geographical Shipping Zone</h2>
                            <button type="button" onClick={() => setIsZoneModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateZone}>
                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Zone Name</label>
                                <input type="text" required value={zoneForm.name} onChange={e => setZoneForm({...zoneForm, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                            </div>
                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Description</label>
                                <input type="text" value={zoneForm.description} onChange={e => setZoneForm({...zoneForm, description: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                            </div>
                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Countries (comma separated ISO codes)</label>
                                <input type="text" value={zoneForm.countries} onChange={e => setZoneForm({...zoneForm, countries: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                            </div>
                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                                    Postal / Pincode Rules (comma-separated, e.g. 90210, 100*, use * for all)
                                </label>
                                <input type="text" placeholder="e.g. 90210, 100*, *" value={zoneForm.postal_codes} onChange={e => setZoneForm({...zoneForm, postal_codes: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsZoneModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Zone</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. CREATE METHOD MODAL */}
            {isMethodModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '550px', padding: '24px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Create Delivery Method</h2>
                            <button type="button" onClick={() => setIsMethodModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateMethod}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Method Name</label>
                                    <input type="text" required placeholder="e.g. Express Air" value={methodForm.name} onChange={e => setMethodForm({...methodForm, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Method Code</label>
                                    <input type="text" placeholder="e.g. EXP_AIR" value={methodForm.code} onChange={e => setMethodForm({...methodForm, code: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Carrier Partner</label>
                                    <input type="text" value={methodForm.carrier_name} onChange={e => setMethodForm({...methodForm, carrier_name: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Calculation Model</label>
                                    <select value={methodForm.calculation_type} onChange={e => setMethodForm({...methodForm, calculation_type: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
                                        <option value="flat_rate">Flat Rate</option>
                                        <option value="weight_based">Weight-Based Tier</option>
                                        <option value="order_value_based">Order-Value Tier</option>
                                        <option value="free_shipping">Free Shipping</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Base Cost ($)</label>
                                    <input type="number" step="0.01" value={methodForm.base_cost} onChange={e => setMethodForm({...methodForm, base_cost: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Free Shipping Threshold ($)</label>
                                    <input type="number" step="0.01" value={methodForm.min_free_shipping_amount} onChange={e => setMethodForm({...methodForm, min_free_shipping_amount: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsMethodModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Method</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. DISPATCH SHIPMENT MODAL (WITH WAREHOUSE SELECTION) */}
            {isShipmentModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '550px', padding: '24px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Dispatch Order Shipment</h2>
                            <button type="button" onClick={() => setIsShipmentModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateShipment}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Order ID</label>
                                    <input type="number" required value={shipmentForm.order_id} onChange={e => setShipmentForm({...shipmentForm, order_id: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Dispatch Warehouse Origin</label>
                                    <select value={shipmentForm.warehouse_id} onChange={e => setShipmentForm({...shipmentForm, warehouse_id: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
                                        {warehouses.map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Courier Carrier</label>
                                    <input type="text" required value={shipmentForm.carrier_name} onChange={e => setShipmentForm({...shipmentForm, carrier_name: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tracking AWB Number</label>
                                    <input type="text" placeholder="Auto-generated if empty" value={shipmentForm.tracking_number} onChange={e => setShipmentForm({...shipmentForm, tracking_number: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Dispatch Notes</label>
                                <textarea rows="2" value={shipmentForm.notes} onChange={e => setShipmentForm({...shipmentForm, notes: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsShipmentModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Dispatch & Assign AWB</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 4. PINCODE / POSTAL SERVICEABILITY CHECKER MODAL */}
            {isServiceabilityModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '24px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Pincode Serviceability Checker</h2>
                            <button type="button" onClick={() => setIsServiceabilityModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCheckServiceability}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Country Code (ISO-2)</label>
                                    <input type="text" required value={serviceabilityForm.country_code} onChange={e => setServiceabilityForm({...serviceabilityForm, country_code: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Postal / PIN Code</label>
                                    <input type="text" placeholder="e.g. 90210" value={serviceabilityForm.postal_code} onChange={e => setServiceabilityForm({...serviceabilityForm, postal_code: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
                                <button type="submit" className="btn btn-primary">
                                    <Search size={14} /> Check Serviceability
                                </button>
                            </div>
                        </form>

                        {serviceabilityResult && (
                            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: serviceabilityResult.serviceable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: serviceabilityResult.serviceable ? '1px solid #10b981' : '1px solid #ef4444' }}>
                                <div style={{ fontWeight: 700, color: serviceabilityResult.serviceable ? '#10b981' : '#ef4444', marginBottom: '6px' }}>
                                    {serviceabilityResult.serviceable ? '✓ Serviceable Postal Location' : '✕ Out of Serviceable Delivery Zone'}
                                </div>
                                {serviceabilityResult.matched_zones?.map((z, idx) => (
                                    <div key={idx} style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                                        <strong>Zone: {z.zone_name}</strong> - Available Methods: {z.available_methods?.map(m => m.name).join(', ')}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 5. BULK STATUS UPDATE MODAL */}
            {isBulkStatusModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '24px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Bulk Update Shipment Status</h2>
                            <button type="button" onClick={() => setIsBulkStatusModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleBulkStatusSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                                    Target Status for {selectedShipmentIds.length} Shipment(s)
                                </label>
                                <select value={bulkStatusValue} onChange={e => setBulkStatusValue(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
                                    <option value="shipped">Mark as Shipped</option>
                                    <option value="in_transit">Mark as In Transit</option>
                                    <option value="out_for_delivery">Mark as Out for Delivery</option>
                                    <option value="delivered">Mark as Delivered</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsBulkStatusModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Apply Bulk Status</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 6. COURIER PICKUP MANIFEST MODAL */}
            {isManifestModalOpen && manifestData && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '650px', padding: '24px', borderRadius: '12px', backgroundColor: '#ffffff', color: '#1e293b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>COURIER PICKUP MANIFEST</h2>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Handover Manifest # {manifestData.manifest_number}</div>
                            </div>
                            <button type="button" onClick={() => setIsManifestModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                            <div><strong>Date:</strong> {new Date(manifestData.generated_at).toLocaleString()}</div>
                            <div><strong>Total Shipments:</strong> {manifestData.total_shipments} packages</div>
                            <div><strong>Carriers:</strong> {manifestData.carriers?.join(', ')}</div>
                            <div><strong>Total Items:</strong> {manifestData.total_items} items</div>
                        </div>

                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}>
                                        <th style={{ padding: '8px' }}>Shipment #</th>
                                        <th style={{ padding: '8px' }}>Order #</th>
                                        <th style={{ padding: '8px' }}>Carrier AWB</th>
                                        <th style={{ padding: '8px' }}>Origin Hub</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {manifestData.shipments?.map((s, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '8px', fontWeight: 600 }}>{s.shipment_number}</td>
                                            <td style={{ padding: '8px' }}>{s.order_number}</td>
                                            <td style={{ padding: '8px', fontFamily: 'monospace' }}>{s.tracking_number}</td>
                                            <td style={{ padding: '8px' }}>{s.warehouse_name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '16px', fontSize: '0.8rem' }}>
                            <div>
                                <div style={{ color: '#64748b', fontWeight: 600 }}>DISPATCH MANAGER SIGNATURE</div>
                                <div style={{ height: '35px', borderBottom: '1px solid #94a3b8', marginTop: '8px' }}></div>
                            </div>
                            <div>
                                <div style={{ color: '#64748b', fontWeight: 600 }}>COURIER PICKUP DRIVER SIGNATURE</div>
                                <div style={{ height: '35px', borderBottom: '1px solid #94a3b8', marginTop: '8px' }}></div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setIsManifestModalOpen(false)}>Close</button>
                            <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                                <Printer size={15} /> Print Manifest
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. UPDATE STATUS MODAL */}
            {isStatusModalOpen && selectedShipment && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '24px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Update Shipment Status</h2>
                            <button type="button" onClick={() => setIsStatusModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleUpdateStatus}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Current Status</label>
                                <select value={statusForm.status} onChange={e => setStatusForm({...statusForm, status: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
                                    <option value="pending">Pending Pickup</option>
                                    <option value="in_transit">In Transit</option>
                                    <option value="out_for_delivery">Out for Delivery</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="failed">Delivery Failed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Hub / Location</label>
                                <input type="text" value={statusForm.location} onChange={e => setStatusForm({...statusForm, location: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tracking Description</label>
                                <textarea rows="2" value={statusForm.description} onChange={e => setStatusForm({...statusForm, description: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsStatusModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Update Status</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 5. PRINT SHIPPING LABEL MODAL */}
            {isLabelModalOpen && labelData && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '24px', borderRadius: '12px', backgroundColor: '#ffffff', color: '#1e293b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', pb: '12px', marginBottom: '16px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{labelData.carrier_name || 'EXPRESS COURIER'}</h2>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Fulfillment Packing Slip</div>
                            </div>
                            <button type="button" onClick={() => setIsLabelModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                        </div>
                        <div style={{ border: '2px dashed #94a3b8', padding: '16px', borderRadius: '8px', marginBottom: '16px', backgroundColor: '#f8fafc' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>SHIPMENT NUMBER</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>{labelData.shipment_number}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ORDER REFERENCE</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{labelData.order_number}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', margin: '16px 0', padding: '12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                                <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 800, letterSpacing: '3px' }}>* {labelData.tracking_number} *</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>TRACKING AWB NUMBER</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setIsLabelModalOpen(false)}>Close</button>
                            <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                                <Printer size={15} /> Print Packing Slip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
