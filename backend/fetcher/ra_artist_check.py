"""
Testet die RA Artist-Query für einen bekannten Artist (Limoncello = urlSafeName "limoncello")
python ra_artist_test.py
"""
import json, requests

HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Referer": "https://ra.co/",
    "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    "ra-content-language": "de",
}
URL = "https://ra.co/graphql"

def gql(query, variables={}):
    r = requests.post(URL, headers=HEADERS, json={"query": query, "variables": variables}, timeout=15)
    r.raise_for_status()
    return r.json()

# Test: Artist by ID (wir haben die ID aus den Events)
print("=== Artist by ID (aus Event-Response) ===")
r1 = gql("""
query($id: ID!) {
  artist(id: $id) {
    id
    name
    urlSafeName
    facebook
    soundcloud
    instagram
    twitter
    bandcamp
    discogs
    website
  }
}
""", {"id": "933649"})  # Limoncello ID aus deinem Event-Response
print(json.dumps(r1, indent=2))

# Test: Artist by urlSafeName
print("\n=== __type Artist (alle verfügbaren Felder) ===")
r2 = gql("""
{
  __type(name: "Artist") {
    fields { name type { name kind } }
  }
}
""")
fields = (r2.get("data", {}).get("__type") or {}).get("fields", [])
for f in fields:
    print(f"  {f['name']}: {f['type']['name'] or f['type']['kind']}")