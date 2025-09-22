# Building with AI: My Experience

Over the past months, I’ve seen countless posts and ads hyping up AI: *“You don’t need to learn coding—just use AI!”* or *“I built a \$50,000/month app without writing code.”* At first, they sounded too good to be true. But after so many, I started wondering: *Am I missing out? Did I waste time learning to code?*

Gradually, I began using AI more in my development process—though not in an IDE. Instead, I copied and pasted code into tools like ChatGPT, Gemini, and DeepSeek. I thought this was efficient, until I joined **AI for Devs with ALX** and tried an AI-powered IDE. That’s when things changed.

## A Productivity Boost

If I had to summarize: **AI inside the IDE supercharged my productivity.** No more switching between apps or falling into YouTube distractions. Having AI integrated directly into my coding environment meant I could stay focused and move faster.

## Smarter Collaboration

I realized that providing rules and context made the AI far more accurate. At first, my prompts were long and detailed, but over time, short prompts combined with context were enough to generate full features.

Working with databases became seamless too. Instead of writing SQL manually, I shared my schema and instantly got backend, frontend, and TypeScript types aligned.

## The Challenges

Not everything was smooth. Authentication with Supabase gave me a nightmare. Cookies from my client file weren’t being received across components, blocking me from creating polls and testing live data. Debugging this forced me back to my old copy-paste workflow, and I even had to switch IDEs. Eventually, I found success using Trae, though its long response times were frustrating.

Still, these struggles highlighted how powerful AI in an IDE can be.

## Debugging Made Easier

My most remarkable experience was debugging a **Simple Shell** project with about 30 files. Tracing command flows manually once took me five hours. With AI, I simply asked it to isolate authentication-related files, review the error, and trace it. The bug surfaced quickly.

Ironically, the bug had been introduced by the AI itself, using outdated Supabase methods. That moment drove home a key lesson: **AI can accelerate development, but you still need strong fundamentals.** Without knowledge of the basics, you won’t spot mistakes introduced by the AI.

I did also realise that when i iterating long over the same issue, eventually the AI assistant just stagnated, repeating old steps, losing context and leading to more errors. This is when i had to switch models, craft longer prompts, with detailed pointers. 

## A Game-Changer for Planning

Beyond coding, AI transformed the way I plan and ideate. Brainstorming features, refining system design, and structuring applications all became smoother. By the time I reached MVP, I had a clear mental model of the system, making development more focused and rewarding.

And then, probaly the best feature, the automatic creating of commit messages! Now that was cool!

---

### Final Thoughts

AI isn’t a shortcut to skip learning code. Instead, it’s an amplifier—cutting distractions, speeding up feature development, simplifying debugging, and sharpening planning. The journey hasn’t been flawless, but one thing is clear: **coding with AI works best when paired with solid engineering fundamentals.**
