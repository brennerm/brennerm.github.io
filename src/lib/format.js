/**
 * e.g. "March 4, 2024", like Jekyll's `%B %e, %Y`
 * @param {string} date
 */
export function formatDate(date) {
	const d = new Date(`${date}T00:00:00Z`);
	const month = d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
	return `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
