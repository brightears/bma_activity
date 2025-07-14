// Middleware to make authentication optional for internal use
export async function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  // For internal use, accept mock token
  if (token === 'mock-token-for-internal-use') {
    req.user = {
      id: '00000000-0000-0000-0000-000000000000',
      profile: {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'team@bmasiapte.com',
        username: 'BMA Team',
        full_name: 'BMA Team',
        role: 'admin'
      }
    };
    return next();
  }
  
  // Otherwise, no auth required
  req.user = {
    id: '00000000-0000-0000-0000-000000000000',
    profile: {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'team@bmasiapte.com',
      username: 'BMA Team',
      full_name: 'BMA Team',
      role: 'admin'
    }
  };
  
  next();
}