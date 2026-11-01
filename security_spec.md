# Security Specification & Threat Model

## 1. Data Invariants
- `users`: A user document must match the authenticated `request.auth.uid`. A user cannot elevate their own role to admin upon registration.
- `bookmarks`: A bookmark must be created and queried only by its owner (`userId == request.auth.uid`). Bookmarks cannot be modified or deleted by other users.
- `comments`: A comment author must be the authenticated user (`userId == request.auth.uid`). Comments must have valid content (1-1000 characters). Only author can edit/delete, or admin can moderate.
- `ads`: Advertisements with `status: "approved"` can only be set or transitioned by an admin (`isAdmin()`). Non-admins may only submit ads with `status: "pending"`. Only approved ads can be read publicly by readers; pending/rejected ads can only be read by the creator or admin.
- `trending_notifications`: Can be read by signed-in users. Only admins or server can create/broadcast notifications.
- `admins`: Only readable and writable by admins or bootstrapped admin (`benisius.rb@gmail.com`).

## 2. The Dirty Dozen Payloads (Intended to FAIL with PERMISSION_DENIED)
1. **Payload 1 (Self-Assigned Admin)**: User creates `users/{uid}` with `role: "admin"`.
2. **Payload 2 (Ghost Field in User)**: User updates `users/{uid}` with `extraSecret: true`.
3. **Payload 3 (Bookmark Stealing)**: User A creates a bookmark with `userId: "userB"`.
4. **Payload 4 (Bookmark Snooping)**: User A attempts to list bookmarks where `userId == "userB"`.
5. **Payload 5 (Comment Spoofing)**: User A creates a comment under `userId: "userB"` or with `likes: 9999`.
6. **Payload 6 (Oversized Comment)**: Comment content string exceeding 1000 characters.
7. **Payload 7 (Ad Self-Approval)**: Regular user submits an ad with `status: "approved"` directly.
8. **Payload 8 (Unauthorized Ad Update)**: Regular user changes an ad's status from "pending" to "approved".
9. **Payload 9 (Notification Forgery)**: Non-admin user creates a record in `/trending_notifications/`.
10. **Payload 10 (Admins Collection Tampering)**: Non-admin tries to write to `/admins/{uid}`.
11. **Payload 11 (Unauthenticated Comment Read / Bookmark Write)**: Unauthenticated request attempting to write bookmark.
12. **Payload 12 (Immutability Bypass)**: Comment update attempts to alter `userId` or `articleId`.
