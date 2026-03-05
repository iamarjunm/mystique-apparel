/**
 * Export users to CSV format for Brevo import
 * @param {Array} users - Array of user objects
 * @returns {string} CSV content
 */
export function exportUsersToCSV(users) {
  if (!users || users.length === 0) {
    console.warn('[EXPORT] No users to export');
    return null;
  }

  // CSV Header - standard Brevo fields
  const headers = ['Email', 'First Name', 'Last Name', 'Phone Number', 'Address', 'City', 'State', 'Postal Code', 'Country', 'Date Added'];

  // Map user data to CSV rows
  const rows = users.map((user) => [
    escapeCSV(user.email || ''),
    escapeCSV(user.displayName?.split(' ')[0] || ''),
    escapeCSV(user.displayName?.split(' ').slice(1).join(' ') || ''),
    escapeCSV(user.phoneNumber || ''),
    escapeCSV(user.addresses?.[0]?.address || ''),
    escapeCSV(user.addresses?.[0]?.city || ''),
    escapeCSV(user.addresses?.[0]?.state || ''),
    escapeCSV(user.addresses?.[0]?.postalCode || ''),
    escapeCSV(user.addresses?.[0]?.country || ''),
    new Date(user.createdAt || new Date()).toISOString().split('T')[0],
  ]);

  // Combine headers and rows
  const csv = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csv;
}

/**
 * Escape CSV values to handle special characters
 * @param {string} value - Value to escape
 * @returns {string} Escaped value
 */
function escapeCSV(value) {
  if (typeof value !== 'string') return '';

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Trigger browser download of CSV file
 * @param {string} csvContent - CSV content
 * @param {string} fileName - File name for download
 */
export function downloadCSV(csvContent, fileName = 'brevo-users.csv') {
  if (!csvContent) {
    console.error('[EXPORT] No CSV content to download');
    return;
  }

  // Create blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log('[EXPORT] ✅ CSV download started:', fileName);
}

/**
 * Export users and trigger download
 * @param {Array} users - Array of user objects
 * @param {string} fileName - Optional file name
 */
export function exportAndDownloadUsers(users, fileName) {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFileName = `mystique-users-${timestamp}.csv`;

  const csvContent = exportUsersToCSV(users);
  downloadCSV(csvContent, fileName || defaultFileName);
}
