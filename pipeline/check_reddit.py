#!/usr/bin/env python3
"""Does each city's subreddit exist, and can anyone read it?

Reddit refuses the places the rest of this pipeline runs from (cloud servers, automated browsers), so this one check
is made from an ordinary home connection. From the repo:

    python3 pipeline/check_reddit.py

or without the repo, one line in a terminal:

    curl -fsSL https://raw.githubusercontent.com/adrimayy/where-should-adriano-live/main/pipeline/check_reddit.py | python3 -

It asks Reddit once for each subreddit that Wikidata records for a city (pipeline/input/places.json), slowly, and
writes what Reddit said to build/reddit_check.json: for each subreddit its HTTP status, whether it is public, whether
it is marked 18+, and how many members it has. It reads nothing else and sends nothing but the subreddit's name.
Copy the result to pipeline/input/reddit_check.json; pipeline/write_places.py then shows a Reddit link only for the
subreddits that answered, are public, are not 18+ and have at least 200 members. Safe to stop and run again: it
picks up where it left off. About 20 minutes for 485 subreddits."""
import datetime, json, os, pathlib, sys, time, urllib.error, urllib.parse, urllib.request

BRANCH = os.environ.get('ATLAS_BRANCH', 'main')
RAW = f'https://raw.githubusercontent.com/adrimayy/where-should-adriano-live/{BRANCH}/pipeline/input/places.json'
UA = 'where-should-you-live link check/1.0 (https://github.com/adrimayy/where-should-adriano-live)'


def where():
    """the repo this file sits in, or the copy in the home folder, or the current folder"""
    here = pathlib.Path(sys.argv[0]).resolve().parent.parent if sys.argv and sys.argv[0] not in ('', '-') else None
    for root in (here, pathlib.Path.home() / 'where-should-adriano-live', pathlib.Path.cwd()):
        if root and (root / 'pipeline').is_dir():
            return root
    return pathlib.Path.cwd()


def ask(sub):
    url = 'https://www.reddit.com/r/' + urllib.parse.quote(sub) + '/about.json'
    for attempt in range(6):
        try:
            rq = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'application/json'})
            with urllib.request.urlopen(rq, timeout=30) as r:
                final, body = r.geturl(), r.read()
            if '/about' not in final:   # sent somewhere else (a search page): there is no such subreddit
                return dict(status=404, why='redirected')
            d = (json.loads(body) or {}).get('data') or {}
            return dict(status=200, type=d.get('subreddit_type'), over18=bool(d.get('over18')),
                        subscribers=d.get('subscribers'), name=d.get('display_name'))
        except urllib.error.HTTPError as e:
            if e.code == 429:   # asked too fast: wait as long as Reddit says, then try again
                wait = int(e.headers.get('Retry-After') or e.headers.get('x-ratelimit-reset') or 60)
                print(f'    Reddit asks for a pause of {wait} s'); time.sleep(min(max(wait, 10), 600) + 2)
                continue
            why = ''
            try:
                why = (json.loads(e.read() or b'{}') or {}).get('reason', '')
            except Exception:   # noqa
                pass
            return dict(status=e.code, why=why)
        except Exception as e:   # noqa: a dropped connection: try twice more, then move on
            last = str(e)[:80]
            if attempt >= 2:
                break
            time.sleep(4)
    return dict(status=0, why=locals().get('last', 'too many pauses'))


def main():
    root = where()
    src = root / 'pipeline' / 'input' / 'places.json'
    if src.exists() and '--fresh-list' not in sys.argv:
        places = json.loads(src.read_text(encoding='utf8'))
    else:
        with urllib.request.urlopen(urllib.request.Request(RAW, headers={'User-Agent': UA}), timeout=60) as r:
            places = json.loads(r.read())
    subs = sorted({v['sub'] for v in places['cities'].values() if v.get('sub')}, key=str.lower)
    out = root / 'build' / 'reddit_check.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    done = json.loads(out.read_text(encoding='utf8')) if out.exists() else {}
    res = done.get('subs', {})
    todo = [s for s in subs if res.get(s, {}).get('status') not in (200, 403, 404)]
    print(f'{len(subs)} subreddits, {len(subs) - len(todo)} already checked, {len(todo)} to ask. About {len(todo) * 2.2 / 60:.0f} minutes.')
    blocked = 0
    for i, s in enumerate(todo, 1):
        res[s] = ask(s)
        st = res[s]['status']
        blocked = blocked + 1 if st == 0 or (st == 403 and not res[s].get('why')) else 0   # a private subreddit says why
        print(f"  {i}/{len(todo)}  r/{s}: {st} {res[s].get('type') or res[s].get('why') or ''} {res[s].get('subscribers') or ''}")
        out.write_text(json.dumps(dict(asof=datetime.date.today().isoformat(), subs=res), indent=0, sort_keys=True), encoding='utf8')
        if blocked >= 8:
            print('\nReddit is refusing this connection too (eight refusals in a row). Stopping; nothing more to do from here.')
            break
        time.sleep(2.2)
    ok = sum(1 for v in res.values() if v.get('status') == 200 and v.get('type') == 'public' and not v.get('over18'))
    print(f'\nDone: {ok} of {len(subs)} subreddits answered and are public.\nSaved to {out}')


if __name__ == '__main__':
    main()
