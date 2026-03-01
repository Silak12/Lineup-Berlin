"""
Führe dieses Script einmal aus und schick mir den Output.
Dann kann ich ra_scraper.py mit den korrekten Werten fixen.

python ra_introspect.py
"""
import json
import requests

HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Referer": "https://ra.co/",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    "ra-content-language": "de",
}
URL = "https://ra.co/graphql"


def gql(query):
    r = requests.post(URL, headers=HEADERS, json={"query": query}, timeout=15)
    r.raise_for_status()
    return r.json()


print("=" * 60)

# 1. EventQueryType Enum-Werte
print("\n[1] EventQueryType enum values:")
r1 = gql('{ __type(name: "EventQueryType") { enumValues { name } } }')
print(json.dumps(r1.get("data"), indent=2))

# 2. Venue.events Feld-Argumente
print("\n[2] Venue.events field args:")
r2 = gql("""
{
  __type(name: "Venue") {
    fields {
      name
      args { name type { name kind ofType { name kind } } }
    }
  }
}
""")
venue_fields = (r2.get("data", {}).get("__type", {}) or {}).get("fields", [])
events_field = next((f for f in venue_fields if f["name"] == "events"), None)
print(json.dumps(events_field, indent=2))

# 3. eventListings Query-Argumente
print("\n[3] eventListings query args:")
r3 = gql("""
{
  __type(name: "Query") {
    fields {
      name
      args { name type { name kind ofType { name kind } } }
    }
  }
}
""")
query_fields = (r3.get("data", {}).get("__type", {}) or {}).get("fields", [])
el_field = next((f for f in query_fields if f["name"] == "eventListings"), None)
print(json.dumps(el_field, indent=2))

# 4. FilterInputDtoInput Felder (für den filter-Aufbau)
print("\n[4] FilterInputDtoInput fields:")
r4 = gql('{ __type(name: "FilterInputDtoInput") { inputFields { name type { name kind ofType { name kind } } } } }')
print(json.dumps(r4.get("data"), indent=2))

print("\n" + "=" * 60)
print("Schick mir diesen kompletten Output → ich fixe ra_scraper.py sofort.")