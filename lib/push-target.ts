export type PushTarget = { kind: 'home' } | { kind: 'review' } | { kind: 'memo'; id: string };

/** Parse aimoapp://home, aimoapp://review, and aimoapp://memo/<id>. */
export function parsePushUrl(url: string | null): PushTarget | null {
  if (!url || !url.startsWith('aimoapp:')) return null;
  let path = '';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const rest = parsed.pathname.replace(/^\//, '');
    path = [host, rest].filter(Boolean).join('/');
  } catch {
    return null;
  }
  if (path === '' || path === 'home') return { kind: 'home' };
  if (path === 'review') return { kind: 'review' };
  const memo = path.match(/^memo\/([A-Za-z0-9_-]+)$/);
  if (memo) return { kind: 'memo', id: memo[1] };
  return null;
}

export function routeForPushTarget(target: PushTarget): `/(memos)/${string}` | '/(memos)' {
  if (target.kind === 'memo') return `/(memos)/${target.id}`;
  return '/(memos)';
}
