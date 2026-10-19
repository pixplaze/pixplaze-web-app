const WILDCARD = '*';

/**
 * Покрывает ли выданное право `granted` требуемое `required` — то же правило, что в web-api:
 * `*` в середине — ровно один сегмент, последним — любой непустой остаток.
 * `sys.*` покрывает `sys.servers.delete`, `sys.*.read` — `sys.profile.read`.
 */
export function matches(granted, required) {
  const grantedSegments = granted.split('.');
  const requiredSegments = required.split('.');
  for (let i = 0; i < grantedSegments.length; i++) {
    const segment = grantedSegments[i];
    if (segment === WILDCARD && i === grantedSegments.length - 1) {
      return requiredSegments.length > i;
    }
    if (i >= requiredSegments.length) return false;
    if (segment !== WILDCARD && segment !== requiredSegments[i]) return false;
  }
  return grantedSegments.length === requiredSegments.length;
}

/** Есть ли среди выданных прав покрывающее `required`. */
export function implies(grantedList, required) {
  return !!required && (grantedList ?? []).some(granted => matches(granted, required));
}
