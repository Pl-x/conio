## Coverage Check (What Exists vs Missing)

- **Dropdowns + auto-population (item 2)**: **Partially implemented.**  
  Requester UI pulls `system_types`, `categories`, `source_ips`, `destination_ips`, and `services` from MySQL via `/api/mysql-options`, and auto-fills correlated fields when a source/destination value is selected or via `/api/auto-populate`. There is **no regex/IP/protocol/port validation** on free‑text input yet.
  
  ```235:276:frontend/src/pages/RequesterPage.jsx
  if ((field === 'sourceIP' || field === 'destinationIP') && !isOthersCategory(index)) {
    const matchedOption = ipArray.find(ip => ip.value === value);
    if (matchedOption) {
      // populate other fields from the same row
      ...
    } else {
      // free text → clears auto flags, tries backend auto-populate
      autoPopulateFromBackend(index, field, value);
    }
  }
  ```
  
- **Rule-based validation on submit (item 3)**: **Missing.**  
  Backend `create_acl_request` only checks presence of required fields, **no pattern or semantic validation** of IPs, services, or descriptions.
  
  ```857:895:backend/main.py
  required_fields = ['system_type', 'category', 'sourceIP', 'destinationIP', 'service']
  for field in required_fields:
      if not data.get(field):
          return jsonify({"error": f"Missing required field: {field}"}), 400
  # no further validation
  ```
  
- **Reviewer templates / shortcuts (item 4)**: **Missing.**  
  `ReviewerPage` shows requests and workflow only; there is no template CRUD or UI to save rules as templates.
  
  ```250:316:frontend/src/pages/ReviewerPage.jsx
  <div className="requests-grid">
    {filteredRequests.map((request) => (
      <div key={request.id} className="workflow-card">
        ...workflow/status display...
      </div>
    ))}
  </div>
  ```
  
- **Excel generation after validation (item 5)**: **Missing.**  
  Current Excel logic is one‑way (Google Sheets → MySQL) in `load_excel_data` / `sync_to_mysql`. No export of user requests to Excel.
  
- **Role-based template creation (item 6)**: **Partially present.**  
  RBAC routing exists (admin vs user) and `/acl_requests` is admin‑only, but there is no template feature that uses it.
  
  ```54:67:frontend/src/App.jsx
  <Route path="/reviewer" element={<RoleBasedRoute allowedRoles={['admin']}><ReviewerPage /></RoleBasedRoute>} />
  <Route path="/requester" element={<RoleBasedRoute allowedRoles={['user']}><RequesterPage /></RoleBasedRoute>} />
  ```
  
- **Info/help button (item 7)**: **Missing.**
  
**Net:** Only dropdown + auto‑population (item 2) is partially done; items 3–7 still need to be implemented.

---

## Detailed Implementation Plan

This section describes **what to change** and **how to do it** for each missing requirement.

---

### 1. Strong Validation for IP / Protocol / Port (Item 2 & 3)

**Goal:** Prevent invalid IP addresses, nonsensical protocols/ports, and obviously bad free‑text before inserting into `acl_requests` or generating Excel.

#### 1.1. Backend: Centralised Validators

- **File:** `backend/main.py`  
- **Add helper functions** near the existing `looks_like_ip` / `looks_like_service` utilities:

  - `validate_ip(value: str) -> bool`  
    - Use `looks_like_ip` regex as a base, but:
      - Split on `.` and ensure each octet is in `0–255`.
      - Support `/CIDR` notation with prefix `0–32`.
  - `validate_service(value: str) -> bool`  
    - Allow:
      - `tcp/<port>`, `udp/<port>`, `icmp`, `ip`.
      - Single ports: `1–65535`.
      - Ranges: `start-end` where `1 ≤ start ≤ end ≤ 65535`.
      - Known names: `http`, `https`, `ssh`, `ftp`, etc (you already have a list in `looks_like_service`).
  - `validate_request_payload(data: dict) -> list[str]`  
    - Perform:
      - Required field checks (already done).
      - `validate_ip` for `sourceIP`, `destinationIP`.
      - `validate_service` for `service`.
      - Length/character checks for `description` (no forbidden chars, max length, etc).
    - Return a **list of error messages** (empty if valid).

- **Integrate into** `create_acl_request`:

  ```857:895:backend/main.py
  errors = validate_request_payload(data)
  if errors:
      return jsonify({"error": "Validation failed", "details": errors}), 400
  ```

