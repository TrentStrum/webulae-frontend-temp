This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Setup

1. Install **Node.js 20** and `npm`.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and configure the variables mentioned below for payments and AI chat.
   The repository includes `.env.example` which lists all required variables.
4. Start the development server with `npm run dev`.
   Use `npm run dev:all` to launch both the Next.js app and the Python service simultaneously.
5. Run the test suite with `npm test`. Ensure you have executed `npm install` beforehand. If the Python service or its tests are used, also install its dependencies with `pip install -r python_service/requirements.txt`.
6. *(Optional)* If running tests in an offline environment, make sure all Node and Python dependencies were installed (using `npm install` and `pip install -r python_service/requirements.txt`) prior to going offline.

## Getting Started

First, run the development server:

```bash
npm run dev
# or run both servers
npm run dev:all
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Development Mock API

When running `npm run dev`, the app starts a Mock Service Worker server using [MSW](https://mswjs.io/). All network requests matching the handlers defined under `app/mocks` are intercepted. This allows developing the UI without a real backend.

## Payments

Stripe is used for subscription payments. Configure the following environment variables in `.env`:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_pro...
STRIPE_PRO_PLUS_PRICE_ID=price_pro_plus...
STRIPE_SUCCESS_URL=http://localhost:3000/premium
STRIPE_CANCEL_URL=http://localhost:3000/pricing
STRIPE_WEBHOOK_SECRET=whsec_...
```

Run the development server and visit `/pricing` to subscribe. Successful payments redirect to `/premium`.

To handle subscription events, set up a Stripe webhook pointing to `/api/stripe-webhook`:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

## AI Chat

Set the following environment variables to enable the AI chat features:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
```


## Python Service

Use `OPENAI_MODEL` to choose the model used for chat responses. If not set, `gpt-4` is used.

The `python_service` directory contains a small FastAPI application used by the Next.js API routes. Install its dependencies and run the service with:

```bash
cd python_service
pip install -r requirements.txt
python main.py
curl http://localhost:8000/health  # should return {"status":"ok"}
```
You can also start this service together with the Next.js server using `npm run dev:all`.

The Next.js app communicates with this service using the `PYTHON_SERVICE_URL` environment variable. The default is `http://localhost:8000` when the variable is not set.
When a document is uploaded through `/api/documents`, the authenticated Clerk user ID is forwarded to the service as `user_id`.

## Workflow API

The application can trigger workflows on an [n8n](https://n8n.io) instance. Configure the connection using:

```bash
N8N_URL=http://localhost:5678
N8N_API_KEY=your-n8n-key
```

`N8N_URL` should be the base URL of your n8n server. Generate `N8N_API_KEY` in the n8n web interface under **User Settings** → **API** and place it in your `.env` file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Assistant Capability Menu
Menu Section	Capability (Flavor)	What It Does	Input Example	Output Example	Tier	Status
📚 Company Knowledge	business_basics	RAG advisor using uploaded SOPs, policies, and strategy docs	“What’s our refund policy?”	“According to returns_policy.md, refunds are processed within 7 days.”	✅ All Plans	✅ Implemented
faq_companion	Answers company-specific FAQs or tribal knowledge	“Why don’t we ship on Wednesdays?”	“Because faq.txt says Wednesday is the restocking day.”	✅ All Plans	🔧 Partially implemented
custom_prompt	Applies user-defined tone/formatting/style in every response	“Always speak formally and use Oxford commas.”	Responses adjust to tone rules dynamically	✅ All Plans	✅ Implemented
🧾 Document Drafting	content_writer	Drafts content (emails, blurbs, posts) using your branding voice	“Draft an outreach email for new gym leads.”	Message with navy/silver theme, Montserrat font	✅ All Plans	✅ Implemented
policy_bot	Creates structured internal policies in your style	“Write an expense reimbursement policy.”	Outputs clear policy using your preferred structure	🔒 Pro Only	🔧 Planned
📊 Data & Insights	data_analyst	Answers business data questions using CSVs / dashboards	“Which vending machines had lowest sales?”	“Machine 04 & 12 dropped 20% last month.”	🔒 Pro Only	🔧 Planned (requires CSV ingestion)
vcio_assistant	AI-powered vCIO insights (strategic, IT roadmap, vendor selection)	“What systems should we integrate next?”	“Consider integrating SMS with your CRM and Stripe billing.”	🔒 Enterprise	🧠 Conceptual
⚙️ Execution Layer	workflow_executor	Triggers purchased automations (n8n) via chat	“Send invoices to my vendor list.”	“✅ Invoices sent using ‘monthly_vendor_invoice’ workflow.”	🔒 Pro/Enterprise	🔧 Partially Implemented
🎓 JCW Help Center	jcw_expert	Answers questions about JovianCloudWorks offerings	“What’s included in the Lean Launchpad?”	“It includes workflow mapping, app recommendations, and optimizations.”	✅ All Plans	✅ Implemented
🧠 Smart Routing	agent_router	Classifies user intent and routes to flavor or upsell	“Write a PTO policy” → routes to policy_bot	“That’s a Pro plan feature. Upgrade to unlock.”	⚙️ Core	⚠️ Needed (intent classifier + logic pending)