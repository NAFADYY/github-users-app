
export function paginate(list, page = 1, perPage = 10) {
  const arr = Array.isArray(list) ? list : [];

  // clamp + sanitize
  const size = Math.max(1, Number.isFinite(perPage) ? Math.trunc(perPage) : 10);
  const p = Math.max(1, Number.isFinite(page) ? Math.trunc(page) : 1);

  const start = (p - 1) * size;
  const end = start + size;
  return arr.slice(start, end);
}
