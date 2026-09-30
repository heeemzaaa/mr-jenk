---
name: Ticket
about: Standard ticket template for Buy-01 work
title: "[Service] Short description"
labels: []
assignees: []
---

## Summary

<!-- One or two sentences: what is this ticket, and why does it exist. -->

## Scope

- In scope:
- Out of scope:

## Contract impact

<!-- Does this change an API shape, request/response, or event payload that
another service or your peer's in-progress work depends on?
If yes, has it been agreed on paper before implementation starts? -->

- [ ] N/A — no cross-service contract touched
- [ ] Yes — agreed with peer in: <link to issue/comment/doc>

## Definition of Done

- [ ] Code written and self-reviewed
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing (if this touches an endpoint)
- [ ] Ownership/authZ checks in place where relevant (seller-only endpoints, product/media ownership)
- [ ] File validation enforced **server-side** where relevant (MIME sniffing, 2 MB limit) — not just client-side
- [ ] Error handling returns meaningful status codes, no unhandled 5xx
- [ ] `/actuator/health` exposed if this ticket adds/changes a service
- [ ] Accessibility check (labels, keyboard nav, ARIA) on any UI touched
- [ ] Responsive check (mobile/desktop) on any UI touched
- [ ] No hardcoded config where it should be externalized
- [ ] ADR written if this was an architectural decision
- [ ] Commit messages follow convention (imperative mood, reasoning in body)
- [ ] Board updated to reflect actual status

## Notes

<!-- Anything the reviewer or your peer needs to know that isn't obvious
from the diff. -->