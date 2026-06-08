// Мөнгөн дүнг dashboard дээр уншихад амар MNT формат руу хөрвүүлнэ.
function money(value) {
  return `${Number(value || 0).toLocaleString()} MNT`;
}

// Payment/payout status-ийг өнгөт badge HTML болгон харуулна.
function statusBadge(status) {
  return `<span class="badge ${status}">${status}</span>`;
}

// Table хоосон үед empty row харуулж, data байвал renderer callback-аар мөрүүд үүсгэнэ.
function safeRows(rows, renderer, emptyText) {
  if (!rows || rows.length === 0) {
    return `<tr><td colspan="5" class="empty">${emptyText}</td></tr>`;
  }

  return rows.map(renderer).join('');
}
