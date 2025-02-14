// This is a lightweight JWT verification that works in Edge Runtime
export async function verifyTokenEdge(token) {
  try {
    // Basic structure check
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode payload (middle part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Basic validation
    if (!payload.user_id || !payload.exp) return null;
    
    // Check expiration
    if (payload.exp * 1000 < Date.now()) return null;
    
    return payload;
  } catch (error) {
    console.error('Edge token verification failed:', error);
    return null;
  }
} 