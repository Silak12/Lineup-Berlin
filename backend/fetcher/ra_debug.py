"""
python ra_debug.py
Zeigt den Raw-Response für venue_id=17071 – damit sehen wir warum 0 Events.
"""
import json, requests

HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Referer": "https://ra.co/",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    "ra-content-language": "de",
}
URL = "https://ra.co/graphql"

def gql(query, variables={}):
    r = requests.post(URL, headers=HEADERS, json={"query": query, "variables": variables}, timeout=15)
    r.raise_for_status()
    return r.json()

# Test 1: FROMDATE mit verschiedenen Datumsformaten
print("=== Test 1: FROMDATE mit date=2026-03-01T00:00:00 ===")
r1 = gql("""
query($id: ID!, $date: DateTime) {
  venue(id: $id) {
    id
    name
    events(type: FROMDATE, date: $date, limit: 5) {
      id
      title
      date
    }
  }
}
""", {"id": 17071, "date": "2026-03-01T00:00:00"})
print(json.dumps(r1, indent=2))

# Test 2: LATEST (keine date nötig) - zeigt ob Venue überhaupt Events hat
print("\n=== Test 2: LATEST (letzten Events) ===")
r2 = gql("""
query($id: ID!) {
  venue(id: $id) {
    id
    name
    events(type: LATEST, limit: 5) {
      id
      title
      date
    }
  }
}
""", {"id": 17071})
print(json.dumps(r2, indent=2))

# Test 3: Venue-Basis-Info prüfen
print("\n=== Test 3: Venue-Info ===")
r3 = gql("""
query($id: ID!) {
  venue(id: $id) {
    id
    name
    area { id name }
  }
}
""", {"id": 17071})
print(json.dumps(r3, indent=2))

# Test 4: eventListings für Berlin area, nächste 4 Wochen (ohne venue-Filter)
print("\n=== Test 4: eventListings Berlin (area_id=13) ===")
r4 = gql("""
query {
  eventListings(
    filters: {
      areas: { eq: 13 }
      date: { gte: "2026-03-01", lte: "2026-04-01" }
    }
    pageSize: 3
    page: 1
  ) {
    data {
      event {
        id
        title
        date
        venue { id name }
        artists { id name }
      }
    }
    totalResults
  }
}
""")
print(json.dumps(r4, indent=2))