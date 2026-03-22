import { useEffect } from 'react';

/**
 * useDLP - Data Leak Prevention Hook
 * 
 * Tính năng:
 * 1. Chặn chuột phải (right-click) trên vùng dữ liệu nhạy cảm (.dlp-protect)
 * 2. Chặn phím tắt: Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P trên vùng nhạy cảm
 * 3. Clipboard Scramble: khi copy, text bị phá cấu trúc bằng Homoglyph + Zero-Width
 * 
 * @param {boolean} active - Bật/tắt hook (mặc định true)
 * @param {string} source - Tên nguồn hiển thị trong clipboard footer
 */
export function useDLP(active = true, source = 'EDU-CHAIN') {
  useEffect(() => {
    if (!active) return;

    // ── 1. Chặn chuột phải trên vùng .dlp-protect ────────────────────────
    const handleContextMenu = (e) => {
      if (e.target.closest('.dlp-protect')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // ── 2. Chặn phím tắt nguy hiểm trên vùng .dlp-protect ───────────────
    const handleKeyDown = (e) => {
      if (!e.target.closest('.dlp-protect')) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && ['c', 'a', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // ── 3. Clipboard Scramble ─────────────────────────────────────────────

    // Bảng Homoglyph: Latin → Cyrillic trông y hệt nhưng khác mã Unicode
    const HOMOGLYPHS = {
      'a':'а','e':'е','o':'о','p':'р','c':'с','x':'х','y':'у','i':'і',
      'A':'А','E':'Е','O':'О','P':'Р','C':'С','X':'Х','B':'В',
      'H':'Н','K':'К','M':'М','T':'Т',
    };

    // Ký tự Zero-Width vô hình chèn xen kẽ giữa mỗi chữ
    const ZWC = ['\u200B', '\u200C', '\u200D', '\uFEFF'];

    // Bước A: đổi sang homoglyph
    const applyHomoglyph = (text) =>
      text.split('').map(ch => HOMOGLYPHS[ch] || ch).join('');

    // Bước B: chèn ký tự vô hình ngẫu nhiên sau mỗi chữ
    const injectZeroWidth = (text) =>
      text.split('').map(ch => ch + ZWC[Math.floor(Math.random() * ZWC.length)]).join('');

    const handleCopy = (e) => {
      const selection = window.getSelection()?.toString();
      if (!selection || !selection.trim()) return;

      const timestamp = new Date().toLocaleString('vi-VN');
      // Áp dụng lần lượt: Homoglyph → Zero-Width
      const scrambled = injectZeroWidth(applyHomoglyph(selection));
      const footer = `\n\n──────────────────────────\n⚠️ TÀI LIỆU BẢO MẬT - ${source}\nNguồn: ${source} | Thời gian: ${timestamp}\nViệc sao chép, phát tán thông tin này có thể vi phạm chính sách bảo mật.\n──────────────────────────`;

      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', scrambled + footer);
        e.preventDefault();
      } else {
        try { navigator.clipboard.writeText(scrambled + footer); } catch (_) {}
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('copy', handleCopy);
    };
  }, [active, source]);
}
