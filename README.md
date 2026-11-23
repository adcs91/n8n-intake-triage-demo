# Intake Triage — a real n8n build

This is a working n8n workflow I built and ran locally, not a client project and not a mockup.
Every screenshot below comes from a real execution on 2026-11-23. All inputs are invented.

![Workflow canvas](shots/01-canvas.png)

## What it does

Form in -> parse -> score -> route -> CRM write, with a human queue for anything the rules
should not decide, and an alert path when the CRM call fails.

| Node | Module | What it does |
|---|---|---|
| 1 | Receive Inquiry | POST /inquiry webhook |
| 2 | Parse Fields | normalises name / email / message / qty / deadline |
| 3 | Score | keyword scoring on 4 commercial intents (price, spec, lead time, stock) |
| 4 | Route | 3+ hits -> A qualified; 1-2 hits -> B human queue; 0 -> C parked |
| 5 | Write CRM Record | HTTP call to the CRM, retry on fail: 3 tries, 2 s apart |
| 6 | Human Queue | records the reason instead of guessing |
| 7 | Park | no commercial intent |
| 9 | Alert (error path) | reached only through node 5's error output |

Numeric prefixes are execution order, so the canvas reads left to right.

## Failure handling (the part that matters)

- Node 5 is set to `retryOnFail: true, maxTries: 3, waitBetweenTriesMs: 2000`.
- On a hard failure the item leaves through the **error output**, not the success output,
  and lands on node 9 (alert). Nothing is silently dropped.
- Anything the rules cannot decide goes to the human queue with the reason attached.

Here is a run where the CRM endpoint refused the connection — the item goes out of the error
output and node 9 executes:

![Error path executed](shots/03-run-error.png)

And the execution history, both runs, with the failure path handled:

![Executions](shots/05-executions.png)

## Files

- `workflow-intake-triage.json` — exported workflow, importable as-is
- `shots/` — the screenshots above


## Second build in this repo: Gumroad sales -> Airtable

Same principle, different failure mode. Built without a Gumroad token against a local mock that
reproduces the parts that break it: cursor pagination, a 429 on the first call, and a duplicate row.
Run 1: the 429 fires, the node retries, 5 rows written. Run 2 with the same input: **0 inserted, 5 updated** -
a re-run cannot create a second row.

Full write-up: [gumroad-README.md](gumroad-README.md) - workflow: `gumroad-workflow.json` - raw log: `gumroad-log.txt`
## What this is not

Not a client deployment, not production-hardened, and it uses no client data.
It exists to show how I build and how I handle the failure paths.
