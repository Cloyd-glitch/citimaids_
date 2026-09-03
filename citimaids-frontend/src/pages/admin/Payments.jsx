import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import {
    brand,
    fonts,
    pageTitle,
    pageSubtitle,
    card,
    solidBtn,
    outlineBtn,
    searchBar,
    searchInput,
    selectStyle,
    inputStyle,
} from './adminStyles';

const PAYMENT_METHODS = [
    { value: 'all', label: 'All Methods' },
    { value: 'adcb_pace_pay', label: 'ADCB Pace Pay' },
    { value: 'card', label: 'Card Payment' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash on Delivery' },
];

const PAYMENT_STATUSES = [
    { value: 'all', label: 'All Statuses' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'expired', label: 'Expired' },
];

const TX_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: 'charge', label: 'Charge' },
    { value: 'refund', label: 'Refund' },
    { value: 'void', label: 'Void' },
];

const avatarColors = ['#1E3A8A', '#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];

export default function Payments({ defaultTab = 'payments' }) {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || defaultTab;

    const [activeTab, setActiveTab] = useState(initialTab);

    // ── Payments State ──
    const [payments, setPayments] = useState([]);
    const [paymentsMeta, setPaymentsMeta] = useState({});
    const [paymentsLoading, setPaymentsLoading] = useState(true);
    const [paymentSearch, setPaymentSearch] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [paymentsPage, setPaymentsPage] = useState(1);

    // ── Transactions State ──
    const [transactions, setTransactions] = useState([]);
    const [transactionsMeta, setTransactionsMeta] = useState({});
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const [txTypeFilter, setTxTypeFilter] = useState('all');
    const [txStatusFilter, setTxStatusFilter] = useState('all');
    const [transactionsPage, setTransactionsPage] = useState(1);

    // ── Modals & Actions ──
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedTxPayload, setSelectedTxPayload] = useState(null);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Fetch Payments
    useEffect(() => {
        if (activeTab === 'payments') {
            fetchPayments();
        }
    }, [activeTab, paymentsPage, paymentStatusFilter, paymentMethodFilter, paymentSearch]);

    // Fetch Transactions
    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        }
    }, [activeTab, transactionsPage, txTypeFilter, txStatusFilter]);

    const fetchPayments = async () => {
        setPaymentsLoading(true);
        try {
            const params = { page: paymentsPage, per_page: 12 };
            if (paymentStatusFilter !== 'all') params.status = paymentStatusFilter;
            if (paymentMethodFilter !== 'all') params.payment_method = paymentMethodFilter;
            if (paymentSearch.trim()) params.search = paymentSearch.trim();

            const res = await api.get('/payments', { params });
            setPayments(res.data.data || []);
            setPaymentsMeta(res.data);
        } catch (err) {
            console.error('Error fetching payments:', err);
        } finally {
            setPaymentsLoading(false);
        }
    };

    const fetchTransactions = async () => {
        setTransactionsLoading(true);
        try {
            const params = { page: transactionsPage, per_page: 15 };
            if (txTypeFilter !== 'all') params.type = txTypeFilter;
            if (txStatusFilter !== 'all') params.status = txStatusFilter;

            const res = await api.get('/transactions', { params });
            setTransactions(res.data.data || []);
            setTransactionsMeta(res.data);
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setTransactionsLoading(false);
        }
    };

    const handleUpdateStatus = async (paymentId, newStatus) => {
        setActionLoading(true);
        try {
            const res = await api.patch(`/payments/${paymentId}/status`, { status: newStatus });
            setActionMessage({ type: 'success', text: `Invoice marked as ${newStatus}` });
            fetchPayments();
            if (selectedPayment && selectedPayment.id === paymentId) {
                setSelectedPayment(res.data.payment);
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: err.response?.data?.message || 'Status update failed' });
        } finally {
            setActionLoading(false);
            setTimeout(() => setActionMessage(null), 3500);
        }
    };

    const handleRefundSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPayment) return;
        setActionLoading(true);
        try {
            const payload = {};
            if (refundAmount) payload.amount = parseFloat(refundAmount);
            if (refundReason) payload.reason = refundReason;

            const res = await api.post(`/payments/${selectedPayment.id}/refund`, payload);
            setActionMessage({ type: 'success', text: res.data?.message || 'Refund successfully processed' });
            setShowRefundModal(false);
            setRefundAmount('');
            setRefundReason('');
            fetchPayments();
            if (selectedPayment) {
                const refreshed = await api.get(`/payments/${selectedPayment.id}`);
                setSelectedPayment(refreshed.data);
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: err.response?.data?.message || 'Refund failed' });
        } finally {
            setActionLoading(false);
            setTimeout(() => setActionMessage(null), 4000);
        }
    };

    const copyText = (text, id) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Derived Statistics
    const paidTotal = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const pendingTotal = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const refundedTotal = payments
        .filter(p => p.status === 'refunded')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    return (
        <div style={{ fontFamily: fonts.body, maxWidth: 1440, margin: '0 auto' }}>
            {/* Action Feedback Banner */}
            {actionMessage && (
                <div style={{
                    position: 'fixed',
                    top: 24,
                    right: 28,
                    zIndex: 9999,
                    background: actionMessage.type === 'success' ? '#059669' : '#dc2626',
                    color: '#fff',
                    padding: '12px 20px',
                    borderRadius: 12,
                    fontSize: 13.5,
                    fontWeight: 600,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    animation: 'fadeIn 0.2s ease-out',
                }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        {actionMessage.type === 'success' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        )}
                    </svg>
                    <span>{actionMessage.text}</span>
                </div>
            )}

            {/* Top Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 24,
            }}>
                <div>
                    <h1 style={pageTitle}>Billing & Transactions</h1>
                    <p style={pageSubtitle}>Overview of payment gateways, customer invoices, and real-time ledger entries</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={() => { if (activeTab === 'payments') fetchPayments(); else fetchTransactions(); }}
                        style={outlineBtn}
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                marginBottom: 24,
            }}>
                {/* Total Paid */}
                <div style={{ ...card, padding: '20px 22px', borderLeft: '4px solid #059669' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Collected Revenue
                        </span>
                        <span style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#d1fae5',
                            color: '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading }}>
                        AED {paidTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 4 }}>
                        From settled invoices
                    </div>
                </div>

                {/* Pending */}
                <div style={{ ...card, padding: '20px 22px', borderLeft: '4px solid #d97706' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Pending Invoices
                        </span>
                        <span style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#fef3c7',
                            color: '#d97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading }}>
                        {pendingCount} <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>({`AED ${pendingTotal.toFixed(2)}`})</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600, marginTop: 4 }}>
                        Awaiting customer checkout / cash
                    </div>
                </div>

                {/* Total Count */}
                <div style={{ ...card, padding: '20px 22px', borderLeft: '4px solid #2563eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Total Records
                        </span>
                        <span style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#dbeafe',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading }}>
                        {paymentsMeta.total ?? payments.length} Invoices
                    </div>
                    <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, marginTop: 4 }}>
                        All tracked bookings
                    </div>
                </div>

                {/* Refunded */}
                <div style={{ ...card, padding: '20px 22px', borderLeft: '4px solid #7c3aed' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Refunds & Reversals
                        </span>
                        <span style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#ede9fe',
                            color: '#7c3aed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading }}>
                        AED {refundedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600, marginTop: 4 }}>
                        Reversed transactions
                    </div>
                </div>
            </div>

            {/* Navigation Tabs Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderBottom: `2px solid ${brand.border}`,
                marginBottom: 20,
            }}>
                <button
                    onClick={() => { setActiveTab('payments'); setPaymentsPage(1); }}
                    style={{
                        padding: '12px 18px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'payments' ? `3px solid ${brand.royal}` : '3px solid transparent',
                        color: activeTab === 'payments' ? brand.navy : '#64748b',
                        fontSize: 14,
                        fontWeight: activeTab === 'payments' ? 800 : 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: -2,
                        transition: 'all 0.15s',
                    }}
                >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Invoices & Payments
                    <span style={{
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 11,
                        background: activeTab === 'payments' ? '#dbeafe' : '#f1f5f9',
                        color: activeTab === 'payments' ? '#1e40af' : '#64748b',
                        fontWeight: 700,
                    }}>
                        {paymentsMeta.total ?? payments.length}
                    </span>
                </button>

                <button
                    onClick={() => { setActiveTab('transactions'); setTransactionsPage(1); }}
                    style={{
                        padding: '12px 18px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'transactions' ? `3px solid ${brand.royal}` : '3px solid transparent',
                        color: activeTab === 'transactions' ? brand.navy : '#64748b',
                        fontSize: 14,
                        fontWeight: activeTab === 'transactions' ? 800 : 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: -2,
                        transition: 'all 0.15s',
                    }}
                >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Transactions Ledger
                    <span style={{
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 11,
                        background: activeTab === 'transactions' ? '#dbeafe' : '#f1f5f9',
                        color: activeTab === 'transactions' ? '#1e40af' : '#64748b',
                        fontWeight: 700,
                    }}>
                        {transactionsMeta.total ?? transactions.length}
                    </span>
                </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                TAB 1: INVOICES & PAYMENTS (Neat, clean, fitted table)
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'payments' && (
                <div>
                    {/* Search & Filters */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginBottom: 16,
                    }}>
                        <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 280, maxWidth: 460 }}>
                            <div style={{ ...searchBar, width: '100%', maxWidth: '100%' }}>
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by reference, client, or external ID..."
                                    value={paymentSearch}
                                    onChange={(e) => { setPaymentSearch(e.target.value); setPaymentsPage(1); }}
                                    style={searchInput}
                                />
                                {paymentSearch && (
                                    <button
                                        onClick={() => { setPaymentSearch(''); setPaymentsPage(1); }}
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <select
                                value={paymentStatusFilter}
                                onChange={(e) => { setPaymentStatusFilter(e.target.value); setPaymentsPage(1); }}
                                style={{ ...selectStyle, width: 'auto', padding: '9px 14px', fontSize: 13 }}
                            >
                                {PAYMENT_STATUSES.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>

                            <select
                                value={paymentMethodFilter}
                                onChange={(e) => { setPaymentMethodFilter(e.target.value); setPaymentsPage(1); }}
                                style={{ ...selectStyle, width: 'auto', padding: '9px 14px', fontSize: 13 }}
                            >
                                {PAYMENT_METHODS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table Card Container with Horizontal Scroll Barrier */}
                    <div style={{ ...card, overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                minWidth: 980,
                                borderCollapse: 'collapse',
                                textAlign: 'left',
                            }}>
                                <thead>
                                    <tr style={{
                                        background: brand.softBg,
                                        borderBottom: `1px solid ${brand.border}`,
                                    }}>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '18%' }}>
                                            Invoice / Reference
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '24%' }}>
                                            Client & Booking
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '18%' }}>
                                            Payment Method
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '13%' }}>
                                            Amount
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '13%' }}>
                                            Status
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '14%', textAlign: 'right' }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentsLoading ? (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                                                Loading invoices...
                                            </td>
                                        </tr>
                                    ) : payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '56px 20px', textAlign: 'center' }}>
                                                <div style={{ fontWeight: 700, color: brand.navy, fontSize: 15, marginBottom: 4 }}>
                                                    No invoices match your filters
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: 13 }}>
                                                    Try clearing your search query or selecting "All Statuses".
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((p, idx) => {
                                            const clientName = p.client?.name || 'Customer';
                                            const initials = clientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                            const color = avatarColors[idx % avatarColors.length];
                                            const isSelected = selectedPayment?.id === p.id;

                                            return (
                                                <tr
                                                    key={p.id}
                                                    onClick={() => setSelectedPayment(p)}
                                                    style={{
                                                        borderBottom: '1px solid #f1f5f9',
                                                        cursor: 'pointer',
                                                        background: isSelected ? '#f8fafc' : '#fff',
                                                        transition: 'background 0.12s ease',
                                                    }}
                                                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#fcfdfe'; }}
                                                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '#fff'; }}
                                                >
                                                    {/* Reference & Date */}
                                                    <td style={{ padding: '14px 18px' }}>
                                                        <div style={{ fontWeight: 700, color: brand.navy, fontSize: 13.5 }}>
                                                            {p.reference_number}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                                                            {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            {p.external_reference && ` • ${p.external_reference}`}
                                                        </div>
                                                    </td>

                                                    {/* Client & Booking */}
                                                    <td style={{ padding: '14px 18px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <div style={{
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: 8,
                                                                background: color,
                                                                color: '#fff',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                flexShrink: 0,
                                                            }}>
                                                                {initials}
                                                            </div>
                                                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                                                <div style={{ fontWeight: 600, color: brand.navy, fontSize: 13, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                                    {clientName}
                                                                </div>
                                                                <div style={{ fontSize: 11.5, color: brand.royal, fontWeight: 600 }}>
                                                                    Booking #{p.booking_id}
                                                                    {p.booking?.service?.name ? ` • ${p.booking.service.name}` : ''}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Method */}
                                                    <td style={{ padding: '14px 18px' }}>
                                                        <MethodBadge method={p.payment_method} />
                                                    </td>

                                                    {/* Amount */}
                                                    <td style={{ padding: '14px 18px' }}>
                                                        <div style={{ fontWeight: 800, color: brand.navy, fontSize: 14, fontFamily: fonts.heading }}>
                                                            AED {parseFloat(p.amount).toFixed(2)}
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td style={{ padding: '14px 18px' }}>
                                                        <PaymentStatusBadge status={p.status} />
                                                    </td>

                                                    {/* Actions */}
                                                    <td style={{ padding: '14px 18px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                                                            <button
                                                                onClick={() => setSelectedPayment(p)}
                                                                style={{
                                                                    padding: '5px 10px',
                                                                    borderRadius: 8,
                                                                    border: '1px solid #e2e8f0',
                                                                    background: '#fff',
                                                                    color: brand.navy,
                                                                    fontSize: 12,
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                View
                                                            </button>
                                                            {p.payment_link && (
                                                                <button
                                                                    onClick={() => copyText(p.payment_link, p.id)}
                                                                    title="Copy Checkout Link"
                                                                    style={{
                                                                        padding: '5px 8px',
                                                                        borderRadius: 8,
                                                                        border: '1px solid #bfdbfe',
                                                                        background: copiedId === p.id ? '#059669' : '#eff6ff',
                                                                        color: copiedId === p.id ? '#fff' : '#1e40af',
                                                                        fontSize: 11,
                                                                        fontWeight: 700,
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 4,
                                                                        transition: 'all 0.15s',
                                                                    }}
                                                                >
                                                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                                    </svg>
                                                                    {copiedId === p.id ? 'Copied' : 'Link'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {paymentsMeta.last_page > 1 && (
                            <div style={{
                                padding: '14px 20px',
                                background: brand.softBg,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderTop: `1px solid ${brand.border}`,
                                fontSize: 12.5,
                                color: '#64748b',
                            }}>
                                <div>
                                    Showing <strong>{paymentsMeta.from || 1}</strong> to <strong>{paymentsMeta.to || payments.length}</strong> of <strong>{paymentsMeta.total}</strong> invoices
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        disabled={paymentsPage <= 1}
                                        onClick={() => setPaymentsPage(p => Math.max(1, p - 1))}
                                        style={{ ...outlineBtn, padding: '6px 14px', fontSize: 12, opacity: paymentsPage <= 1 ? 0.5 : 1 }}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        disabled={paymentsPage >= paymentsMeta.last_page}
                                        onClick={() => setPaymentsPage(p => p + 1)}
                                        style={{ ...outlineBtn, padding: '6px 14px', fontSize: 12, opacity: paymentsPage >= paymentsMeta.last_page ? 0.5 : 1 }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB 2: TRANSACTIONS LEDGER (Neat, clean audit log)
               ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'transactions' && (
                <div>
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                        <select
                            value={txTypeFilter}
                            onChange={(e) => { setTxTypeFilter(e.target.value); setTransactionsPage(1); }}
                            style={{ ...selectStyle, width: 'auto', padding: '9px 14px', fontSize: 13 }}
                        >
                            {TX_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>

                        <select
                            value={txStatusFilter}
                            onChange={(e) => { setTxStatusFilter(e.target.value); setTransactionsPage(1); }}
                            style={{ ...selectStyle, width: 'auto', padding: '9px 14px', fontSize: 13 }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="success">Success</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    {/* Table Card Container */}
                    <div style={{ ...card, overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                minWidth: 960,
                                borderCollapse: 'collapse',
                                textAlign: 'left',
                            }}>
                                <thead>
                                    <tr style={{
                                        background: brand.softBg,
                                        borderBottom: `1px solid ${brand.border}`,
                                    }}>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '8%' }}>
                                            Tx ID
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '18%' }}>
                                            Payment Ref
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '12%' }}>
                                            Type
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '13%' }}>
                                            Amount
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '11%' }}>
                                            Status
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '22%' }}>
                                            Description & Processed By
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '16%' }}>
                                            Timestamp
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactionsLoading ? (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                                                Loading transaction ledger...
                                            </td>
                                        </tr>
                                    ) : transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '56px 20px', textAlign: 'center' }}>
                                                <div style={{ fontWeight: 700, color: brand.navy, fontSize: 15, marginBottom: 4 }}>
                                                    No transactions recorded yet
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: 13 }}>
                                                    Transactions log automatically when payments or refunds are executed.
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx) => (
                                            <tr
                                                key={tx.id}
                                                style={{
                                                    borderBottom: '1px solid #f1f5f9',
                                                    fontSize: 13,
                                                }}
                                            >
                                                {/* ID */}
                                                <td style={{ padding: '14px 18px', fontWeight: 700, color: '#64748b' }}>
                                                    #{tx.id}
                                                </td>

                                                {/* Payment Ref */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ fontWeight: 700, color: brand.navy, fontSize: 13 }}>
                                                        {tx.payment?.reference_number || `Payment #${tx.payment_id}`}
                                                    </div>
                                                    {tx.payment?.client?.name && (
                                                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                                                            {tx.payment.client.name}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Type */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <TxTypeBadge type={tx.type} />
                                                </td>

                                                {/* Amount */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <span style={{
                                                        fontWeight: 800,
                                                        fontFamily: fonts.heading,
                                                        color: tx.type === 'refund' ? '#dc2626' : '#059669',
                                                    }}>
                                                        {tx.type === 'refund' ? '-' : '+'}AED {parseFloat(tx.amount).toFixed(2)}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <TxStatusBadge status={tx.status} />
                                                </td>

                                                {/* Description */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ color: '#334155', fontWeight: 500, fontSize: 12.5 }}>
                                                        {tx.description || 'System processed'}
                                                    </div>
                                                    {tx.processed_by?.name && (
                                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                                                            by {tx.processed_by.name}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Timestamp & Gateway link */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ color: '#64748b', fontSize: 12 }}>
                                                        {new Date(tx.created_at).toLocaleString('en-AE', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                    {tx.gateway_response && (
                                                        <button
                                                            onClick={() => setSelectedTxPayload(tx.gateway_response)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: brand.royal,
                                                                fontSize: 11,
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                padding: 0,
                                                                marginTop: 2,
                                                                textDecoration: 'underline',
                                                            }}
                                                        >
                                                            View Gateway Response ↗
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {transactionsMeta.last_page > 1 && (
                            <div style={{
                                padding: '14px 20px',
                                background: brand.softBg,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderTop: `1px solid ${brand.border}`,
                                fontSize: 12.5,
                                color: '#64748b',
                            }}>
                                <div>
                                    Showing <strong>{transactionsMeta.from || 1}</strong> to <strong>{transactionsMeta.to || transactions.length}</strong> of <strong>{transactionsMeta.total}</strong> transactions
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        disabled={transactionsPage <= 1}
                                        onClick={() => setTransactionsPage(p => Math.max(1, p - 1))}
                                        style={{ ...outlineBtn, padding: '6px 14px', fontSize: 12, opacity: transactionsPage <= 1 ? 0.5 : 1 }}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        disabled={transactionsPage >= transactionsMeta.last_page}
                                        onClick={() => setTransactionsPage(p => p + 1)}
                                        style={{ ...outlineBtn, padding: '6px 14px', fontSize: 12, opacity: transactionsPage >= transactionsMeta.last_page ? 0.5 : 1 }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                MODAL: INVOICE & PAYMENT DETAILS
               ══════════════════════════════════════════════════════════════ */}
            {selectedPayment && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(10, 35, 66, 0.55)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 18,
                        width: '100%',
                        maxWidth: 620,
                        maxHeight: '88vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 50px rgba(10,35,66,0.25)',
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                    Invoice Summary
                                </div>
                                <h2 style={{ fontSize: 18, fontWeight: 800, color: brand.navy, margin: '2px 0 0', fontFamily: fonts.heading }}>
                                    {selectedPayment.reference_number}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                style={{
                                    border: 'none',
                                    background: '#f1f5f9',
                                    borderRadius: '50%',
                                    width: 30,
                                    height: 30,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#64748b',
                                    fontSize: 14,
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px' }}>
                            {/* Summary 2x2 Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 16,
                                background: brand.softBg,
                                padding: '16px 20px',
                                borderRadius: 14,
                                marginBottom: 20,
                            }}>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Amount Due</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: brand.navy, fontFamily: fonts.heading, marginTop: 2 }}>
                                        AED {parseFloat(selectedPayment.amount).toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Current Status</div>
                                    <div style={{ marginTop: 4 }}>
                                        <PaymentStatusBadge status={selectedPayment.status} />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Customer</div>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: brand.navy, marginTop: 2 }}>
                                        {selectedPayment.client?.name || 'N/A'}
                                    </div>
                                    <div style={{ fontSize: 11.5, color: '#64748b' }}>
                                        {selectedPayment.client?.email || selectedPayment.client?.phone || 'No direct contact'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Booking Details</div>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: brand.royal, marginTop: 2 }}>
                                        Booking #{selectedPayment.booking_id}
                                    </div>
                                    <button
                                        onClick={() => navigate(`/admin/bookings/${selectedPayment.booking_id}`)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            color: brand.royal,
                                            fontSize: 11.5,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                        }}
                                    >
                                        Open Booking Page →
                                    </button>
                                </div>
                            </div>

                            {/* ADCB Pace Pay Checkout Link */}
                            {selectedPayment.payment_link && (
                                <div style={{
                                    border: '1px solid #bfdbfe',
                                    background: '#eff6ff',
                                    padding: '14px 16px',
                                    borderRadius: 12,
                                    marginBottom: 20,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1e40af' }}>
                                            ADCB Pace Pay Hosted Link
                                        </span>
                                        {selectedPayment.payment_link_expires_at && (
                                            <span style={{ fontSize: 10.5, color: '#60a5fa' }}>
                                                Expires: {new Date(selectedPayment.payment_link_expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        background: '#fff',
                                        padding: '6px 10px',
                                        borderRadius: 8,
                                        border: '1px solid #dbeafe',
                                    }}>
                                        <input
                                            type="text"
                                            readOnly
                                            value={selectedPayment.payment_link}
                                            style={{
                                                flex: 1,
                                                border: 'none',
                                                outline: 'none',
                                                fontSize: 12,
                                                color: '#1e3a8a',
                                                background: 'transparent',
                                            }}
                                        />
                                        <button
                                            onClick={() => copyText(selectedPayment.payment_link, 'modal')}
                                            style={{
                                                padding: '5px 10px',
                                                borderRadius: 6,
                                                background: copiedId === 'modal' ? '#059669' : brand.navy,
                                                color: '#fff',
                                                border: 'none',
                                                fontSize: 11,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {copiedId === 'modal' ? 'Copied' : 'Copy'}
                                        </button>
                                        <a
                                            href={selectedPayment.payment_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                padding: '5px 10px',
                                                borderRadius: 6,
                                                background: '#dbeafe',
                                                color: '#1e40af',
                                                textDecoration: 'none',
                                                fontSize: 11,
                                                fontWeight: 700,
                                            }}
                                        >
                                            Open ↗
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Management Actions */}
                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
                                    Actions
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {selectedPayment.status === 'pending' && (
                                        <>
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => handleUpdateStatus(selectedPayment.id, 'paid')}
                                                style={{ ...solidBtn, background: '#059669', padding: '8px 16px', fontSize: 12.5 }}
                                            >
                                                ✓ Mark as Paid
                                            </button>
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => handleUpdateStatus(selectedPayment.id, 'failed')}
                                                style={{ ...outlineBtn, color: '#dc2626', borderColor: '#fecaca', padding: '8px 16px', fontSize: 12.5 }}
                                            >
                                                ✕ Mark as Failed
                                            </button>
                                        </>
                                    )}

                                    {selectedPayment.status === 'paid' && (
                                        <button
                                            onClick={() => setShowRefundModal(true)}
                                            style={{ ...outlineBtn, color: '#7c3aed', borderColor: '#ddd6fe', background: '#f5f3ff', padding: '8px 16px', fontSize: 12.5 }}
                                        >
                                            ↩ Process Refund
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                MODAL: PROCESS REFUND
               ══════════════════════════════════════════════════════════════ */}
            {showRefundModal && selectedPayment && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(10, 35, 66, 0.65)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 18,
                        width: '100%',
                        maxWidth: 460,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                        padding: 24,
                    }}>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: brand.navy, margin: '0 0 4px', fontFamily: fonts.heading }}>
                            Issue Customer Refund
                        </h3>
                        <p style={{ color: '#64748b', fontSize: 12.5, margin: '0 0 16px' }}>
                            Refunding invoice <strong>{selectedPayment.reference_number}</strong> (Max: AED {parseFloat(selectedPayment.amount).toFixed(2)})
                        </p>

                        <form onSubmit={handleRefundSubmit}>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: brand.navy, marginBottom: 5 }}>
                                    Refund Amount (AED)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={selectedPayment.amount}
                                    placeholder={parseFloat(selectedPayment.amount).toFixed(2)}
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    style={inputStyle}
                                />
                                <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 3 }}>
                                    Leave blank to refund full amount (AED {parseFloat(selectedPayment.amount).toFixed(2)})
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: brand.navy, marginBottom: 5 }}>
                                    Reason for Refund
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Customer cancellation, reschedule, service dissatisfaction..."
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowRefundModal(false)}
                                    style={{ ...outlineBtn, padding: '8px 16px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    style={{ ...solidBtn, background: '#dc2626', padding: '8px 18px' }}
                                >
                                    {actionLoading ? 'Processing...' : 'Confirm Refund'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                MODAL: GATEWAY JSON PAYLOAD INSPECTOR
               ══════════════════════════════════════════════════════════════ */}
            {selectedTxPayload && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(10, 35, 66, 0.65)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                }}>
                    <div style={{
                        background: '#0f172a',
                        color: '#f8fafc',
                        borderRadius: 16,
                        width: '100%',
                        maxWidth: 580,
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    }}>
                        <div style={{
                            padding: '14px 18px',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#93c5fd' }}>
                                Gateway Response Payload
                            </span>
                            <button
                                onClick={() => setSelectedTxPayload(null)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    fontSize: 16,
                                    cursor: 'pointer',
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
                            <pre style={{
                                margin: 0,
                                fontSize: 12,
                                fontFamily: 'monospace',
                                color: '#a7f3d0',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                            }}>
                                {JSON.stringify(selectedTxPayload, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Badges ─────────────────────────────────────────────── */

function PaymentStatusBadge({ status }) {
    const map = {
        paid: { bg: '#d1fae5', color: '#059669', label: 'Paid' },
        pending: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
        failed: { bg: '#fee2e2', color: '#dc2626', label: 'Failed' },
        refunded: { bg: '#ede9fe', color: '#7c3aed', label: 'Refunded' },
        expired: { bg: '#f1f5f9', color: '#64748b', label: 'Expired' },
    };
    const s = map[status] || map.pending;
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 700,
            background: s.bg,
            color: s.color,
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
            {s.label}
        </span>
    );
}

function MethodBadge({ method }) {
    const map = {
        adcb_pace_pay: { label: 'ADCB Pace Pay', bg: '#eff6ff', color: '#1e40af' },
        card: { label: 'Card Payment', bg: '#f0fdf4', color: '#15803d' },
        bank_transfer: { label: 'Bank Transfer', bg: '#faf5ff', color: '#7e22ce' },
        cash: { label: 'Cash on Delivery', bg: '#fff7ed', color: '#c2410c' },
    };
    const m = map[method] || { label: method || 'Unknown', bg: '#f1f5f9', color: '#475569' };
    return (
        <span style={{
            display: 'inline-block',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 700,
            background: m.bg,
            color: m.color,
            whiteSpace: 'nowrap',
        }}>
            {m.label}
        </span>
    );
}

function TxTypeBadge({ type }) {
    const isRefund = type === 'refund';
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: 10.5,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            background: isRefund ? '#fee2e2' : '#dbeafe',
            color: isRefund ? '#dc2626' : '#1e40af',
            whiteSpace: 'nowrap',
        }}>
            {type}
        </span>
    );
}

function TxStatusBadge({ status }) {
    const map = {
        success: { color: '#059669', label: 'Success', bg: '#d1fae5' },
        failed: { color: '#dc2626', label: 'Failed', bg: '#fee2e2' },
        pending: { color: '#d97706', label: 'Pending', bg: '#fef3c7' },
    };
    const s = map[status] || map.pending;
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 7px',
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 700,
            color: s.color,
            background: s.bg,
            whiteSpace: 'nowrap',
        }}>
            {s.label}
        </span>
    );
}
