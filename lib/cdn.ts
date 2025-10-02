export function toCDN(urlOrPath: string) {
    const host = 'db3uf8fcaqsi.cloudfront.net';
    if (!host) return urlOrPath;
  
    // If you pass a full S3 URL, swap its host to the CDN host
    try {
      const u = new URL(urlOrPath);
      u.host = host;
      u.protocol = 'https:';
      return u.toString();
    } catch {
      // If you pass a path like "/images/x.png"
      const path = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
      return `https://${host}${path}`;
    }
  }