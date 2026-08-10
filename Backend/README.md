# Government Service Tracker

An enterprise-ready civic governance portal designed to solve public infrastructure information fragmentation caused by political devolution. This platform bridges the transparency gap by aggregating distributed regional data streams, tracking application processes using a rigid Finite State Machine, and alerting citizens of critical milestones through automated SMS and email hooks.

 ## The Citizen's Problem: "The Black Hole"
The Issue: When citizens apply for local government services (like business permits, building approvals, or bursaries), they submit their paperwork and enter a "black hole." They have no idea who is handling their file, where it is stuck, or how long it will take.

 **Solution:** By generating an immutable tracking code (TRK-**......**) instantly upon submission, citizens can input this token into a public search field (ApplicationDetailView) to see the transparent, real-time lifecycle status of their request without having to visit county offices physically.

 ## The Civil Servant's Problem: "Process Disorganization"
The Issue: Without an enforced workflow pipeline, files get misplaced, actions are performed out of sequence (e.g., approving an application before it has been formally verified), and there is no audit log showing who authorized a particular change.

 **Solution:** The Finite State Machine (FSM_transitions.py) acts as a digital guardrail. It strictly blocks illegal operations (like jumping from SUBMITTED straight to APPROVED). Staff can only move an application to the next logical step, and every state transition forces an entries logging step into the StatusLog table—instantly creating absolute professional accountability.

 ## The Structural Problem: "Fragmented Operations"
The Issue: Public updates, tenders, and civic announcements are usually spread across outdated websites, physical notice boards, or social media pages, making them incredibly difficult for the everyday public to find reliably.

**Solution:** The application centralizes civic data feeds (CountyNoticeListView & CountyNoticeByCountyView) right alongside application portals. This transforms a fragmented set of offices into a single, cohesive, digital gateway.

## Key Features

- **Unified Civic Service Registry:** Replaces dozens of fragmented, slow-loading legacy county web landing pages with a clean, centralized web workspace.
- **Autonomous Scraper Engine:** Uses a robust background worker pipeline to extract dates, rules, application guidelines, and PDF announcements from un-indexed public notices.
- **Dynamic Application Tracker:** Visualizes live document statuses using transparent progress tracking states (e.g., `Submitted`, `Under Review`, `Action Required`, `Approved`).
- **Proactive Notification Matrix:** Delivers real-time SMS alerts (via Africa's Talking or Twilio gateways) when file changes or deadlines approach.
- **Civic Accountability Dashboard:** Ranks regional offices transparently using automated Efficiency Indexes, benchmarking public administrative processing speeds.

## Tech Stack

### Frontend
- **React.js** (Functional architecture using Hooks and Context API)
- **Tailwind CSS** (Utility-first styling optimized for high performance and clean UI)
- **Lucide Icons** (Consistent structural iconography system)

### Backend & Workers
- **Python / Django REST Framework** or **Node.js (Express)**
- **Celery** (Distributed task queue pipeline handling delayed automation routines)
- **BeautifulSoup4 & Requests** (Flexible data extraction layer)

### Storage & Cache
- **PostgreSQL** (ACID-compliant relational engine for reliable auditing trails)
- **Redis** (In-memory broker handling message distribution queues and rapid data cache hits)

---

## Architecture Layout

```text
  [ React SPA Client ] <---> [ JWT Secure API Gateway ] <---> [ PostgreSQL DB ]
                                      |
                               [ Redis Broker ]
                                      |
                              [ Celery Workers ] <---> [ Public Web Scrapers ]
                                      |
                             [ Local SMS Gateway ]
```

---

## How to Clone & Project Setup

### Prerequisites
Before configuration, ensure you have the following environments installed locally:
- Git
- Python 3.10+ or Node.js v18+
- PostgreSQL

### 1. Repository Retrieval
Clone the system code tree locally using terminal configurations:
```bash
git clone https://github.com/derick871/Government_Services_Tracker
git
cd county-service-tracker
```

### 2. Backend Environment Construction
Navigate to the service engine directory, establish a protected environment container, and install all required modules:
```bash
cd backend
python -m venv venv
source venv/scripts/activate  

# Install essential execution libraries
pip install -r requirements.txt
```

Set up your environment variables file:
```bash
cp .env.example .env
```
Open the newly created `.env` file and input your local PostgreSQL access configurations, database names, and API keys.

Execute the relational database schema migrations and start the server:
```bash
python manage.py migrate
python manage.py runserver
```

### 3. Asynchronous Worker Execution
In a separate terminal instance within the active backend virtual environment, start the background tasks worker:
```bash
celery -A core worker --loglevel=info
```

### 4. Frontend Compilation Setup
Open an additional separate terminal window, access the client architecture repository, install required dependencies, and launch the web interface:
```bash
cd ../frontend
npm install
npm run dev
```
The interface will compile instantly and serve locally on `http://localhost:5173`.

---

## License

Distributed under the MIT License. See the block text layout below for legal authorization details:

