export function toCDN(urlOrPath: string, isCheque: boolean = false) {
    const host = isCheque ? process.env.NEXT_PUBLIC_S3_CDN_HOST_CHEQUE : process.env.NEXT_PUBLIC_S3_CDN_HOST;
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