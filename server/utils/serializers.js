export function publicUser(user, options = {}) {
  if (!user) return null;
  const source = user.toObject ? user.toObject() : user;
  const isSelf = options.isSelf === true;
  const payload = {
    id: String(source._id || source.id),
    name: source.name,
    college: source.college,
    department: source.department || '',
    year: source.year || '',
    role: source.role,
    createdAt: source.createdAt,
    lastLoginAt: source.lastLoginAt || null,
  };

  if (isSelf) {
    payload.email = source.email;
    payload.status = source.status;
    payload.favorites = (source.favorites || []).map((id) => String(id));
  }

  return payload;
}

export function publicSeller(user) {
  if (!user) return null;
  const source = user.toObject ? user.toObject() : user;
  return {
    id: String(source._id || source.id),
    name: source.name,
    college: source.college || '',
    department: source.department || '',
    year: source.year || '',
    memberSince: source.createdAt,
  };
}
