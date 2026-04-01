const KEY = 'invicta_cart_id';

export function getOrCreateCartId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function resetCartId(): void {
  localStorage.removeItem(KEY);
}
