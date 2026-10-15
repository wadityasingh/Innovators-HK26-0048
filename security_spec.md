# Firestore Security Specification & Invariants (Phase 4)

## 1. System Invariants
- **Catch-All Default Deny**: Every document path not explicitly authorized is denied (`match /{document=**} { allow read, write: if false; }`).
- **Identity & Privilege Separation (RBAC)**:
  - Users cannot self-assign privileged roles (`Admin`, `Sustainability Coordinator`).
  - Bootstrapped administrator: `sadityasingh6275520@gmail.com` or documents in `/admins/{uid}`.
  - Department Staff can only log, view, and adjust resource readings for their assigned department (`departmentId`).
  - Ordinary users (Department Staff) cannot approve readings; only Sustainability Coordinators or Admins can transition a reading status to `Approved`.
  - Audit history and walkthrough inspection logbook are restricted to Sustainability Coordinators and Admins.
- **Relational Integrity**:
  - Readings cannot be submitted with negative quantities or invalid units.
  - Readings must enforce `enteredByUid == request.auth.uid`.

---

## 2. The "Dirty Dozen" Penetration Test Payloads (Expected: PERMISSION_DENIED)

1. **Self-Promotion to Admin**: Unauthenticated or non-admin user creates a user document `/users/attacker-uid` with `{ role: "Admin" }`.
   *Result*: `PERMISSION_DENIED` (Blocked by `/users/{userId}` create rule).

2. **Privilege Escalation via Update**: Department Staff user updates `/users/{uid}` modifying `role` from `"Department Staff"` to `"Admin"`.
   *Result*: `PERMISSION_DENIED` (Blocked by `incoming().role == existing().role`).

3. **Cross-Department Reading Injection**: Department Staff assigned to `dept-facilities` attempts to write reading for `departmentId: "dept-bio"`.
   *Result*: `PERMISSION_DENIED` (Blocked by `incoming().departmentId == getUserData().departmentId`).

4. **Self-Approval Exploit**: Department Staff creates a reading with status `"Approved"` directly.
   *Result*: `PERMISSION_DENIED` (Blocked by `incoming().status in ['Draft', 'Pending Review']`).

5. **Identity Spoofing in Reading**: Authenticated user attempts to submit reading with `enteredByUid: "victim-uid"`.
   *Result*: `PERMISSION_DENIED` (Blocked by `incoming().enteredByUid == request.auth.uid`).

6. **Negative Value Poisoning**: User submits reading with `originalValue: -1500`.
   *Result*: `PERMISSION_DENIED` (Blocked by `isValidReading` `data.originalValue >= 0`).

7. **Invalid Unit Injection**: User submits reading with `normalizedUnit: "Gallons"`.
   *Result*: `PERMISSION_DENIED` (Blocked by `data.normalizedUnit in ['kWh', 'Litres', 'Sheets']`).

8. **Audit Logbook Tampering**: Department Staff attempts to read `/audits/{auditId}` or write an audit report.
   *Result*: `PERMISSION_DENIED` (Blocked by `/audits/{auditId}` restricted to Admin/Coordinator).

9. **Global Tariff Tampering**: Non-admin user attempts to overwrite electricity tariff in `/settings/global`.
   *Result*: `PERMISSION_DENIED` (Blocked by `/settings/{settingId}` write restricted to `isAdmin()`).

10. **Admin Presence Injection**: Non-admin user writes to `/admins/{attacker-uid}`.
    *Result*: `PERMISSION_DENIED` (Blocked by `/admins/{userId}` write restricted to `isAdmin()`).

11. **Shadow Field Attack**: User creates reading containing extra unauthorized ghost field `{ isCertified: true, overrideMeter: true }`.
    *Result*: `PERMISSION_DENIED` (Blocked by strict schema key constraints).

12. **Unauthenticated Reading Access**: Anonymous/unauthenticated user attempts to list or get `/readings`.
    *Result*: `PERMISSION_DENIED` (Blocked by `isSignedIn()` requirement).