#### 1.2. Frontend: Basic Client-Side Hints (Optional but Helpful)

- **File:** `frontend/src/pages/RequesterPage.jsx`
- Add simple regex patterns to inputs:
  - For `Source IP` and `Destination IP` `<input>` elements, consider:
    - HTML `pattern` attribute for basic IPv4 structure.
    - Or inline JS check before submit to show a human‑friendly message (still rely on backend as source of truth).
- On `handleBulkSubmit`, if backend returns `400` with `details`, surface them nicely to the user (e.g., list of validation errors per row).

---

### 2. Template Model & API (Item 4 & 6)

**Goal:** Allow admins to create reusable, named rule templates that requesters can pick as shortcuts.

#### 2.1. Database Model

- **File:** `backend/models.py`  
- **Add a `Template` model**:

  - Fields (minimum):
    - `id` (PK)
    - `name` (unique, human‑readable template name, e.g. "IT Server")
    - `system_type`
    - `category`
    - `source_ip`
    - `source_host`
    - `destination_ip`
    - `destination_host`
    - `service`
    - `description` (template description / default reason)
    - `created_by` (username or user id of the admin)
    - `created_at`, `updated_at`
  - Add a `to_json()` method similar to `ACLRequest.to_json()` for frontend.

#### 2.2. Template API Endpoints

- **File:** `backend/main.py`
- Add routes (all JSON):

  1. `POST /api/templates` – **Create template (admin‑only)**  
     - Decorate with `@token_required('admin')`.  
     - Read JSON, validate with the same validators as requests.  
     - Save as `Template` row.  
     - Return created template JSON.

  2. `GET /api/templates` – **List templates for all roles**  
     - Decorate with `@token_required()` (any logged‑in user).  
     - Return `templates: [ ... ]` list using `Template.to_json()`.

  3. (Optional) `PUT /api/templates/<id>` – **Update template (admin)**  
  4. (Optional) `DELETE /api/templates/<id>` – **Delete template (admin)**  

#### 2.3. Wiring RBAC

- You already have `token_required(required_role=None)` and `RoleBasedRoute`:

  ```674:709:backend/main.py
  def token_required(required_role=None):
      ...
  ```

- Use:
  - `@token_required('admin')` for create/update/delete.
  - `@token_required()` for read/list (both `user` and `admin` can consume templates).

---

### 3. Frontend: Using Templates

#### 3.1. ReviewerPage – Admin Creates Templates

- **File:** `frontend/src/pages/ReviewerPage.jsx`

Add a **"Templates" panel**:

1. **State:**
   - `const [templates, setTemplates] = useState([]);`
   - `const [newTemplate, setNewTemplate] = useState({ name: "", system_type: "", category: "", source_ip: "", destination_ip: "", service: "", description: "" });`

2. **Fetch templates on load:**
   - In `useEffect`, after fetching requests, also fetch `/api/templates` with the token and store into `templates`.

3. **Create template form:**
   - UI fields:
     - Name (text input)
     - System Type (dropdown from existing system types or free text)
     - Category (dropdown based on system type or free text)
     - Source IP / Destination IP / Service / Description (inputs or small form).
   - **Optional**: Provide a **"Create from request"** button on each workflow card:
     - On click, prefill `newTemplate` from that `request`’s fields, then show the form.

4. **Submit handler:**
   - `handleCreateTemplate`:
     - `POST` to `/api/templates` with `Authorization: Bearer <token>`.
     - On success, append to `templates` and clear `newTemplate`.
     - Show success or error message.

5. **Render templates list:**
   - Simple table or cards with:
     - Template name
     - System type / category
     - Source → Destination / service
   - Optional delete button (if `DELETE /api/templates/<id>` implemented).

#### 3.2. RequesterPage – Applying Templates

- **File:** `frontend/src/pages/RequesterPage.jsx`

1. **State:**
   - `const [templates, setTemplates] = useState([]);`

2. **Fetch templates:**
   - In `useEffect`, after `fetchOptions()`, call once:
     - `GET /api/templates` with token.
     - Store in `templates`.

3. **Per-row template select:**
   - In the table row render (`requests.map(...)`), add a column before `System Type` or after it:
     - `<select value={selectedTemplateIdForRow} onChange={(e) => applyTemplate(index, e.target.value)}>`
     - Options: `None`, then `templates.map(t => <option value={t.id}>{t.name}</option>)`.

