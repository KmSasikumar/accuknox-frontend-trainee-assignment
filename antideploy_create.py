#!/usr/bin/env python3
"""Create the AccuKnox Front-End Trainee app on Antideploy. Never prints the token."""
import json
import urllib.request

CFG = "/home/hatch/.antideploy/config.json"
BASE = "https://antideploy.com/api/v1"

with open(CFG) as f:
    token = json.load(f)["token"]

payload = json.dumps({"name": "accuknox-frontend-trainee"}).encode("utf-8")
req = urllib.request.Request(
    BASE + "/applications",
    data=payload,
    headers={
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = resp.read().decode("utf-8", "replace")
        print("STATUS:", resp.status)
        print("BODY:", body[:1000])
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code, e.read().decode("utf-8", "replace")[:1000])
except Exception as e:
    print("ERROR:", type(e).__name__, str(e)[:300])
