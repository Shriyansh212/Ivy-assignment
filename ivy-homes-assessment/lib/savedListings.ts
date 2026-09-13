import { getStoredSession } from './api';

export function getSavedStorageKey(): string {
  if (typeof window === 'undefined') return 'ivy_saved_listings_guest';
  try {
    const session = getStoredSession();
    const email = session?.user?.email;
    return email ? `ivy_saved_listings_${email.toLowerCase().trim()}` : 'ivy_saved_listings_guest';
  } catch {
    return 'ivy_saved_listings_guest';
  }
}

export function getSavedListingIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getSavedStorageKey();
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading saved listings:', err);
    return [];
  }
}

export function toggleSavedListingId(id: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getSavedStorageKey();
    const current = getSavedListingIds();
    const next = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    localStorage.setItem(key, JSON.stringify(next));
    setTimeout(() => {
      window.dispatchEvent(new Event('saved_listings_change'));
    }, 0);
    return next;
  } catch (err) {
    console.error('Error toggling saved listing:', err);
    return [];
  }
}

export function clearSavedListings(): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getSavedStorageKey();
    localStorage.removeItem(key);
    setTimeout(() => {
      window.dispatchEvent(new Event('saved_listings_change'));
    }, 0);
  } catch {}
}
