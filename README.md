🌱 GreenCampus AI

Sustainable Campus Resource & Energy Audit Portal

An AI-assisted sustainability management platform for monitoring campus resources, identifying inefficiencies, and supporting data-driven environmental decisions.

GreenCampus AI helps colleges and educational institutions monitor electricity consumption, water usage, paper consumption, and waste management through a centralized dashboard. It combines resource tracking, sustainability targets, audit history, data visualization, and AI-assisted recommendations to help institutions make informed decisions about campus sustainability.

---

📌 Table of Contents

- "Overview" (#-overview)
- "Problem Statement" (#-problem-statement)
- "Our Solution" (#-our-solution)
- "Key Features" (#-key-features)
- "AI and Smart Insights" (#-ai-and-smart-insights)
- "Technology Stack" (#-technology-stack)
- "User Roles" (#-user-roles)
- "Data Management and Security" (#-data-management-and-security)
- "Dashboard Metrics" (#-dashboard-metrics)
- "Getting Started" (#-getting-started)
- "Environment Configuration" (#-environment-configuration)
- "Testing and Verification" (#-testing-and-verification)
- "Current Limitations" (#-current-limitations)
- "Future Scope" (#-future-scope)
- "Project Structure" (#-project-structure)
- "Contributing" (#-contributing)
- "License" (#-license)

---

🌍 Overview

Educational institutions consume significant amounts of electricity, water, paper, and other resources. Without organized records and clear reporting, it can be difficult to identify consumption patterns, monitor sustainability goals, and determine where improvements are needed.

GreenCampus AI provides a centralized portal for recording resource usage, tracking waste management, comparing departments, monitoring targets, and generating sustainability reports.

The project is designed for a single campus initially, with an architecture intended to support multiple campuses in the future.

❗ Problem Statement

Campus sustainability data is often difficult to track and compare when information is maintained in separate records or spreadsheets.

Common challenges include:

- Limited visibility into resource consumption.
- Difficulty comparing buildings and departments.
- Delayed identification of unusual consumption.
- Inconsistent waste segregation and diversion tracking.
- Lack of measurable sustainability targets.
- Time-consuming preparation of management reports.
- Limited evidence to support sustainability decisions.

💡 Our Solution

GreenCampus AI brings campus resource records and sustainability insights into one dashboard.

The platform aims to help institutions:

- Record and monitor resource consumption.
- Identify unusual readings and potential inefficiencies.
- Track sustainability targets and overall performance.
- Review AI-assisted recommendations supported by available data.
- Maintain an audit trail of important changes.
- Export sustainability information for analysis and reporting.

The system supports better decisions; it does not automatically guarantee resource savings or environmental improvements.

---

🚀 Key Features

1. 📊 Sustainability Dashboard

A centralized overview of campus sustainability performance.

- Overall Sustainability Index / Green Score.
- Electricity, water, paper, and waste indicators.
- Resource consumption trends.
- Sustainability target progress.
- Department reporting completeness.
- Priority alerts and recent activity.
- Date-range selection and resource comparisons.

Dashboard values should be based on the selected dataset and reporting period. Synthetic demo values are intended for demonstration, not as verified real-world campus measurements.

2. ⚡ Resource Monitoring

Record and review campus resource consumption.

- Electricity usage in kWh.
- Water consumption in litres or configured units.
- Paper usage in sheets.
- Resource readings associated with campus locations and departments.
- Historical comparisons and usage trends.
- Validation of entered readings.
- Identification of unusual or missing records.

3. ♻️ Waste Management

Track waste generation and support better waste-handling practices.

- Record waste quantities.
- Classify waste as wet, dry, or recyclable.
- Review waste management trends.
- Monitor waste diversion against configured targets.
- Identify opportunities for better segregation.
- Display recommendations for improvement.

4. 🤖 AI Recommendations

Provide decision-support recommendations based on available resource records.

- Highlight potential areas of excessive consumption.
- Suggest practical resource-saving actions.
- Explain relevant trends and supporting data.
- Show limitations when the available evidence is insufficient.
- Keep proposed changes separate from verified outcomes.

AI-generated explanations should not be treated as confirmed causes unless supported by reliable evidence.

5. 🎯 Sustainability Targets

Set and monitor sustainability goals.

- Configure targets for resource categories.
- Compare measured usage with target limits.
- Monitor progress over time.
- Identify targets that need attention.
- Allow authorized administrators to approve target changes.

Historical data may inform suggested targets, but authorized administrators remain responsible for final approval.

6. 🔔 Alerts and Notifications

Identify records or performance indicators that need attention.

- Unusual resource readings.
- Approaching or exceeded target limits.
- Missing department reports.
- Sustainability targets requiring review.
- Dashboard notifications and planned email-alert support.

Actual email delivery depends on the configured notification service and successful end-to-end verification.

7. 📑 Reports and Exports

Prepare sustainability information for analysis and management review.

Planned or supported export formats, depending on the verified implementation:

- CSV: Spreadsheet analysis.
- JSON: Structured data exchange.
- PDF: Management-friendly sustainability reports.

Reports are intended to include reporting periods, resource trends, target progress, sustainability indicators, and estimated savings where the necessary data is available.

8. 👥 Users and Role-Based Access

The portal is designed around different responsibilities.

- Admin: User management, configuration, campus-wide oversight, and approvals.
- Department Staff: Resource reporting and management of permitted department records.
- Sustainability Coordinator: Trends, reports, alerts, targets, and recommendations.

Access to real campus data must be enforced through authentication and appropriate database security rules, not only by hiding interface elements.

9. 🧾 Audit History

Maintain traceability for important data changes.

The intended audit record includes:

- Previous and updated values.
- User responsible for the change.
- Timestamp.
- Reason for correction, where required.
- Review or approval status for important corrections.

Audit history supports accountability, but it is not a substitute for a separate data backup.

10. 🧪 Demo and Real-Data Modes

GreenCampus AI distinguishes synthetic demonstration data from real campus records.

- Demo mode: Explore sample sustainability information.
- Real-data mode: Access the authenticated workspace according to assigned permissions.
- Demo records must remain separate from real campus records.
- Sample figures must be clearly labelled and must not be presented as verified institutional results.

---

🧠 AI and Smart Insights

GreenCampus AI follows a hybrid approach to sustainability analysis.

Component| Purpose
Rule-based calculations| Calculate totals, changes, target progress, and configured indicators.
Threshold-based alerts| Flag readings that exceed configured limits or appear unusual.
Forecasting| Estimate future usage when sufficient historical data is available.
Gemini API| Generate data-grounded recommendations and explanations when securely configured.
Human review| Allow authorized users to assess recommendations and approve important changes.

Example scenario

Suppose a computer laboratory recorded 800 kWh of electricity consumption in one month and 1,000 kWh in the next month.

The change is:

Increase = 25%

The system could flag the increase for review and suggest checking equipment usage, operating hours, or meter records.

These are possible areas to investigate, not confirmed causes. The system should not claim that a particular device caused the increase without supporting evidence.

Forecasts and AI recommendations should clearly communicate uncertainty and data limitations.

---

🛠️ Technology Stack

The current project uses the following technologies or intended integrations. Verify the repository configuration before treating every integration as production-ready.

Technology| Purpose
React| User interface and interactive dashboard
TypeScript| Type safety and maintainable application logic
Vite| Development server and frontend build tooling
CSS| Styling and responsive layouts
Firebase Authentication| User authentication
Cloud Firestore| Cloud database for application records
Firebase Security Rules| Database access control
Google Gemini API| AI-assisted recommendations, when configured
Git and GitHub| Version control and source-code hosting
Render| Potential hosting and deployment platform

---

🔐 Data Management and Security

GreenCampus AI is designed with data separation and access control in mind.

- Authenticate users before allowing access to private records.
- Apply role-based permissions to sensitive operations.
- Restrict department staff to authorized records.
- Validate input before saving readings.
- Keep demo data isolated from real campus data.
- Protect audit records against unauthorized changes.
- Store secret API keys on a secure server or in server-side environment variables.
- Never commit ".env" files containing credentials to GitHub.
- Review Firebase Authentication settings and Firestore Security Rules before production use.

Important: A successful deployment of security rules does not, by itself, prove that every authorization scenario is secure. Security testing is required.

---

📈 Dashboard Metrics

The dashboard may display the following indicators:

Metric| Meaning
Green Score| Overall sustainability assessment based on configured scoring rules
Electricity Usage| Recorded electricity consumption for the selected period
Water Consumption| Recorded water usage for the selected period
Paper Usage| Recorded paper consumption
Waste Diversion| Proportion of waste diverted from disposal according to the configured method
Target Progress| Progress toward approved sustainability targets
Reporting Completeness| Share of expected reports received
Estimated Savings| Calculated estimate based on configured assumptions and measured changes

Estimated savings must be distinguished from verified financial savings. Calculations require appropriate baseline data, reporting periods, and applicable utility rates.

Green Score weights should follow approved configuration and add up to 100%.

---

💻 Getting Started

Prerequisites

Install the following before running the project locally:

- Node.js and npm.
- Git.
- A GitHub account.
- A Firebase project for cloud authentication and database features, if enabled.

1. Clone the repository

git clone https://github.com/wadityasingh/Innovators-HK26-0048.git

2. Open the project folder

cd Innovators-HK26-0048

3. Install dependencies

npm install

4. Configure environment variables

Check the project's ".env.example", Firebase initialization files, and application configuration to identify the exact variable names required by this version.

Create a local ".env" file only if the project expects one. Do not guess variable names or expose private credentials.

5. Start the development server

For a project configured with the usual Vite development script:

npm run dev

Open the local URL displayed in the terminal.

If the command is unavailable, check the "scripts" section of "package.json" for the correct command.

6. Build the project

npm run build

Use the project's configured type-checking and test commands as well. A successful build does not guarantee that authentication, database permissions, or every feature works correctly.

---

⚙️ Environment Configuration

Depending on the implemented integrations, configuration may include:

- Firebase project configuration.
- Authentication provider settings.
- Firestore database setup and security rules.
- Gemini API credentials for AI features.
- Email provider configuration for notifications.
- Hosting environment variables.

Use the exact names and formats required by the source code.

Security rules:

1. Keep secret keys out of source control.
2. Do not place a private Gemini API key in frontend code.
3. Restrict database access by authenticated identity and role.
4. Configure authorized domains for authentication.
5. Test permissions using separate accounts for each role.
6. Do not use real student or institutional data in a public demo.

Firebase web configuration values are not equivalent to server-side secret keys; database security must still be enforced through Firebase rules and appropriate backend controls.

---

🧪 Testing and Verification

Before presenting GreenCampus AI as a completed solution, verify the following:

- [ ] Application starts without runtime errors.
- [ ] Production build completes successfully.
- [ ] Google sign-in works in a real browser session.
- [ ] New users are created correctly in Firebase Authentication.
- [ ] User roles are assigned and enforced correctly.
- [ ] Authorized users can create and update resource readings.
- [ ] Invalid or unusual readings are handled correctly.
- [ ] Dashboard metrics match the underlying records.
- [ ] Demo data cannot overwrite real campus data.
- [ ] Department permissions are enforced by database rules.
- [ ] Audit history records important changes correctly.
- [ ] AI recommendations use the intended data and do not invent causes.
- [ ] Exports contain the correct reporting period and values.
- [ ] Layout works on desktop and mobile screens.
- [ ] No secrets or private credentials are committed to GitHub.

Some of these checks may still be pending. Mark a check complete only after testing it.

---

⚠️ Current Limitations

The initial version is designed around manually entered resource readings and a single-campus data structure.

- Automatic smart-meter and IoT integrations are future enhancements.
- CSV/Excel bulk-import support should be confirmed before being advertised as available.
- Forecasting quality depends on the quantity and quality of historical data.
- AI recommendations are decision-support suggestions, not guaranteed outcomes.
- Email delivery depends on a configured and tested provider.
- Export formats should be verified individually.
- Automated backups and full recovery procedures require separate implementation.
- Actual environmental and financial savings require measurement and validation.

---

🔮 Future Scope

Potential improvements include:

- Smart-meter and IoT integrations for automated resource collection.
- CSV/Excel bulk data imports.
- Multi-campus administration.
- Improved forecasting using sufficient historical and seasonal data.
- More advanced sustainability benchmarking.
- Scheduled reports and automated email notifications.
- Automated backups and recovery workflows.
- Expanded accessibility and multilingual support.
- Integrations with institutional sustainability and energy-management systems.

Future features will be added based on technical feasibility, institutional requirements, and available data.

---

📁 Project Structure

The source repository currently includes a React/TypeScript application structure. The following is a high-level guide; exact filenames and directories should be checked against the current repository.

Innovators-HK26-0048/
├── src/
│   ├── components/
│   │   ├── charts/
│   │   ├── common/
│   │   ├── layout/
│   │   └── modals/
│   ├── views/
│   ├── context/
│   ├── data/
│   ├── lib/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── index.css
├── public/
├── package.json
├── README.md
└── ...

- "components/" — reusable interface components.
- "charts/" — data visualization components.
- "layout/" — shared application layout.
- "modals/" — dialogs and data-entry interfaces.
- "views/" — application pages and portal sections.
- "context/" — shared application state.
- "data/" — data definitions or sample data, depending on implementation.
- "lib/" — service integrations and shared libraries.
- "types/" — TypeScript types.
- "utils/" — helper functions and calculations.

---

🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes.
4. Run the available checks.
5. Submit a pull request describing the changes and tests performed.

Please avoid including real campus records, personal information, API keys, or other confidential data in issues and pull requests.

---

📄 License

No license has been specified in this README. Before reusing, modifying, or distributing the project, add an appropriate license file if the project owner intends to permit it.

---

🌱 Our Goal

Measure resources. Understand consumption. Improve campus sustainability.

GreenCampus AI aims to make sustainability information easier to record, understand, and act upon through transparent reporting, responsible AI assistance, and data-driven decision-making.

Built as a campus sustainability portal project for exploration and further development.
