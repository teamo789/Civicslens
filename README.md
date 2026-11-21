# CivicLens 🏙️🔍
> **AI-Powered Citizen Complaint Triage and Municipal Issue Prioritization**

CivicLens streamlines municipal governance by empowering citizens to report infrastructure and public safety hazards with photo evidence and geolocation, while leveraging automated AI triage to score urgency, detect duplicate reports, and automatically route issues to appropriate city departments.

---

## 👥 Role-Based Authentication & Demo Credentials

CivicLens includes a complete demo role-based authentication system built using vanilla JavaScript and `localStorage`. For hackathon judges and evaluators, **1-Click Quick Demo Login** buttons are directly available on the login page:

| Role | Demo Email | Demo Password | Default Persona / Permissions |
| :--- | :--- | :--- | :--- |
| **👤 Citizen** | `citizen@civiclens.org` | `citizen123` | **Alex Rivera (Ward 4 Resident)**<br/>• Submit issues with photos, descriptions, and GPS.<br/>• Track submitted complaints and statuses.<br/>• View assigned Ticket IDs.<br/>• *Strictly blocked from officer triage/management controls.* |
| **🛡️ Municipal Officer** | `officer@civiclens.gov` | `officer123` | **Officer Sarah Chen (Badge #MUNI-8042)**<br/>• Command Center & Dispatcher Dashboard.<br/>• Dynamic municipal KPIs.<br/>• Priority triage queue (Active vs. Resolved Archive).<br/>• Automated hazard analysis & computer vision dossier.<br/>• Status updating & case reopening. |

---

## 📁 Project File Structure

```text
CivicLens/
├── assets/                  # Project assets and placeholders
├── css/
│   ├── dashboard.css        # KPI stat cards, login UI, queue tabs, card grid & table
│   ├── form.css             # Submission form, photo dropzone, GPS picker, citizen tracker
│   └── styles.css           # Design tokens, color system, severity & status badges, toasts
├── js/
│   ├── api.js               # Service bridge & API contract for Member 2 backend
│   ├── app.js               # Application bootstrap, Auth/session manager, toasts, AI badge
│   ├── dashboard.js         # Officer Dashboard, dynamic KPIs, active/resolved queues, reopening
│   ├── mockData.js          # Realistic seed complaints with SVG visuals & AI triage scores
│   └── submitForm.js        # Form validation, drag-and-drop preview, GPS, citizen ticket tracker
├── index.html               # Landing & Login Page (when logged out) / Officer Dashboard (when logged in)
├── README.md                # Documentation, demo guide, and API integration contract
└── submit.html              # Dedicated Citizen Complaint Portal & Status Tracker
```

---

## 🚀 How to Run and Test

The project uses zero third-party dependencies (**100% native HTML5, CSS3, and modern vanilla JavaScript ES6+**). It works completely offline with realistic seed data.

### Option 1: Using Python (Recommended)
Open a terminal in the `Civicslens` project folder and run:
```bash
python -m http.server 3000
```
Open [`http://localhost:3000`](http://localhost:3000) in your web browser.

### Option 2: Using Node.js
```bash
npx serve .
```

### Option 3: Direct Browser Launch
Open `index.html` directly in Chrome, Edge, Safari, or Firefox:
```powershell
Start-Process "index.html"
```

---

## 🧪 Interactive Testing Checklist for Hackathon Judges

### 1. Login System & Role Separation
1. Open `index.html` in an unauthenticated window.
2. Observe the GovTech Landing Page with **Role Selection Tabs** (`👤 Citizen Portal` vs `🛡️ Municipal Officer`).
3. Click **`⚡ Login as Citizen`** under Demo Credentials:
   - Notice the toast confirmation and automatic redirect to `submit.html` (Citizen Portal).
   - Verify that officer management controls and dispatcher metrics are absent.
4. Click **`Log Out`** in the top navbar:
   - Returns to `index.html`.
5. Click **`⚡ Login as Officer`**:
   - Logs into the **Municipal Triage Command Center** as Officer Sarah Chen (`MUNI-8042`).

### 2. Citizen Portal & Ticket Tracker (`submit.html`)
1. While logged in as Citizen, navigate to `submit.html`.
2. **Submit a Complaint**:
   - Use the **`⚡ Quick Demo Autofill`** buttons (e.g. `🚗 Critical Pothole` or `⚡ Sparking Wire`) or fill out custom details.
   - Click **`Locate Me`** to test the browser Geolocation GPS coordinate capture.
   - Drag and drop or upload an image to see the live photo preview and file size badge.
   - Click **`Triage & Submit Issue`**.
3. **Ticket Confirmation & Tracking**:
   - Notice the green confirmation card with the official **Ticket ID** (e.g. `#CVL-2042`) and assigned municipal department.
   - Scroll down to the **"📋 My Submitted Complaints & Status Tracker"** section to observe your newly submitted issue rendered with its live status badge, severity tag, and AI urgency score!
   - Type a Ticket ID into the tracker search bar to test real-time ticket lookup.

### 3. Officer Dashboard & Dynamic Statistics (`index.html`)
1. Log in as an Officer.
2. Inspect the 4 KPI metric cards:
   - **Total Complaints Submitted**: Dynamically calculated across all complaints (Active + Resolved). *Unnecessary monitor icon removed.*
   - **Critical / High Active**: Dynamically counts active (unresolved) emergencies.
   - **Avg Priority Score**: Dynamic average of AI urgency scores for active cases.
   - **Resolution Rate**: Dynamically calculated percentage of total complaints marked as resolved.
3. Switch between **Cards View** and **Table View** using the view toggle buttons in the toolbar.
4. Test real-time filtering with severity chips (`Critical`, `High`, etc.), category selector, and live keyword search.

### 4. Resolved Complaints Archive & Case Reopening
1. On an active complaint (e.g. in Card or Table view), change its status to **`✓ Mark Resolved`** (or open the **Triage Dossier** and click **`✓ Mark Resolved`**).
2. **Immediate Removal from Active Queue**:
   - The resolved complaint is removed immediately from the Active Complaints queue.
   - The *Critical/High Active* count drops and the *Resolution Rate %* increases dynamically!
3. Click the **`📁 Resolved Cases Archive`** queue tab:
   - Notice the resolved case stored permanently in the archive with its resolution badge.
4. Click **`Reopen Case`**:
   - The case is restored back to the Active Complaints Queue (`In Progress`).
   - The statistics update dynamically in real time.

### 5. Honest AI Status Indicator
- Notice the badge in the top navbar: **`⚡ Demo AI / Fallback Mode`**.
- It honestly indicates that the system is currently using deterministic keyword heuristics and offline computer vision mock scoring, without falsely claiming a real external LLM API is connected.
- If Member 2 configures `API_CONFIG.USE_BACKEND = true` in `js/api.js`, the badge automatically updates to **`🟢 Live Backend AI Active`**.

---

## 🤝 Member 2 Integration Guide (Backend & AI)

Member 2 can attach their live backend endpoints in [js/api.js](file:///c:/Users/tamos/coding/hackathon/civicslens/Civicslens/js/api.js#L11-L16):

```javascript
const API_CONFIG = {
  USE_BACKEND: true,                    // Change to true when backend is running
  BASE_URL: "http://localhost:5000/api" // Point to your backend endpoint
};
```
No HTML or frontend layout code needs to be modified when connecting the backend.
