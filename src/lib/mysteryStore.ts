import type { MysteryOrderRecord } from "../types/mystery";

const storageKey = (userId: string) => `rj_mystery_orders_${userId}`;
const shownKey = (userId: string) => `rj_mystery_shown_${userId}`;
const SHOWN_HISTORY_LIMIT = 5;

/**
 * Books recommended in recent sessions, whether or not the user completed an order —
 * so repeating the same mood/genre answers doesn't surface the same pick every time.
 */
export function listRecentlyShown(userId: string): string[] {
  const raw = localStorage.getItem(shownKey(userId));
  return raw ? (JSON.parse(raw) as string[]) : [];
}

export function recordMysteryShown(userId: string, bookId: string): void {
  const shown = listRecentlyShown(userId).filter((id) => id !== bookId);
  shown.push(bookId);
  localStorage.setItem(shownKey(userId), JSON.stringify(shown.slice(-SHOWN_HISTORY_LIMIT)));
}

export function listMysteryOrders(userId: string): MysteryOrderRecord[] {
  const raw = localStorage.getItem(storageKey(userId));
  return raw ? (JSON.parse(raw) as MysteryOrderRecord[]) : [];
}

function writeMysteryOrders(userId: string, orders: MysteryOrderRecord[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(orders));
}

export function createMysteryOrder(
  userId: string,
  input: Omit<MysteryOrderRecord, "id" | "createdAt">,
): MysteryOrderRecord {
  const orders = listMysteryOrders(userId);
  const order: MysteryOrderRecord = { ...input, id: crypto.randomUUID(), createdAt: Date.now() };
  orders.push(order);
  writeMysteryOrders(userId, orders);
  return order;
}

export function submitMysteryFeedback(
  userId: string,
  orderId: string,
  feedback: MysteryOrderRecord["feedback"],
): void {
  const orders = listMysteryOrders(userId);
  const order = orders.find((o) => o.id === orderId);
  if (!order) return;
  order.feedback = feedback;
  writeMysteryOrders(userId, orders);
}
