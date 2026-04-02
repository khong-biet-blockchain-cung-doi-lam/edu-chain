import { useEffect, useRef } from 'react';

/**
 * useDLP - Data Leak Prevention Hook (v3)
 *
 * Tính năng:
 * 1. Chặn chuột phải trên .dlp-protect
 * 2. Chặn Ctrl+C / Ctrl+A / Ctrl+S / Ctrl+P toàn trang
 * 3. Chặn HOÀN TOÀN sự kiện copy — hiện cảnh báo đỏ + ghi Audit Log
 * 4. Phát hiện chụp ảnh màn hình (PrintScreen, Snipping Tool) -> Hủy giao diện + Ghi Log
 */
export function useDLP(active = true, source = 'EDU-CHAIN') {
  const toastRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    // ── Tạo Toast cảnh báo nổi trên màn hình ────────────────────────────
    const toast = document.createElement('div');
    toast.id = 'dlp-warning-toast';
    Object.assign(toast.style, {
      position: 'fixed',
      top: '24px',
      left: '50%',
      transform: 'translateX(-50%) translateY(-150px)',
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      color: 'white',
      padding: '14px 28px',
      borderRadius: '12px',
      fontWeight: '700',
      fontSize: '0.95rem',
      fontFamily: 'Inter, sans-serif',
      zIndex: '999999',
      boxShadow: '0 8px 32px rgba(220,38,38,0.5)',
      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      letterSpacing: '0.01em',
    });
    document.body.appendChild(toast);
    toastRef.current = toast;

    let hideTimer = null;

    const showWarning = (message = '🔒 Cảnh báo: Hành vi sao chép đã được ghi lại!') => {
      if (hideTimer) clearTimeout(hideTimer);
      toast.textContent = message;
      toast.style.transform = 'translateX(-50%) translateY(0)';
      hideTimer = setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(-150px)';
      }, 3500);
    };

    // ── Ghi Audit Log lên Backend ────────────────────────────────────────
    const logAttempt = (action = 'COPY_ATTEMPT', detailsMsg = 'Cố sao chép dữ liệu nhạy cảm') => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        fetch(
          `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api'}/audit/log`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              action: action,
              target_id: null,
              details: `${detailsMsg} tại: ${source}`,
            }),
          }
        );
      } catch (_) {}
    };

    // ── 0. Bắt sự kiện Chụp Màn Hình ─────────────────────────────────────
    const handleScreenshotAttempt = (e) => {
      e.preventDefault();
      
      // Phủ đen toàn bộ màn hình ngay lập tức để hỏng ảnh chụp
      const overlay = document.createElement('div');
      overlay.id = 'dlp-screenshot-overlay';
      Object.assign(overlay.style, {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: '#000', color: '#ef4444',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 9999999, fontSize: '24px', fontWeight: 'bold'
      });
      overlay.innerHTML = '<p>⛔ BẢO MẬT: Không được phép chụp ảnh màn hình!</p><p style="font-size:16px;color:#fff;font-weight:normal;margin-top:10px;">Hành vi của bạn đã được báo cáo cho Hệ thống Quản trị.</p>';
      document.body.appendChild(overlay);

      showWarning('📸 Cảnh báo: Phát hiện hành vi chụp ảnh màn hình!');
      logAttempt('SCREENSHOT_ATTEMPT', 'Cố tình dùng phím tắt chụp ảnh màn hình');

      // Tự động gỡ lớp màn đen sau 3 giây
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 3000);
    };

    // Trình duyệt thường bắn keyup cho phím PrintScreen
    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen') {
        handleScreenshotAttempt(e);
      }
    };

    // ── 1. Chặn chuột phải trên .dlp-protect ─────────────────────────────
    const handleContextMenu = (e) => {
      if (e.target.closest('.dlp-protect')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // ── 2. Chặn phím tắt toàn trang (Copy & Screenshot) ──────────────────
    const handleKeyDown = (e) => {
      const key = e.key?.toLowerCase();
      
      // Phát hiện tổ hợp phím chụp màn hình Snipping Tool (Win+Shift+S) hoặc Mac (Cmd+Shift+3/4/5)
      if (e.metaKey && e.shiftKey && ['s', '3', '4', '5'].includes(key)) {
        handleScreenshotAttempt(e);
        return;
      }

      // Phát hiện PrintScreen trên một số hệ điều hành bắn qua keydown
      if (e.key === 'PrintScreen') {
        handleScreenshotAttempt(e);
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      // Ctrl+P: chặn in ấn luôn
      if (key === 'p') { e.preventDefault(); return; }

      // Ctrl+C / Ctrl+X / Ctrl+A: chặn khi trong vùng nhạy cảm
      if (['c', 'x', 'a'].includes(key) && e.target.closest('.dlp-protect')) {
        e.preventDefault();
        e.stopPropagation();
        showWarning();
        logAttempt('COPY_ATTEMPT', 'Cố sao chép dữ liệu');
      }
    };

    // ── 3. Chặn hoàn toàn sự kiện copy ───────────────────────────────────
    const handleCopy = (e) => {
      const selection = window.getSelection();
      const anchor = selection?.anchorNode;
      if (!anchor) return;

      const inProtected =
        anchor.nodeType === Node.TEXT_NODE
          ? anchor.parentElement?.closest('.dlp-protect')
          : anchor?.closest?.('.dlp-protect');

      if (inProtected) {
        e.preventDefault();
        e.stopPropagation();
        showWarning();
        logAttempt('COPY_ATTEMPT', 'Cố sao chép dữ liệu');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    document.addEventListener('copy', handleCopy, true);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      document.removeEventListener('copy', handleCopy, true);
      if (hideTimer) clearTimeout(hideTimer);
      if (toastRef.current && toastRef.current.parentNode) {
        toastRef.current.parentNode.removeChild(toastRef.current);
      }
      const overlay = document.getElementById('dlp-screenshot-overlay');
      if (overlay) overlay.parentNode.removeChild(overlay);
    };
  }, [active, source]);
}

