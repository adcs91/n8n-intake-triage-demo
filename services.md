# What I build, and how I work

I build small, reliable automations for businesses and I take overflow work from agencies.
The work I am good at is the unglamorous part: the intake, the routing, the retries, and the
handoff to a human when the rules should not decide.

## Typical builds

- **Intake triage** - form / email / DM in, scored on commercial intent, routed to a CRM record or a human queue with the reason attached.
- **Idempotent syncs** - anything that polls or can be replayed: cursor pagination, dedupe on a business key, upserts that cannot double-write.
- **Failure paths** - retries with backoff, error outputs wired to an alert, and a human fallback instead of a silent drop.
- **Repair work** - an automation that "runs" but does not actually do the thing, and nobody noticed.

## How I work

1. **Scope in writing first.** One source, one destination, one decision rule. If it needs more than that, we split it.
2. **Mock before access.** I write a small mock of the API that returns the failures I am afraid of (429s, empty pages, the same row twice) and make the workflow survive it. That usually happens before I ever see your credentials.
3. **Failure paths are part of the build, not a phase 2.** If you cannot see what happens when the downstream call fails, the build is not finished.
4. **Handover is evidence.** You get the workflow JSON, one real execution, a run log (written / skipped as duplicate / failed), and a 15-minute walkthrough.

## What a first build usually includes

- one trigger, one destination
- retries and an error path
- a run log you can read
- a short written walkthrough

**Not included unless we agree on it:** multiple sources merged, permission systems, front-end UI, historical backfill, ongoing monitoring.

## What I need from you

- read-only API token or key, and edit access to the destination table or base. Never your password.
- ten historical examples of a "good" record, so the rules are not my guess.
- who receives the failures - an email address or a channel.

## Proof, not claims

- Intake triage workflow, with an execution where the downstream call failed: [README](README.md)
- Gumroad to Airtable, with a re-run that writes 0 new rows: [gumroad-README.md](gumroad-README.md)
- 84-second walkthrough: [walkthrough.mp4](walkthrough.mp4)

## Honest limits

I am early. These are my own builds, not client projects, and I do not present them as client work.
I work async from UTC+8 and overlap EU and US mornings. I will tell you if a job is not worth doing
rather than take it and deliver something you cannot use.

Contact: ppssht0070h71@outlook.com
