import React, { useState, useEffect } from 'react';
import { 
    Lock, Unlock, Shield, Users, Search, 
    RefreshCw, CheckCircle, XCircle, Info, Copy
} from 'lucide-react';
import encryptionService from '../../services/encryptionService';
import './ClusterManagement.css';

const STATUS_LABELS = {
    ENCRYPTED: 'Đã mã hóa',
    COMPLETE:  'Đủ dữ liệu',
    DECRYPTED: 'Đã giải mã',
    SENT:      'Đã gửi Blockchain',
};

export default function ProfileClusters() {
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [stats, setStats] = useState(null);
    const [toast, setToast] = useState(null);

    // Modal mã hóa mới
    const [encryptModal, setEncryptModal] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [encrypting, setEncrypting] = useState(false);

    // Modal giải mã
    const [decryptModal, setDecryptModal] = useState(null); // cluster object
    const [privateKeyInput, setPrivateKeyInput] = useState('');
    const [decrypting, setDecrypting] = useState(false);
    const [decryptResult, setDecryptResult] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [all, statsData] = await Promise.all([
                encryptionService.getClusters(),
                encryptionService.getStats()
            ]);
            // Lọc chỉ lấy student_profile clusters
            setClusters(all.filter(c => c.cluster_type === 'student_profile'));
            setStats(statsData);
        } catch (e) {
            showToast('Không thể tải dữ liệu cluster', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const data = await encryptionService.getStudents();
            setStudents(data.accounts || data || []);
        } catch {
            setStudents([]);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openEncryptModal = async () => {
        await fetchStudents();
        setSelectedStudentId('');
        setEncryptModal(true);
    };

    const handleEncrypt = async () => {
        if (!selectedStudentId) return;
        setEncrypting(true);
        try {
            const res = await encryptionService.encryptStudentProfile(selectedStudentId);
            showToast(`✅ Đã mã hóa hồ sơ sinh viên ${res.subject_code || ''}`);
            setEncryptModal(false);
            fetchData();
        } catch (e) {
            showToast(e.response?.data?.msg || 'Mã hóa thất bại', 'error');
        } finally {
            setEncrypting(false);
        }
    };

    const openDecryptModal = (cluster) => {
        setDecryptModal(cluster);
        setPrivateKeyInput('');
        setDecryptResult(null);
    };

    const handleDecrypt = async () => {
        if (!decryptModal) return;
        setDecrypting(true);
        try {
            const keyPem = privateKeyInput.trim() || null;
            const res = await encryptionService.decryptCluster(decryptModal.id, keyPem);
            setDecryptResult(res);
            showToast('✅ Giải mã thành công! Dữ liệu sẵn sàng cho Blockchain.', 'success');
            fetchData();
        } catch (e) {
            showToast(e.response?.data?.msg || 'Giải mã thất bại — sai key hoặc cluster hỏng', 'error');
        } finally {
            setDecrypting(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(decryptResult?.data, null, 2));
        showToast('Đã copy dữ liệu vào clipboard!', 'info');
    };

    const filtered = clusters.filter(c => {
        const matchSearch = (c.subject_code || '').toLowerCase().includes(search.toLowerCase()) ||
                            c.status.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const totalClusters = clusters.length;
    const encryptedCount = clusters.filter(c => c.status === 'ENCRYPTED').length;
    const decryptedCount = clusters.filter(c => c.status === 'DECRYPTED').length;
    const sentCount = clusters.filter(c => c.status === 'SENT').length;

    return (
        <div className="cluster-page">
            {toast && (
                <div className={`cluster-toast ${toast.type}`}>
                    {toast.type === 'success' && <CheckCircle size={16}/>}
                    {toast.type === 'error'   && <XCircle size={16}/>}
                    {toast.type === 'info'    && <Info size={16}/>}
                    {toast.msg}
                </div>
            )}

            <div className="cluster-header">
                <div>
                    <h1 className="cluster-title">🏛 Phòng Quản lý Đào tạo</h1>
                    <p className="cluster-subtitle">Mã hóa và quản lý cụm dữ liệu hồ sơ sinh viên</p>
                </div>
            </div>

            {/* Stats */}
            <div className="cluster-stats">
                <div className="cluster-stat-card">
                    <div className="cluster-stat-label">Tổng Clusters</div>
                    <div className="cluster-stat-value">{totalClusters}</div>
                </div>
                <div className="cluster-stat-card encrypted">
                    <div className="cluster-stat-label">Đang mã hóa</div>
                    <div className="cluster-stat-value">{encryptedCount}</div>
                </div>
                <div className="cluster-stat-card decrypted">
                    <div className="cluster-stat-label">Đã giải mã</div>
                    <div className="cluster-stat-value">{decryptedCount}</div>
                </div>
                <div className="cluster-stat-card sent">
                    <div className="cluster-stat-label">Đã gửi BC</div>
                    <div className="cluster-stat-value">{sentCount}</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="cluster-toolbar">
                <div className="cluster-search">
                    <Search size={15} className="cluster-search-icon"/>
                    <input
                        className="cluster-search-input"
                        placeholder="Tìm theo mã SV, trạng thái..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select className="cluster-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">Tất cả trạng thái</option>
                    <option value="ENCRYPTED">Đã mã hóa</option>
                    <option value="DECRYPTED">Đã giải mã</option>
                    <option value="SENT">Đã gửi Blockchain</option>
                </select>
                <button className="cluster-btn-encrypt" onClick={fetchData}>
                    <RefreshCw size={15}/> Làm mới
                </button>
                <button className="cluster-btn-encrypt" onClick={openEncryptModal}>
                    <Lock size={15}/> Mã hóa hồ sơ mới
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="cluster-loading"><RefreshCw size={18}/> Đang tải dữ liệu...</div>
            ) : (
                <div className="cluster-table-wrap">
                    {filtered.length === 0 ? (
                        <div className="cluster-empty">
                            <Shield size={48}/>
                            <p>Chưa có cluster nào. Bấm "Mã hóa hồ sơ mới" để bắt đầu.</p>
                        </div>
                    ) : (
                        <table className="cluster-table">
                            <thead>
                                <tr>
                                    <th>Mã SV</th>
                                    <th>Phiên bản</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày mã hóa</th>
                                    <th>Ngày giải mã</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(c => (
                                    <tr key={c.id}>
                                        <td><strong>{c.subject_code || '—'}</strong></td>
                                        <td><span className="version-badge">v{c.version}</span></td>
                                        <td>
                                            <span className={`cluster-status ${c.status}`}>
                                                {STATUS_LABELS[c.status] || c.status}
                                            </span>
                                        </td>
                                        <td style={{fontSize:'0.8rem', color:'#64748b'}}>
                                            {c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : '—'}
                                        </td>
                                        <td style={{fontSize:'0.8rem', color:'#64748b'}}>
                                            {c.decrypted_at ? new Date(c.decrypted_at).toLocaleDateString('vi-VN') : '—'}
                                        </td>
                                        <td>
                                            {(c.status === 'ENCRYPTED' || c.status === 'COMPLETE') && (
                                                <button 
                                                    className="cluster-action-btn decrypt"
                                                    onClick={() => openDecryptModal(c)}
                                                >
                                                    <Unlock size={13}/> Giải mã
                                                </button>
                                            )}
                                            {c.status === 'DECRYPTED' && (
                                                <span style={{fontSize:'0.78rem', color:'#10b981', fontWeight:'600'}}>
                                                    ✓ Sẵn sàng Blockchain
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ENCRYPT MODAL */}
            {encryptModal && (
                <div className="cluster-modal-overlay" onClick={() => setEncryptModal(false)}>
                    <div className="cluster-modal" onClick={e => e.stopPropagation()}>
                        <h3>🔐 Mã hóa Hồ sơ Sinh viên</h3>
                        <p>Chọn sinh viên để mã hóa toàn bộ thông tin hồ sơ (cá nhân, liên lạc, nhập học) bằng AES-256 + RSA-2048.</p>
                        <select
                            className="cluster-modal-select"
                            value={selectedStudentId}
                            onChange={e => setSelectedStudentId(e.target.value)}
                        >
                            <option value="">-- Chọn sinh viên --</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.username || s.email} ({s.role_type})
                                </option>
                            ))}
                        </select>
                        <div className="cluster-modal-actions">
                            <button className="cluster-modal-cancel" onClick={() => setEncryptModal(false)}>Hủy</button>
                            <button 
                                className="cluster-modal-confirm"
                                onClick={handleEncrypt}
                                disabled={!selectedStudentId || encrypting}
                            >
                                <Lock size={14}/> {encrypting ? 'Đang mã hóa...' : 'Mã hóa ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DECRYPT MODAL */}
            {decryptModal && (
                <div className="cluster-modal-overlay" onClick={() => { setDecryptModal(null); setDecryptResult(null); }}>
                    <div className="cluster-modal" onClick={e => e.stopPropagation()}>
                        {!decryptResult ? (
                            <>
                                <h3>🔓 Giải mã Cluster — {decryptModal.subject_code}</h3>
                                <p>
                                    Nhập RSA Private Key của Phòng Quản lý Đào tạo (PEM format). 
                                    Nếu bỏ trống, hệ thống sẽ dùng key đã cấu hình trong .env.
                                </p>
                                <textarea
                                    className="cluster-modal-textarea"
                                    placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;(Bỏ trống để dùng key từ .env)&#10;-----END RSA PRIVATE KEY-----"
                                    value={privateKeyInput}
                                    onChange={e => setPrivateKeyInput(e.target.value)}
                                />
                                <div className="cluster-modal-actions">
                                    <button className="cluster-modal-cancel" onClick={() => setDecryptModal(null)}>Hủy</button>
                                    <button 
                                        className="cluster-modal-confirm"
                                        onClick={handleDecrypt}
                                        disabled={decrypting}
                                    >
                                        <Unlock size={14}/> {decrypting ? 'Đang giải mã...' : 'Giải mã & Chuẩn bị Blockchain'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>✅ Giải mã thành công!</h3>
                                <p>Dữ liệu bên dưới đã sẵn sàng để gửi cho đội Blockchain:</p>
                                <div className="cluster-result-box">
                                    {JSON.stringify(decryptResult.data, null, 2)}
                                </div>
                                <div className="cluster-modal-actions">
                                    <button className="cluster-copy-btn" onClick={copyToClipboard}>
                                        <Copy size={13}/> Copy JSON
                                    </button>
                                    <button className="cluster-modal-cancel" onClick={() => { setDecryptModal(null); setDecryptResult(null); }}>
                                        Đóng
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
