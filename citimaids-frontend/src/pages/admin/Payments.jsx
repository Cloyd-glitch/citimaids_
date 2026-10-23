import { useState, useEffect, useMemo } from 'react';
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

const PAYMENT_STATUSES = [
    { value: 'all', label: 'All Statuses' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
];

const TX_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: 'charge', label: 'Charge' },
    { value: 'refund', label: 'Refund' },
    { value: 'void', label: 'Void' },
];

const avatarColors = ['#1E3A8A', '#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];

/**
 * Visual keyword highlighter component.
 * Case-insensitively wraps matching substrings in an amber highlight mark.
 */
function HighlightText({ text, query }) {
    if (!query || !query.trim() || text === null || text === undefined) {
        return text ?? null;
    }
    const str = String(text);
    const trimmed = query.trim();
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = str.split(regex);

    if (parts.length === 1) return str;

    return (
        <>
            {parts.map((part, index) =>
                part.toLowerCase() === trimmed.toLowerCase() ? (
                    <mark
                        key={index}
                        style={{
                            backgroundColor: '#e2e8f0',
                            color: '#1e293b',
                            borderRadius: '3px',
                            padding: '1px 3px',
                            fontWeight: 600,
                        }}
                    >
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
}

/**
 * Relevance scoring helper to prioritize matching items to top.
 */
function getMatchScore(item, query, fields) {
    if (!query || !query.trim() || !item) return 0;
    const q = query.trim().toLowerCase();
    let score = 0;

    for (const { getVal, priority } of fields) {
        const val = getVal(item);
        if (val === null || val === undefined) continue;
        const str = String(val).toLowerCase();
        if (str === q) {
            score = Math.max(score, priority * 3);
        } else if (str.startsWith(q)) {
            score = Math.max(score, priority * 2);
        } else if (str.includes(q)) {
            score = Math.max(score, priority);
        }
    }
    return score;
}

const invoiceSearchFields = [
    { getVal: p => p.reference_number, priority: 10 },
    { getVal: p => p.client?.name, priority: 8 },
    { getVal: p => p.external_reference, priority: 7 },
    { getVal: p => `Booking #${p.booking_id}`, priority: 6 },
    { getVal: p => p.booking?.service?.name, priority: 5 },
    { getVal: p => p.amount, priority: 4 },
    { getVal: p => p.status, priority: 3 },
];

const transactionSearchFields = [
    { getVal: tx => `#${tx.id}`, priority: 10 },
    { getVal: tx => tx.id, priority: 10 },
    { getVal: tx => tx.payment?.reference_number, priority: 9 },
    { getVal: tx => tx.payment?.client?.name, priority: 8 },
    { getVal: tx => tx.description, priority: 6 },
    { getVal: tx => tx.amount, priority: 5 },
    { getVal: tx => tx.status, priority: 4 },
    { getVal: tx => tx.type, priority: 4 },
    { getVal: tx => tx.processed_by?.name, priority: 3 },
];

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
    const [paymentsPage, setPaymentsPage] = useState(1);
    const [invoiceSortOrder, setInvoiceSortOrder] = useState('desc');

    // ── Transactions State ──
    const [transactions, setTransactions] = useState([]);
    const [transactionsMeta, setTransactionsMeta] = useState({});
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const [txSearch, setTxSearch] = useState('');
    const [txTypeFilter, setTxTypeFilter] = useState('all');
    const [txStatusFilter, setTxStatusFilter] = useState('all');
    const [transactionsPage, setTransactionsPage] = useState(1);
    const [txSortOrder, setTxSortOrder] = useState('desc');

    // ── Modals & Actions ──
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [selectedTxPayload, setSelectedTxPayload] = useState(null);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');
    const [statusMenuTarget, setStatusMenuTarget] = useState(null);
    const [statusMenuPos, setStatusMenuPos] = useState({ top: 0, right: 0 });
    const [detailEditItem, setDetailEditItem] = useState(null);
    const [detailEditLoading, setDetailEditLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const [refreshHovered, setRefreshHovered] = useState(false);

    // Fetch Payments
    useEffect(() => {
        if (activeTab === 'payments') {
            fetchPayments();
        }
    }, [activeTab, paymentsPage, paymentStatusFilter, paymentSearch]);

    // Fetch Transactions
    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        }
    }, [activeTab, transactionsPage, txTypeFilter, txStatusFilter, txSearch]);

    const fetchPayments = async () => {
        setPaymentsLoading(true);
        try {
            const params = { page: paymentsPage, per_page: 12 };
            if (paymentStatusFilter !== 'all') params.status = paymentStatusFilter;
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
            if (txSearch.trim()) params.search = txSearch.trim();

            const res = await api.get('/transactions', { params });
            setTransactions(res.data.data || []);
            setTransactionsMeta(res.data);
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setTransactionsLoading(false);
        }
    };

    // ── Prioritize Matching Items & Sort by Timestamp ──
    const prioritizedPayments = useMemo(() => {
        return [...payments].sort((a, b) => {
            const scoreA = getMatchScore(a, paymentSearch, invoiceSearchFields);
            const scoreB = getMatchScore(b, paymentSearch, invoiceSearchFields);
            if (scoreB !== scoreA) {
                return scoreB - scoreA; // Matching items moved to top
            }
            const timeA = new Date(a.created_at || 0).getTime();
            const timeB = new Date(b.created_at || 0).getTime();
            return invoiceSortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });
    }, [payments, paymentSearch, invoiceSortOrder]);

    const prioritizedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => {
            const scoreA = getMatchScore(a, txSearch, transactionSearchFields);
            const scoreB = getMatchScore(b, txSearch, transactionSearchFields);
            if (scoreB !== scoreA) {
                return scoreB - scoreA; // Matching items moved to top
            }
            const timeA = new Date(a.created_at || 0).getTime();
            const timeB = new Date(b.created_at || 0).getTime();
            return txSortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });
    }, [transactions, txSearch, txSortOrder]);

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

    const handleEditClick = (item, type = 'payment', e) => {
        if (e) e.stopPropagation();
        const status = (item.status || '').toLowerCase();
        if (status === 'paid' || status === 'success') {
            handleOpenDetailEdit(item, type);
        } else {
            if (statusMenuTarget && statusMenuTarget.item?.id === item.id && statusMenuTarget.type === type) {
                setStatusMenuTarget(null);
                return;
            }
            const rect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const top = spaceBelow < 150 ? Math.max(10, rect.top - 120) : rect.bottom + 6;
            const right = Math.max(16, window.innerWidth - rect.right);

            setStatusMenuPos({ top, right });
            setStatusMenuTarget({ type, item });
        }
    };

    // Update transaction status (success, failed, pending)
    const handleUpdateTransactionStatus = async (txId, newStatus) => {
        setActionLoading(true);
        try {
            const res = await api.patch(`/transactions/${txId}/status`, { status: newStatus });
            setActionMessage({ type: 'success', text: `Transaction #${txId} status updated to ${newStatus}` });
            fetchTransactions();
            fetchPayments();
            if (selectedTransaction && selectedTransaction.id === txId) {
                setSelectedTransaction(res.data.transaction);
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update transaction status' });
        } finally {
            setActionLoading(false);
            setTimeout(() => setActionMessage(null), 3500);
        }
    };

    // Retry a failed payment
    const handleRetryPayment = async (payment) => {
        setActionLoading(true);
        try {
            const failedTx = payment.transactions?.find(t => t.type === 'charge' && t.status === 'failed');
            if (failedTx) {
                const res = await api.post(`/transactions/${failedTx.id}/retry`);
                setActionMessage({ type: 'success', text: res.data?.message || `Payment ${payment.reference_number} retry initiated` });
            } else {
                const res = await api.patch(`/payments/${payment.id}/status`, { status: 'pending' });
                setActionMessage({ type: 'success', text: `Payment ${payment.reference_number} status reset to pending` });
            }
            fetchPayments();
            fetchTransactions();
        } catch (err) {
            setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to retry payment' });
        } finally {
            setActionLoading(false);
            setTimeout(() => setActionMessage(null), 3500);
        }
    };

    // Open detail editing form for paid/success items
    const handleOpenDetailEdit = (item, type = 'payment') => {
        setStatusMenuTarget(null);
        if (type === 'payment') {
            const chargeTx = item.transactions?.find(t => t.type === 'charge');
            setDetailEditItem({
                type: 'payment',
                id: item.id,
                reference_number: item.reference_number || '',
                external_reference: item.external_reference || '',
                description: chargeTx?.description || item.booking?.service?.name || '',
                notes: item.notes || '',
                amount: item.amount,
                clientName: item.client?.name || '',
            });
        } else {
            setDetailEditItem({
                type: 'transaction',
                id: item.id,
                reference_number: item.payment?.reference_number || '',
                external_reference: item.gateway_response?.reference || '',
                description: item.description || '',
                notes: item.payment?.notes || '',
                amount: item.amount,
                clientName: item.payment?.client?.name || '',
            });
        }
    };

    // Save edited details
    const handleSaveDetailEdit = async (e) => {
        e.preventDefault();
        if (!detailEditItem) return;
        setDetailEditLoading(true);
        try {
            if (detailEditItem.type === 'payment') {
                const res = await api.put(`/payments/${detailEditItem.id}`, {
                    reference_number: detailEditItem.reference_number,
                    external_reference: detailEditItem.external_reference,
                    description: detailEditItem.description,
                    notes: detailEditItem.notes,
                });
                setActionMessage({ type: 'success', text: 'Invoice details updated successfully' });
                fetchPayments();
                fetchTransactions();
                if (selectedPayment && selectedPayment.id === detailEditItem.id) {
                    setSelectedPayment(res.data.payment);
                }
            } else {
                const res = await api.put(`/transactions/${detailEditItem.id}`, {
                    reference_number: detailEditItem.reference_number,
                    description: detailEditItem.description,
                    notes: detailEditItem.notes,
                });
                setActionMessage({ type: 'success', text: 'Transaction details updated successfully' });
                fetchTransactions();
                fetchPayments();
                if (selectedTransaction && selectedTransaction.id === detailEditItem.id) {
                    setSelectedTransaction(res.data.transaction);
                }
            }
            setDetailEditItem(null);
        } catch (err) {
            setActionMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to update details',
            });
        } finally {
            setDetailEditLoading(false);
            setTimeout(() => setActionMessage(null), 3500);
        }
    };

    // Retry a failed transaction
    const handleRetryTransaction = async (txId) => {
        setActionLoadingId(txId);
        try {
            const res = await api.post(`/transactions/${txId}/retry`);
            setActionMessage({ type: 'success', text: res.data?.message || `Transaction #${txId} retry initiated` });
            fetchTransactions();
            fetchPayments();
            if (selectedTransaction && selectedTransaction.id === txId) {
                setSelectedTransaction(res.data.transaction);
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to retry transaction' });
        } finally {
            setActionLoadingId(null);
            setTimeout(() => setActionMessage(null), 3500);
        }
    };

    // Dismiss / Remove a failed transaction
    const handleDismissTransaction = async (txId) => {
        if (!window.confirm(`Are you sure you want to dismiss and remove failed transaction #${txId}?`)) {
            return;
        }
        setActionLoadingId(txId);
        try {
            const res = await api.delete(`/transactions/${txId}`);
            setActionMessage({ type: 'success', text: res.data?.message || `Transaction #${txId} dismissed and removed` });
            fetchTransactions();
            fetchPayments();
            if (selectedTransaction && selectedTransaction.id === txId) {
                setSelectedTransaction(null);
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to dismiss transaction' });
        } finally {
            setActionLoadingId(null);
            setTimeout(() => setActionMessage(null), 3500);
        }
    };

    // Dismiss a failed payment invoice
    const handleDismissPayment = async (paymentId) => {
        if (!window.confirm('Are you sure you want to dismiss and remove this failed invoice?')) {
            return;
        }
        setActionLoading(true);
        try {
            const res = await api.delete(`/payments/${paymentId}`);
            setActionMessage({ type: 'success', text: res.data?.message || 'Failed invoice dismissed and removed' });
            fetchPayments();
            fetchTransactions();
            if (selectedPayment && selectedPayment.id === paymentId) {
                setSelectedPayment(null);
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to dismiss payment' });
        } finally {
            setActionLoading(false);
            setTimeout(() => setActionMessage(null), 3500);
        }
    };

    // Direct Receipt HTML File Download
    const handleDirectDownloadReceipt = (tx) => {
        const receiptNum = `RCP-${String(tx.id).padStart(6, '0')}`;
        const clientName = tx.payment?.client?.name || 'Valued Customer';
        const clientPhone = tx.payment?.client?.phone || 'N/A';
        const clientEmail = tx.payment?.client?.email || 'N/A';
        const serviceName = tx.payment?.booking?.service?.name || 'Professional Cleaning Service';
        const paymentRef = tx.payment?.reference_number || `TX-${tx.id}`;
        const amountNum = parseFloat(tx.amount || 0).toFixed(2);
        const dateStr = new Date(tx.created_at).toLocaleString('en-AE', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });

        const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CitiMaids Receipt ${receiptNum}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px; color: #0A2342; }
        .receipt-card { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0A2342; padding-bottom: 20px; margin-bottom: 24px; }
        .logo-title { font-size: 22px; font-weight: 800; color: #0A2342; letter-spacing: 0.5px; }
        .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
        .receipt-title { font-size: 13px; font-weight: 700; color: #2563eb; text-transform: uppercase; text-align: right; }
        .receipt-num { font-size: 18px; font-weight: 800; color: #0A2342; text-align: right; margin-top: 2px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; font-size: 13px; }
        .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .table th { background: #f8fafc; padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        .table td { padding: 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .total-box { background: #f8fafc; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .total-label { font-size: 14px; font-weight: 700; color: #0A2342; }
        .total-val { font-size: 22px; font-weight: 800; color: #0A2342; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge-success { background: #d1fae5; color: #059669; }
        .badge-failed { background: #fee2e2; color: #dc2626; }
        .badge-pending { background: #fef3c7; color: #d97706; }
        .footer { text-align: center; font-size: 11.5px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="receipt-card">
        <div class="header">
            <div>
                <div class="logo-title">CITIMAIDS</div>
                <div class="subtitle">CitiMaids Cleaning Services LLC • Dubai, UAE</div>
                <div class="subtitle">TRN: 100482910300003 • support@citimaids.ae</div>
            </div>
            <div>
                <div class="receipt-title">Official Receipt</div>
                <div class="receipt-num">${receiptNum}</div>
                <div class="subtitle" style="text-align: right; margin-top: 4px;">${dateStr}</div>
            </div>
        </div>

        <div class="grid-2">
            <div>
                <div class="label">Billed To</div>
                <div style="font-weight: 700;">${clientName}</div>
                <div style="color: #64748b; font-size: 12px;">${clientEmail}</div>
                <div style="color: #64748b; font-size: 12px;">${clientPhone}</div>
            </div>
            <div>
                <div class="label">Payment Details</div>
                <div><strong>Ref:</strong> ${paymentRef}</div>
                <div><strong>Type:</strong> ${tx.type ? tx.type.toUpperCase() : 'CHARGE'}</div>
                <div style="margin-top: 4px;">
                    <span class="badge ${tx.status === 'success' ? 'badge-success' : tx.status === 'failed' ? 'badge-failed' : 'badge-pending'}">${tx.status || 'PENDING'}</span>
                </div>
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Amount (AED)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div style="font-weight: 600;">${serviceName}</div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${tx.description || 'Service booking payment'}</div>
                    </td>
                    <td style="text-align: right; font-weight: 700;">AED ${amountNum}</td>
                </tr>
            </tbody>
        </table>

        <div class="total-box">
            <span class="total-label">Total Amount</span>
            <span class="total-val">AED ${amountNum}</span>
        </div>

        <div class="footer">
            Thank you for choosing CitiMaids! For any inquiries, please contact support@citimaids.ae<br/>
            Computer-generated receipt. No signature required.
        </div>
    </div>
</body>
</html>`;

        const blob = new Blob([receiptHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `CitiMaids_${receiptNum}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                        onMouseEnter={() => setRefreshHovered(true)}
                        onMouseLeave={() => setRefreshHovered(false)}
                        disabled={activeTab === 'payments' ? paymentsLoading : transactionsLoading}
                        style={{
                            ...outlineBtn,
                            background: refreshHovered ? '#eff6ff' : '#fff',
                            borderColor: refreshHovered ? '#93c5fd' : '#e2e8f0',
                            color: refreshHovered ? '#1d4ed8' : '#334155',
                            boxShadow: refreshHovered ? '0 4px 12px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
                            transform: refreshHovered ? 'translateY(-1px)' : 'translateY(0)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: (activeTab === 'payments' ? paymentsLoading : transactionsLoading) ? 'not-allowed' : 'pointer',
                            opacity: (activeTab === 'payments' ? paymentsLoading : transactionsLoading) ? 0.7 : 1,
                        }}
                    >
                        <svg
                            width="14"
                            height="14"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{
                                transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: (activeTab === 'payments' ? paymentsLoading : transactionsLoading)
                                    ? 'rotate(360deg)'
                                    : refreshHovered
                                    ? 'rotate(180deg)'
                                    : 'rotate(0deg)',
                                animation: (activeTab === 'payments' ? paymentsLoading : transactionsLoading)
                                    ? 'spin 0.8s linear infinite'
                                    : 'none',
                            }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {(activeTab === 'payments' ? paymentsLoading : transactionsLoading) ? 'Refreshing...' : 'Refresh'}
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

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
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
                                value={invoiceSortOrder}
                                onChange={(e) => setInvoiceSortOrder(e.target.value)}
                                style={{ ...selectStyle, width: 'auto', padding: '9px 14px', fontSize: 13 }}
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
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
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '24%' }}>
                                            Invoice / Reference
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '32%' }}>
                                            Client & Booking
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '16%' }}>
                                            Amount
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '14%' }}>
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
                                            <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                                                Loading invoices...
                                            </td>
                                        </tr>
                                    ) : prioritizedPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '56px 20px', textAlign: 'center' }}>
                                                <div style={{ fontWeight: 700, color: brand.navy, fontSize: 16, marginBottom: 4 }}>
                                                    {paymentSearch.trim() ? 'No match search' : 'No invoices found'}
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: 13 }}>
                                                    {paymentSearch.trim()
                                                        ? `No invoices matched "${paymentSearch}". Try adjusting your query or clearing the search.`
                                                        : 'Try clearing your search query or selecting "All Statuses".'}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        prioritizedPayments.map((p, idx) => {
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
                                                            <HighlightText text={p.reference_number} query={paymentSearch} />
                                                        </div>
                                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                                                            {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            {p.external_reference && (
                                                                <> • <HighlightText text={p.external_reference} query={paymentSearch} /></>
                                                            )}
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
                                                                    <HighlightText text={clientName} query={paymentSearch} />
                                                                </div>
                                                                <div style={{ fontSize: 11.5, color: brand.royal, fontWeight: 600 }}>
                                                                    Booking #<HighlightText text={p.booking_id} query={paymentSearch} />
                                                                    {p.booking?.service?.name && (
                                                                        <> • <HighlightText text={p.booking.service.name} query={paymentSearch} /></>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Amount */}
                                                    <td style={{ padding: '14px 18px' }}>
                                                        <div style={{ fontWeight: 800, color: brand.navy, fontSize: 14, fontFamily: fonts.heading }}>
                                                            AED <HighlightText text={parseFloat(p.amount).toFixed(2)} query={paymentSearch} />
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td style={{ padding: '14px 18px' }}>
                                                        <PaymentStatusBadge status={p.status} />
                                                    </td>

                                                    {/* Actions: ONLY two buttons per row (View and Edit) */}
                                                    <td style={{ padding: '14px 18px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                                                            {/* 1. View Button: Opens the read-only detail view */}
                                                            <ActionBtn
                                                                title="View Details"
                                                                isView
                                                                onClick={() => setSelectedPayment(p)}
                                                                icon={
                                                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                                                    </svg>
                                                                }
                                                            />

                                                            {/* 2. Edit Button: Triggers status management or detail edit */}
                                                            <ActionBtn
                                                                title="Edit Invoice"
                                                                onClick={(e) => handleEditClick(p, 'payment', e)}
                                                                icon={
                                                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                                    </svg>
                                                                }
                                                            />
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
                    {/* Search & Filters Alongside */}
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
                                    placeholder="Search by Tx ID, payment ref, client, or description..."
                                    value={txSearch}
                                    onChange={(e) => { setTxSearch(e.target.value); setTransactionsPage(1); }}
                                    style={searchInput}
                                />
                                {txSearch && (
                                    <button
                                        onClick={() => { setTxSearch(''); setTransactionsPage(1); }}
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
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

                            <select
                                value={txSortOrder}
                                onChange={(e) => setTxSortOrder(e.target.value)}
                                style={{ ...selectStyle, width: 'auto', padding: '9px 14px', fontSize: 13 }}
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    {/* Table Card Container */}
                    <div style={{ ...card, overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                minWidth: 1020,
                                borderCollapse: 'collapse',
                                textAlign: 'left',
                            }}>
                                <thead>
                                    <tr style={{
                                        background: brand.softBg,
                                        borderBottom: `1px solid ${brand.border}`,
                                    }}>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '7%' }}>
                                            Tx ID
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '16%' }}>
                                            Payment Ref
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '9%' }}>
                                            Type
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '12%' }}>
                                            Amount
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '9%' }}>
                                            Status
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '17%' }}>
                                            Description & Processed By
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '12%' }}>
                                            Timestamp
                                        </th>
                                        <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, width: '18%', textAlign: 'right' }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactionsLoading ? (
                                        <tr>
                                            <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                                                Loading transaction ledger...
                                            </td>
                                        </tr>
                                    ) : prioritizedTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ padding: '56px 20px', textAlign: 'center' }}>
                                                <div style={{ fontWeight: 700, color: brand.navy, fontSize: 15, marginBottom: 4 }}>
                                                    No transactions match your search or filters
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: 13 }}>
                                                    Try modifying your keyword query or resetting status and type filters.
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        prioritizedTransactions.map((tx) => (
                                            <tr
                                                key={tx.id}
                                                onClick={() => setSelectedTransaction(tx)}
                                                style={{
                                                    borderBottom: '1px solid #f1f5f9',
                                                    fontSize: 13,
                                                    cursor: 'pointer',
                                                    background: selectedTransaction?.id === tx.id ? '#f8fafc' : '#fff',
                                                    transition: 'background 0.12s ease',
                                                }}
                                                onMouseEnter={(e) => { if (selectedTransaction?.id !== tx.id) e.currentTarget.style.background = '#fcfdfe'; }}
                                                onMouseLeave={(e) => { if (selectedTransaction?.id !== tx.id) e.currentTarget.style.background = '#fff'; }}
                                            >
                                                {/* ID */}
                                                <td style={{ padding: '14px 18px', fontWeight: 700, color: '#64748b' }}>
                                                    #<HighlightText text={tx.id} query={txSearch} />
                                                </td>

                                                {/* Payment Ref */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ fontWeight: 700, color: brand.navy, fontSize: 13 }}>
                                                        <HighlightText text={tx.payment?.reference_number || `Payment #${tx.payment_id}`} query={txSearch} />
                                                    </div>
                                                    {tx.payment?.client?.name && (
                                                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                                                            <HighlightText text={tx.payment.client.name} query={txSearch} />
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
                                                        {tx.type === 'refund' ? '-' : '+'}AED <HighlightText text={parseFloat(tx.amount).toFixed(2)} query={txSearch} />
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <TxStatusBadge status={tx.status} />
                                                </td>

                                                {/* Description */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ color: '#334155', fontWeight: 500, fontSize: 12.5 }}>
                                                        <HighlightText text={tx.description || 'System processed'} query={txSearch} />
                                                    </div>
                                                    {tx.processed_by?.name && (
                                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                                                            by <HighlightText text={tx.processed_by.name} query={txSearch} />
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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedTxPayload(tx.gateway_response);
                                                            }}
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

                                                {/* Actions Column */}
                                                <td style={{ padding: '14px 18px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                                    <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                                                        <ActionBtn
                                                            title="View Transaction Details"
                                                            isView
                                                            onClick={() => setSelectedTransaction(tx)}
                                                            icon={
                                                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                                                </svg>
                                                            }
                                                        />
                                                    </div>
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

                                    {selectedPayment.status === 'failed' && (
                                        <>
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => handleDismissPayment(selectedPayment.id)}
                                                style={{ ...outlineBtn, color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2', padding: '8px 16px', fontSize: 12.5 }}
                                            >
                                                ✕ Dismiss
                                            </button>
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => handleUpdateStatus(selectedPayment.id, 'pending')}
                                                style={{ ...solidBtn, background: '#2563eb', padding: '8px 16px', fontSize: 12.5 }}
                                            >
                                                ↻ Retry Invoice
                                            </button>
                                        </>
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
                FLOATING STATUS ACTION MENU (Triggered by Edit button)
               ══════════════════════════════════════════════════════════════ */}
            {statusMenuPayment && (
                <>
                    {/* Transparent Click-away Backdrop */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setStatusMenuPayment(null);
                        }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 1100,
                            background: 'transparent',
                        }}
                    />

                    {/* Floating Status Action Popover */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            top: statusMenuPos.top,
                            right: statusMenuPos.right,
                            zIndex: 1150,
                            minWidth: 180,
                            background: '#ffffff',
                            borderRadius: 12,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 10px 25px -4px rgba(10, 35, 66, 0.16), 0 4px 10px -2px rgba(10, 35, 66, 0.08)',
                            padding: '6px',
                            animation: 'menuPop 0.15s ease',
                        }}
                    >
                        <div style={{
                            padding: '6px 10px 8px',
                            borderBottom: '1px solid #f1f5f9',
                            marginBottom: 4,
                        }}>
                            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                                Status Action
                            </div>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: brand.navy, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                <span>{statusMenuPayment.reference_number || `INV-${statusMenuPayment.id}`}</span>
                                <PaymentStatusBadge status={statusMenuPayment.status} />
                            </div>
                        </div>

                        {/* Conditional choices based on item status:
                            - Paid: Show Refund
                            - Pending: Show Paid and Dismiss
                            - Failed: Show Retry and Dismiss
                        */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {statusMenuPayment.status === 'paid' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const p = statusMenuPayment;
                                        setStatusMenuPayment(null);
                                        setSelectedPayment(p);
                                        setRefundAmount(p.amount);
                                        setShowRefundModal(true);
                                    }}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '7px 10px',
                                        borderRadius: 8,
                                        border: '1px solid #fde68a',
                                        background: '#fffbeb',
                                        color: '#b45309',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H4m0 0l3-3m-3 3l3 3m5 4h5a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                                    </svg>
                                    <span>Refund</span>
                                </button>
                            )}

                            {statusMenuPayment.status === 'pending' && (
                                <>
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={async () => {
                                            const id = statusMenuPayment.id;
                                            setStatusMenuPayment(null);
                                            await handleUpdateStatus(id, 'paid');
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '7px 10px',
                                            borderRadius: 8,
                                            border: '1px solid #bbf7d0',
                                            background: '#f0fdf4',
                                            color: '#15803d',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Paid</span>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={async () => {
                                            const id = statusMenuPayment.id;
                                            setStatusMenuPayment(null);
                                            await handleDismissPayment(id);
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '7px 10px',
                                            borderRadius: 8,
                                            border: '1px solid #fecaca',
                                            background: '#fef2f2',
                                            color: '#dc2626',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" />
                                        </svg>
                                        <span>Dismiss</span>
                                    </button>
                                </>
                            )}

                            {statusMenuPayment.status === 'failed' && (
                                <>
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={async () => {
                                            const id = statusMenuPayment.id;
                                            setStatusMenuPayment(null);
                                            await handleUpdateStatus(id, 'pending');
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '7px 10px',
                                            borderRadius: 8,
                                            border: '1px solid #bfdbfe',
                                            background: '#eff6ff',
                                            color: '#1d4ed8',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>Retry</span>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={async () => {
                                            const id = statusMenuPayment.id;
                                            setStatusMenuPayment(null);
                                            await handleDismissPayment(id);
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '7px 10px',
                                            borderRadius: 8,
                                            border: '1px solid #fecaca',
                                            background: '#fef2f2',
                                            color: '#dc2626',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" />
                                        </svg>
                                        <span>Dismiss</span>
                                    </button>
                                </>
                            )}

                            {statusMenuPayment.status === 'refunded' && (
                                <div style={{ padding: '8px 10px', fontSize: 11.5, color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
                                    Already Refunded
                                </div>
                            )}
                        </div>
                    </div>
                </>
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

            {/* ══════════════════════════════════════════════════════════════
                MODAL: TRANSACTION DETAILS (ITEM VIEW)
               ══════════════════════════════════════════════════════════════ */}
            {selectedTransaction && (
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
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Transaction Record Details
                                </div>
                                <h2 style={{ fontSize: 18, fontWeight: 800, color: brand.navy, margin: '2px 0 0', fontFamily: fonts.heading }}>
                                    Transaction #{selectedTransaction.id}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedTransaction(null)}
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
                            {/* Failed Alert Banner */}
                            {selectedTransaction.status === 'failed' && (
                                <div style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: 12,
                                    padding: '12px 16px',
                                    marginBottom: 18,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                }}>
                                    <div style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        background: '#fee2e2',
                                        color: '#dc2626',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 800,
                                        fontSize: 14,
                                        flexShrink: 0,
                                    }}>
                                        !
                                    </div>
                                    <div style={{ flex: 1, fontSize: 12.5, color: '#991b1b' }}>
                                        <strong>Payment Failed:</strong> This transaction could not be processed. You can dismiss this item from the ledger or retry the transaction.
                                    </div>
                                </div>
                            )}

                            {/* Summary Grid */}
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
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Amount</div>
                                    <div style={{
                                        fontSize: 20,
                                        fontWeight: 800,
                                        color: selectedTransaction.type === 'refund' ? '#dc2626' : brand.navy,
                                        fontFamily: fonts.heading,
                                        marginTop: 2,
                                    }}>
                                        {selectedTransaction.type === 'refund' ? '-' : '+'}AED {parseFloat(selectedTransaction.amount).toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status & Type</div>
                                    <div style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <TxStatusBadge status={selectedTransaction.status} />
                                        <TxTypeBadge type={selectedTransaction.type} />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Payment Reference</div>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: brand.navy, marginTop: 2 }}>
                                        {selectedTransaction.payment?.reference_number || `Payment #${selectedTransaction.payment_id}`}
                                    </div>
                                    {selectedTransaction.payment?.external_reference && (
                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                            Gateway ID: {selectedTransaction.payment.external_reference}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Timestamp</div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginTop: 2 }}>
                                        {new Date(selectedTransaction.created_at).toLocaleString('en-AE', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Customer</div>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: brand.navy, marginTop: 2 }}>
                                        {selectedTransaction.payment?.client?.name || 'Customer'}
                                    </div>
                                    <div style={{ fontSize: 11.5, color: '#64748b' }}>
                                        {selectedTransaction.payment?.client?.email || selectedTransaction.payment?.client?.phone || 'No direct contact'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Service / Booking</div>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: brand.royal, marginTop: 2 }}>
                                        Booking #{selectedTransaction.payment?.booking_id || 'N/A'}
                                    </div>
                                    <div style={{ fontSize: 11.5, color: '#64748b' }}>
                                        {selectedTransaction.payment?.booking?.service?.name || 'Cleaning Service'}
                                    </div>
                                </div>
                            </div>

                            {/* Description & Processing Info */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                                    Audit Description
                                </div>
                                <div style={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 10,
                                    padding: '12px 14px',
                                    fontSize: 13,
                                    color: '#334155',
                                }}>
                                    {selectedTransaction.description || 'System processed transaction ledger entry'}
                                    {selectedTransaction.processed_by?.name && (
                                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                                            Logged by: <strong>{selectedTransaction.processed_by.name}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gateway Response payload preview if available */}
                            {selectedTransaction.gateway_response && (
                                <div style={{ marginBottom: 20 }}>
                                    <button
                                        onClick={() => setSelectedTxPayload(selectedTransaction.gateway_response)}
                                        style={{
                                            ...outlineBtn,
                                            padding: '7px 14px',
                                            fontSize: 12,
                                            color: brand.royal,
                                            borderColor: '#bfdbfe',
                                            background: '#eff6ff',
                                        }}
                                    >
                                        Inspect Gateway Response JSON ↗
                                    </button>
                                </div>
                            )}

                            {/* Management Actions */}
                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>
                                    Actions
                                </div>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                    {/* DISMISS ACTION BUTTON FOR FAILED TRANSACTION */}
                                    {selectedTransaction.status === 'failed' && (
                                        <>
                                            <button
                                                disabled={actionLoadingId === selectedTransaction.id}
                                                onClick={() => handleDismissTransaction(selectedTransaction.id)}
                                                style={{
                                                    ...outlineBtn,
                                                    color: '#dc2626',
                                                    borderColor: '#fecaca',
                                                    background: '#fef2f2',
                                                    padding: '9px 18px',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                }}
                                            >
                                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Dismiss
                                            </button>
                                            <button
                                                disabled={actionLoadingId === selectedTransaction.id}
                                                onClick={() => handleRetryTransaction(selectedTransaction.id)}
                                                style={{
                                                    ...solidBtn,
                                                    background: '#2563eb',
                                                    padding: '9px 18px',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                }}
                                            >
                                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Retry Transaction
                                            </button>
                                        </>
                                    )}


                                    <button
                                        onClick={() => setSelectedTransaction(null)}
                                        style={{
                                            ...outlineBtn,
                                            padding: '9px 16px',
                                            fontSize: 13,
                                            marginLeft: 'auto',
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
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

/* ── Reusable Action Button (Exact Match to Admin UI Design) ─── */
function ActionBtn({ icon, onClick, title, danger, isView, variant, disabled }) {
    const [hovered, setHovered] = useState(false);

    let bgHover = '#f8fafc';
    let borderHover = '#cbd5e1';
    let textHover = brand.navy;

    if (danger) {
        bgHover = '#fef2f2';
        borderHover = '#fecaca';
        textHover = '#dc2626';
    } else if (isView) {
        bgHover = '#eff6ff';
        borderHover = '#bfdbfe';
        textHover = '#2563eb';
    } else if (variant === 'green') {
        bgHover = '#f0fdf4';
        borderHover = '#bbf7d0';
        textHover = '#16a34a';
    } else if (variant === 'amber') {
        bgHover = '#fffbeb';
        borderHover = '#fde68a';
        textHover = '#d97706';
    } else if (variant === 'blue') {
        bgHover = '#eff6ff';
        borderHover = '#bfdbfe';
        textHover = '#2563eb';
    }

    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick(e);
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: `1.5px solid ${hovered && !disabled ? borderHover : '#e2e8f0'}`,
                background: hovered && !disabled ? bgHover : '#fff',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: hovered && !disabled ? textHover : '#64748b',
                opacity: disabled ? 0.45 : 1,
                transition: 'all 0.15s ease',
                transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
                boxShadow: hovered && !disabled ? '0 4px 10px rgba(0,0,0,0.06)' : 'none',
                padding: 0,
                flexShrink: 0,
            }}
        >
            {icon}
        </button>
    );
}
