#!/usr/bin/env python3
"""Deploy the AccuKnox Front-End Trainee build (dist/) to Antideploy.
Token is read from config and passed to curl via a temp config file,
never on the command line; the temp file is removed afterwards."""
import json, subprocess, os, sys, time, urllib.request

HOME = os.path.expanduser("~")
TOKEN = json.load(open(f"{HOME}/.antideploy/config.json"))["token"]
APP = "20ffffd2-3228-40f4-a00d-460633a76d64"
SRC = f"{HOME}/workspace/accuknox-frontend-trainee/dist"
TGZ = "/tmp/accuknox-frontend.tgz"
CFGF = "/tmp/ad_curl_config"

subprocess.run(
    ["tar", "--exclude=.git", "-czf", TGZ, "-C", SRC, "."],
    check=True,
)
print("tgz bytes:", os.path.getsize(TGZ), flush=True)

with open(CFGF, "w") as f:
    f.write('header = "Authorization: Bearer ' + TOKEN + '"\n')
try:
    r = subprocess.run(
        ["curl", "-sS", "-X", "POST",
         f"https://antideploy.com/api/v1/deploy?applicationId={APP}",
         "--config", CFGF, "-F", f"archive=@{TGZ}"],
        capture_output=True, text=True, timeout=300,
    )
    print("submit:", r.stdout[:500], r.stderr[:300], flush=True)
    resp = json.loads(r.stdout)
    tid = resp.get("taskId") or resp.get("id")
    if not tid:
        sys.exit("no task id in response")
    url = f"https://antideploy.com/api/v1/deployments/{tid}"
    print("watch:", url, flush=True)
    deadline = time.time() + 900
    last = None
    while time.time() < deadline:
        rq = urllib.request.Request(url, headers={"Authorization": f"Bearer {TOKEN}"})
        try:
            with urllib.request.urlopen(rq, timeout=30) as r2:
                d = json.loads(r2.read())
        except Exception as e:
            print("poll retry after:", type(e).__name__, flush=True)
            time.sleep(10)
            continue
        st = d.get("status")
        if st != last:
            print("status:", st, flush=True)
            last = st
        if st in ("succeeded", "failed", "error"):
            print("error:", d.get("error"))
            print("failedStep:", d.get("failedStep"))
            print("full:", json.dumps(d)[:1500])
            break
        time.sleep(10)
    else:
        print("TIMEOUT last:", last)
finally:
    if os.path.exists(CFGF):
        os.remove(CFGF)