4. **applyTemplate(index, templateId):**
   - Find template object: `const tmpl = templates.find(t => t.id === Number(templateId));`
   - If found, patch that row in `requests`:
     - `system_type = tmpl.system_type`
     - `category = tmpl.category`
     - `sourceIP = tmpl.source_ip`
     - `destinationIP = tmpl.destination_ip`
     - `service = tmpl.service`
     - `description = tmpl.description`
   - Also update `autoPopulatedFields[index]` to mark these as auto‑filled.
   - Let user then tweak IP/description as needed.

---

### 4. Excel Generation After Validation (Item 5)

**Goal:** After all rows are valid, generate and return an Excel file containing the requested rules.

#### 4.1. Backend: Export Endpoint

- **File:** `backend/main.py`

Add `POST /api/export-requests`:

1. Decorate with `@token_required()` (or stricter if needed).
2. Input:
   - Either:
     - JSON body: `{ "requests": [ { system_type, category, sourceIP, destinationIP, service, description, action }, ... ] }`  
       (frontend sends what the user has just validated), or
     - `request_ids` to re‑load saved `ACLRequest`s.
3. Process:
   - For each request:
     - Reuse `validate_request_payload` to ensure all rows are still valid.
     - If any fails, return `400` with detailed errors (same structure as submit).
4. Build Excel:
   - Use `pandas`:
     - Build a `DataFrame` with columns matching your reference Excel (e.g. `Source IP`, `Destination IP`, `Service`, `Description`, etc.).
   - Write to an in‑memory buffer:
     - `from io import BytesIO`
     - `output = BytesIO()`
     - `df.to_excel(output, index=False)`
     - `output.seek(0)`
5. Return as a file:
   - Use `flask.send_file`:
     - `send_file(output, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', as_attachment=True, download_name='acl_requests.xlsx')`

#### 4.2. Frontend: Download Button

- **File:** `frontend/src/pages/RequesterPage.jsx`

1. Add a button near the submit section:
   - Label: `"Validate & Download Excel"` or similar.
2. Handler `handleValidateAndDownload`:
   - First, run the same frontend checks you use for submission (required fields).
   - Call `fetch(`${API_BASE_URL}/api/export-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer <token>' }, body: JSON.stringify({ requests }) })`.
   - If response is `400` JSON, show validation errors.
   - If response is `200` with binary Excel, use `Blob` and `URL.createObjectURL` to trigger a download in the browser.

---

### 5. Info / Help Panel (Item 7)

**Goal:** Provide an info button with step‑by‑step guidance and common mistakes, editable by you.

#### 5.1. Backend (Optional Simple Storage)

For a minimal viable version, you can skip backend and just hard‑code content in React.  
If you want editable content via backend:

- Add a simple `HelpContent` model or just store content in a config table.  
- Expose `GET /api/help` that returns `{ requester_help_markdown, reviewer_help_markdown }`.  
- Admin‑only `PUT /api/help` for updating the text.

#### 5.2. Frontend: Info Button + Modal

- **Files:**  
  - `frontend/src/pages/RequesterPage.jsx`  
  - `frontend/src/pages/ReviewerPage.jsx`

1. **State:**
   - `const [showHelp, setShowHelp] = useState(false);`
2. **Info button in header:**

   ```jsx
   <button className="btn-info" type="button" onClick={() => setShowHelp(true)}>
     ℹ️ How to use this page
   </button>
   ```

3. **Modal / panel:**
   - Render only when `showHelp` is `true`.
   - Content can be:
     - Static JSX with bullet‑point instructions and examples.
     - Or if you wire backend help API: fetch and render markdown/HTML.
4. **Close:**
   - Simple "Close" button that sets `showHelp(false)`.

5. **Styling:**
   - Use your existing modal styles (like the Reviewer details modal) as a reference for consistency.

---

### 6. Recommended Order of Implementation

1. **Backend validation helpers + integrate into `create_acl_request`**  
   - This immediately hardens your system.
2. **Template model + `/api/templates` endpoints**  
   - Enables admin template management.
3. **Requester + Reviewer template UI**  
   - Allows real‑world use of templates.
4. **Excel export endpoint + download button**  
   - Delivers the final Excel file requirement.
5. **Info/help modals**  
   - Improves UX and documentation for users and reviewers.

Use this document as a checklist: once each bullet is implemented and tested, you can come back here and mark the section as **Done** or update with any deviations from the original plan.