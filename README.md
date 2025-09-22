This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



I will be extending this: 

# 📌 ALX-Polly

A modern polling application that allows users to create, share, and engage with polls in real-time.  

This project is built to demonstrate practical full-stack development, AI-assisted workflows, and user-centered design while incorporating powerful features such as visual analytics, discussions, and notifications.

---

## 🔖 Project Title & Description

**ALX-Polly**  
A polling application where users can create polls, vote, and engage in meaningful discussions.  

- **Who it’s for:** Individuals, teams, and communities that want to gather opinions quickly and effectively.  
- **Why it matters:** Polls are a powerful tool for decision-making, community engagement, and real-time feedback. ALX-Polly enhances the polling experience with interactive charts, discussions, and notifications.  

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (with Tailwind CSS for styling)  
- **Backend:** [Supabase](https://supabase.com/)  
- **Database:** PostgreSQL (via Supabase)  
- **Charts & Visuals:** Chart.js or Recharts (for poll results visualization)  
- **IDE & Tools:** [Cursor](https://cursor.sh/), Git, GitHub  
- **AI Assistants:** ChatGPT, Gemini, CodeRabbit  
- **Notifications:** Email integration (e.g., via Supabase functions or third-party email service)  

---

## 🧠 AI Integration Strategy

### ⚡ Code & Feature Generation
- Use AI to scaffold polling features, charting components, and discussion threads.  
- Generate modular code snippets and refactor iteratively with AI assistance.  
- Employ AI to structure reusable components for forms, charts, and notifications.  

### 🧪 Testing Support
- Generate **unit tests** for core features (poll creation, voting, results tallying).  
- Write **integration tests** for database + frontend connections (e.g., vote persistence).  
- Use AI to identify **edge cases** (e.g., duplicate voting, empty comments) and design test coverage.  

### 📝 Documentation
- AI-assisted docstrings and inline comments for clarity.  
- Maintain a **living README.md** with continuous AI support.  
- Use AI-driven workflows for commit and PR messages (Cursor + CodeRabbit).  

### 🧩 Context-Aware Techniques
- Provide AI with database schema (polls, votes, comments, notifications) for context-aware code generation.  
- Build a schema guide documenting relationships between polls, votes, and comments.  
- Use MCP-inspired workflows to enrich AI context with file trees, diffs, and API specs.  

---

## 🚀 Planned Features

- 📊 **Poll Result Charts** – Visualize results using an interactive charting library.  
- 💬 **Comments & Discussions** – Add threads under each poll for deeper engagement.  
- 📱 **Mobile-Responsive & Accessible** – Ensure seamless use across devices with accessibility best practices.  
- 📦 **Email Notifications** – Notify users about poll events (e.g., poll closing alerts).  

---

## 🗺️ Roadmap
- [ ] Scaffold base Next.js app with Supabase backend.  
- [ ] Implement poll creation and voting.  
- [ ] Add chart visualizations for results.  
- [ ] Integrate comments and discussion threads.  
- [ ] Optimize for mobile responsiveness and accessibility.  
- [ ] Build and connect email notification system.  
- [ ] Deploy and iterate with AI-assisted refinements.  

### Feature: Viewing Poll Results and Data Visualization

We've been working on enabling the viewing of individual poll results, which is a prerequisite for displaying poll data as a graph. This involved debugging several issues related to data retrieval from Supabase.

**Debugging Journey:**

1.  **Initial Problem:** The `get_poll_results` Supabase function was being called with an object containing named parameters, but it expected positional arguments.
    *   **Resolution:** We modified the `supabaseServer.rpc` call in `src/lib/db/polls.ts` to pass `poll_id`, `filter_user_id`, and `filter_anonymous_user_id` positionally.

2.  **Undefined Variable Error:** After the initial fix, `poll_id` was reported as undefined within the `getPollResults` function.
    *   **Resolution:** We corrected the variable names in the `rpc` call to use the properly defined `pollId`, `filterUserId`, and `filterAnonymousUserId`.

3.  **`supabaseServer` Null Error:** A "Cannot read properties of null (reading 'head')" error emerged, suggesting that the `supabaseServer` object was `null` or `undefined` when the `.rpc` call was made.
    *   **Debugging Steps:**
        *   We added `console.log` statements in `src/lib/db/polls.ts` to inspect the value of `supabaseServer` before the `rpc` call.
        *   We then added detailed `console.log` statements within the `createServerSupabaseClient` function in `src/lib/supabase/server.ts` to examine the `cookieStore` and the client object being returned, to understand why `supabaseServer` might be null.

4.  **Next.js Route Error:** During the debugging of the `supabaseServer` issue, a Next.js Route error was identified in `src/app/poll/[id]/page.tsx`, where `params.id` was being accessed without awaiting the `params` object.
    *   **Resolution:** We updated `src/app/poll/[id]/page.tsx` to correctly await the `params` object and destructure `id` as `pollId`.

5.  **Current Status:** We are currently facing a "PGRST202" error from Supabase, indicating an issue with the `get_poll_results` function itself, likely related to its expected parameters or internal logic.

---
Here’s a concise **“Quick Features”** section you can add near the top, right under the project description:

---

## Quick Features

* Create and vote on polls in real-time
* View poll results with interactive charts
* Comment and participate in discussion threads for each poll
* Mobile-responsive and accessible interface
* Email notifications for poll events (e.g., closing alerts)
* AI-assisted development for code, tests, and documentation

## 📄 License
This project is open-sourced for learning, collaboration, and experimentation.  
