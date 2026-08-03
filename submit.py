import urllib.request, json
req = urllib.request.Request('http://127.0.0.1:8080/submit', data=json.dumps({'branch': 'feature/sso-header-and-progress-ui', 'message': 'feat: Implement SSO Header, Visual Progress Indicator, and Checkout Loading State'}).encode(), headers={'Content-Type': 'application/json'})
try:
    urllib.request.urlopen(req)
except Exception as e:
    print(e)
