import urllib.request, ssl
url = "https://www.python.org/ftp/python/"
req = urllib.request.Request(url)
req.add_header("User-Agent", "Mozilla/5.0")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
    html = r.read().decode()
    # 找 3.11.x 的链接
    import re
    versions = re.findall(r'href="(3\.11\.\d+)/"', html)
    print(versions[-1] if versions else "not found")
