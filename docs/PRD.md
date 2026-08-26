# PRD — Personal Reading Journal App (MVP)

**Version:** 0.4 — Work in Progress  
**Status:** Incomplete — Mystery Book legal/fulfillment/catalog terms and Subscription/Payment not yet specced  
**Language:** Armenian (հայ) + English  
**Platform:** Web app (MVP) → Mobile app (Phase 2)  
**Market:** Armenia

---

## 1. Problem Statement

Book lovers who read deeply — tracking characters, writing plot notes, saving favorite passages — have no dedicated tool that matches how they actually engage with books. Current options (Goodreads, StoryGraph, Bookly) are optimized for logging and social discovery, not for the kind of personal, notebook-style annotation that serious readers practice. These readers currently use paper notebooks or spreadsheets, which are not searchable, not portable, and don't support media attachments. The app aims to be the digital version of the personal reading notebook — private, rich, and deeply personal.

---

## 2. Goals

- Enable readers to maintain a complete, structured record of every book they've read or want to read, with all the annotation depth of a physical notebook.
- Give users a reason to open the app during and after reading — not just at the end as a logging tool.
- Establish a free tier that delivers genuine value without time-limiting it, so users feel the product's worth before being asked to pay.
- Create a paid tier where the upsell is felt naturally (AI features, unlimited storage) rather than forced by artificial caps.
- Launch an MVP in Armenian and English that works as a web app on both desktop and mobile browsers.

---

## 3. Non-Goals (MVP)

| Non-Goal | Reason |
|---|---|
| Social features (following, sharing shelves, book clubs) | Different product; adds moderation and identity complexity |
| E-book reader integration or highlighting sync | Requires publisher/DRM partnerships; out of scope for v1 |
| Barcode/ISBN scanning to auto-fill book data | Deferred; manual entry only for MVP |
| External book API (Google Books, Open Library) | Deferred; manual entry only for MVP |
| Trash / soft-delete recovery | Deferred to post-MVP; hard delete with confirmation modal for now |
| Audio/video media attachments | Deferred; photo only for MVP |
| English UI localization | Phase 2; Armenian-only UI ships first |
| Mystery Book fulfillment platform | Handled manually by the founder; no logistics software in MVP |
| Auto-translation of user-entered content | Never; UI language ≠ content translation |

---

## 4. Target Users

**Primary persona — The Deep Annotator**
A book lover (any age) who habitually takes notes while reading: character names, plot summaries, favorite quotes, personal reflections. Previously used paper notebooks or Excel. Reads regularly (10–30+ books/year). Values privacy over social sharing. Likely lives in Armenia or is part of the Armenian-speaking diaspora.

**Secondary persona — The Casual Tracker**
A reader who wants to log what they've read, rate books, and maintain a reading list — but does not annotate deeply. May upgrade if they discover the annotation features organically.

---

## 5. Information Architecture

```
App
├── Auth
│   ├── Registration
│   ├── Login
│   ├── Forgot Password
│   └── Reset Password
├── Onboarding (mandatory gate — see Auth Flow logic below)
│   └── Tell Us About Yourself
├── Dashboard (main app)
│   ├── About Me (Իմ մասին)
│   ├── Books (Գրքեր)         ← primary section
│   └── Mystery Book                ← mood-based recommendation engine built in, see Section 13
```

> **Note:** "Mood-Based Recommendations" is no longer a separate nav item or page. It has been merged into **Mystery Book** as the engine that powers book selection (Section 13). Any earlier reference to it elsewhere in this document refers to that merged flow.

---

## 6. Auth Flow

### 6.1 Registration

| Field | Required | Validation |
|---|---|---|
| First Name (Անուն) | Yes | Latin letters only. Empty → `Պարտադիր լրացման դաշտ` / `This field is required`. Non-Latin → `Լրացրեք լատինատառ` / `Use Latin letters` |
| Last Name (Ազգանուն) | Yes | Same as First Name |
| Email (Էլ․ հասցե) | Yes | Valid email format. Empty → required message. Invalid format → `Լրացրեք վավեր էլհասցե` / `Enter a valid email address` |
| Password (Գաղտնաբառ) | Yes | See password policy below |

**Password policy:**
- Minimum 8 characters
- Maximum 32 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character
- Requirements shown inline as the user types

**Create Account button behavior:**
- Validates all fields simultaneously on submit
- Shows all relevant inline validation messages at once
- Does not proceed if any field is invalid or empty

---

### 6.2 Login

| Field | Required | Validation |
|---|---|---|
| Email | Yes | Empty → required. Invalid format → `Լրացրեք վավեր էլհասցե` / `Enter a valid email address` |
| Password | Yes | Empty → required |

- Incorrect credentials → banner: `Սխալ էլհասցե կամ գաղտնաբառ` / `Incorrect email address or password`

---

### 6.3 Forgot Password

- Email field, required, same format validation as login
- On valid submission → triggers password-reset email flow

---

### 6.4 Reset Password

| Field | Required | Validation |
|---|---|---|
| New Password | Yes | Must meet password policy |
| Confirm Password | Yes | Must match New Password. Mismatch → `Գաղտնաբառերը չեն համընկնում` / `Passwords do not match` |

---

## 6.5 Auth Flow Routing Logic

"Tell Us About Yourself" is a **mandatory gate** — no user reaches Dashboard without passing through it at least once. After every login, the system checks whether the user has completed this step:

- **Not completed** → redirect to Tell Us About Yourself → Dashboard
- **Already completed** → go straight to Dashboard

This produces three distinct user paths:

| Path | Flow |
|---|---|
| New user (full session) | Registration → Tell Us About Yourself → Dashboard |
| New user (abandoned onboarding) | Registration → closes app → Login → Tell Us About Yourself → Dashboard |
| Forgot password | Login → Forgot Password → Reset Password → Login → Tell Us About Yourself (if not yet completed) or Dashboard (if already completed) |
| Returning user (onboarding done) | Login → Dashboard |

Genre and Favorite Authors inside "Tell Us About Yourself" are optional; **About Me is required** (changed 2026-08-25 — see Section 7). A user can leave Genre and Favorite Authors empty, but must fill in About Me before Continue proceeds; the gate is considered passed once Continue succeeds.

---

## 7. Onboarding — Tell Us About Yourself

**Mandatory gate.** Shown after Registration and after any Login where the user has not yet completed this step. Once the user clicks Continue, this page is never shown again.


| Field | Armenian | English | Required | Notes |
|---|---|---|---|---|
| Name & Surname | Անուն Ազգանուն | First name Last name | — | Auto-populated from registration. Read-only on this page. Editable later from About Me |
| Genre | Ժանր | Genre | No | Multi-select dropdown, max 5 genres. Validation if >5 selected: `Թույլատրվում է ընտրել առավելագույնը 5 ժանր` / `You can select up to 5 genres` |
| Favorite Authors | Սիրելի հեղինակներ | Favorite Authors | No | Multiple values, chip-based (type → Enter → chip). Any language/script accepted |
| About Me | Իմ մասին | About Me | **Yes** (changed 2026-08-25) | Free-form multiline text. No script restriction. Empty on Continue → `Պարտադիր լրացման դաշտ` / `This field is required` |

**Continue button:**
- Blocked only by an empty About Me field (`common.required` inline error) — Genre and Favorite Authors remain optional and never block Continue
- Takes user to main Dashboard

**Data usage:** Genre, Favorite Authors, and About Me feed into the Mystery Book recommendation engine as User Profile signals (see Section 13.3.A). Per the Cold-Start Principle (Section 13.4), if this onboarding data already covers a signal (e.g. genre), the Mystery Book flow will not ask for it again.

---

### Genre List (22 genres, bilingual)

| # | English | Armenian |
|---|---|---|
| 1 | Fiction | Գեղարվեստական |
| 2 | Literary Fiction | Գրական Գեղարվեստական |
| 3 | Contemporary | Ժամանակակից |
| 4 | Crime, Mystery և Thriller | Քրեական, Խորհրդավոր և Թրիլլեր |
| 5 | Science Fiction | Գիտաֆանտաստիկա |
| 6 | Fantasy | Ֆենթեզի |
| 7 | Romance | Ռոմանտիկա |
| 8 | Historical Fiction | Պատմական Գեղարվեստական |
| 9 | Horror | Սարսափ |
| 10 | Action և Adventure | Արկածային |
| 11 | Young Adult | Պատանեկան |
| 12 | Classics | Դասական |
| 13 | Short Stories | Կարճ Պատմվածքներ |
| 14 | Graphic Novel և Comics | Գրաֆիկական Վեպ և Կոմիքս |
| 15 | Non-Fiction | Ոչ Գեղարվեստական |
| 16 | Biography և Memoir | Կենսագրություն և Հուշագրություն |
| 17 | Self-Improvement | Ինքնազարգացում |
| 18 | Business և Economics | Բիզնես և Տնտեսագիտություն |
| 19 | Philosophy և Psychology | Փիլիսոփայություն և Հոգեբանություն |
| 20 | History և Politics | Պատմություն և Քաղաքականություն |
| 21 | Science և Technology | Գիտություն և Տեխնոլոգիա |
| 22 | Poetry | Պոեզիա |

> Genre labels are localized to the active UI language. The underlying value is language-agnostic.

---

## 8. Welcome Modal

- **Trigger:** Shown once, immediately after the user clicks Continue on "Tell Us About Yourself" for the first time. Never shown again after dismissed.
- **Content:** "Welcome to your world of books" / `Բարի գալուստ ձեր գրքերի աշխարհ`
- **CTA button:** `+ Ավելացրեք Ձեր առաջին գիրքը` / `+ Add Your First Book`
- **Dismiss:** X button closes modal → lands on Books page
- **All subsequent logins:** User lands directly on Books page, no modal

---

## 9. Navigation

### Desktop
- Left rail, collapsed by default (icons only, ~60–70px wide)
- Hover → expands to show icons + labels (smooth CSS transition)
- Auto-collapses when mouse leaves

### Mobile Web
- Bottom navigation bar, always visible
- Icons + short labels
- Maximum 4–5 items

### Nav Items (in order)
1. Իմ մասին — About Me
2. Գրքեր — Books
3. Mystery Book *(mood + taste recommendation flow built in — see Section 13; payment/delivery terms still TBD)*

---

## 10. About Me Page

Displays and allows editing of all profile information collected at registration and onboarding.

| Field | Armenian | English | Editable | Deletable | Notes |
|---|---|---|---|---|---|
| Name | Անուն | Name | Yes | No | Latin only. Cannot be saved empty |
| Surname | Ազգանուն | Surname | Yes | No | Latin only. Cannot be saved empty |
| Email | Էլ․ հասցե | Email | No | No | Read-only. Email change = separate security flow (future) |
| Genre | Ժանր | Genre | Yes | Yes (clearable to 0) | Max 5. Can be fully cleared |
| Favorite Authors | Սիրելի հեղինակներ | Favorite Authors | Yes | Yes (per chip) | Chip-based. Any script |
| About Me | Իմ մասին | About Me | Yes | Yes (clearable) | Free text. Can be left empty |
| Password | Գաղտնաբառ | Password | — | — | "Change Password" button → separate modal |

### Password Change Modal (logged-in user)
- Current Password
- New Password (must meet password policy)
- Confirm New Password

---

## 11. Books Section

### 11.1 Book Fields

| Field | Armenian | Free | Paid | Required | Notes |
|---|---|---|---|---|---|
| Title | Վերնագիր | ✓ | — | Yes | Manual text entry. Any script |
| Author | Հեղինակ | ✓ | — | Yes | Manual text entry. Any script |
| Reading Status (UI label: "Status" / "Կարգավիճակ", renamed 2026-08-25) | Կարգավիճակ | ✓ | — | Yes | Dropdown (4 values — see below). No default selection; shows a placeholder (`Ընտրեք կարգավիճակ` / `Select status`) until the user picks one, matching Genre's placeholder behavior |
| Rating | Գնահատական | ✓ | — | Conditional | Required only when Status = Read. Inactive otherwise |
| Genre | Ժանր | ✓ | Custom tags | No | Multi-select from fixed list (free). Custom "Other" tags = paid, private |
| Plot / My Notes | Սյուժե | ✓ | — | No | Free-form text. Manual entry |
| AI Summary | AI ամփոփում | — | ✓ | No | Separate field. Spoiler-free. Generated on button tap. Cached per unique title+author. Regeneration option TBD |
| Characters | Կերպարներ | ✓ | — | No | Flat list of names. Optional. Chip/tag based |
| Quotes | Մեջբերումներ | ✓ | — | No | Multiple per book. Scrollable text area + optional page number per quote. No hard character cap |
| Commentary | Մեկնաբանություն | ✓ | — | No | Single free-form text field. No attachment |
| Photo | Լուսանկար | 1 photo | Unlimited | No | Standalone field, separate from Commentary |
| Custom Fields | — | — | ✓ | No | User-defined additional fields, paid only |

---

### 11.2 Reading Status

Dropdown, 4 values:

| Value | Armenian |
|---|---|
| Want to Read | Ուզում եմ կարդալ |
| Currently Reading | Կարդում եմ |
| Read | Կարդացել եմ |
| Did Not Finish | Չեմ ավարտել |

- **Rating field** is inactive/disabled for all statuses except **Read**
- **Did Not Finish** → rating is skipped entirely (not shown)

---

### 11.3 Rating

- **Widget:** Tappable star widget
- **Scale:** 1 to 5 stars, half-star increments (1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)
- **Required:** Yes, when status = Read
- **Inactive:** When status = Want to Read, Currently Reading, or Did Not Finish

---

### 11.4 Genre (Book-level)

- Multi-select from the shared 22-genre list
- **Free:** Select from fixed list
- **Paid:** "Other" option — user types a custom genre tag. Custom tags are private to that user (not shared globally)

---

### 11.5 Quotes

- Multiple quotes per book (repeatable list, "+ Add Quote" button)
- Each quote: open text area (no visible character cap; backend safety limit ~5000 chars) + optional page number field
- Scrollable if long
- Paste-friendly (text area supports copy/paste)

---

### 11.6 AI Summary (Paid)

- Separate field from "My Notes on Plot"
- Triggered by "Generate AI Summary" button (visible to paid users only; free users see grayed-out/upsell version)
- Generates spoiler-free summary of the book using title + author as input
- **Caching:** First generation per unique title+author is stored; all subsequent users requesting the same book get the cached version (no repeat API cost)
- **Regenerate:** Option to request a new version. Rate limit / cost behavior TBD
- Never overwrites or reads from the user's manual "My Notes on Plot" field

---

### 11.7 Photo

- **Free tier:** 1 photo per book
- **Paid tier:** Unlimited photos
- Standalone field, not attached to Commentary
- **Fallback (no photo added):** Placeholder card generated from Title + Author text with consistent background styling. No external API dependency.

---

### 11.8 Delete Behavior

- **Two delete entry points:**
  1. Delete icon directly on the library card (from list view)
  2. Delete icon at the bottom of the Book Detail page
- **Both trigger a confirmation modal:**
  - "Delete '[Book Title]'?"
  - Options: Close (X) / Delete
- **Hard delete** — no trash or recovery. MVP only. Soft-delete / trash to be reconsidered post-MVP.

---

## 12. Book Dashboard (Library View)

### 12.1 Layout

- **Card-based list** — each card shows: cover photo (or fallback placeholder), title, author, reading status badge, star rating (if rated)
- **Tap/click a card** → opens full Book Detail view (all fields editable in place)
- **Edit:** Fields are always editable in Book Detail. No separate "edit mode" button.
- **Delete:** Icon visible on card (quick delete) and at bottom of Book Detail

### 12.2 Empty State

- Static decorative illustration (books/shelf graphic or faded placeholder cards — not animated skeleton loaders)
- Text: `Ձեր գրադարանը դատարկ է` / `Your library is empty`
- Subtext: `Ավելացրեք Ձեր առաջին գիրքը անձնական գրադարան կառուցելու համար` / `Add your first book to start building your personal library`
- CTA: `+ Ավելացրեք Ձեր առաջին գիրքը` / `+ Add Your First Book`

### 12.3 Search

- Search bar at top of Dashboard
- Searches against: Title, Author
- Autocomplete suggestions drawn only from the user's own already-added books
- User can select a suggestion or type freely
- **Empty result state:**
  - `Գրքեր չեն գտնվել` / `No books found`
  - `Փորձեք այլ որոնում կամ փոփոխեք ֆիլտրերը` / `Try a different search or adjust your filters`
  - Reset button → clears search and filters, returns to default library view

### 12.4 Filter

Combinable filters (multiple can be active simultaneously):

| Filter | Values |
|---|---|
| Reading Status | Want to Read / Currently Reading / Read / Did Not Finish |
| Genre | Any from the 22-genre list (multi-select) |
| Rating | e.g., 4★ and up |

- Active filters shown as removable chips (each with its own × to remove individually)
- "Clear Filters" button removes all active filters at once

### 12.5 Sort (separate from Filter)

| Option | |
|---|---|
| Recently Added | Default |
| Title: A–Z | |
| Title: Z–A | |
| Rating: High → Low | |
| Rating: Low → High | |

- Single-select (only one sort active at a time)
- Defaults back to "Recently Added" when cleared

---

## 13. Mystery Book (Personalized Discovery)

Mystery Book merges what were previously two separate nav items — **Mood-Based Recommendations** and **Mystery Book** — into a single guided flow. Rather than browsing a list of AI recommendations, the user answers a short flow and the system picks **one** personalized physical book for them.

> Your profile tells us what kind of reader you are. Your mood tells us what you want right now. We use both to choose your Mystery Book.

This section fully specs the recommendation flow and scoring logic. It does **not** yet spec payment, delivery, or the non-returnable policy display — those remain blocked on Open Questions #3, #4, and #9 (Section 16).

---

### 13.1 Two Reveal Modes

The user chooses how much they want to know before the book ships:

| Mode | Armenian | Behavior |
|---|---|---|
| 🎁 **Keep It a Mystery** | Թող մնա առեղծված | The user does not know which book they will receive until it physically arrives |
| 👀 **Show Me Now** (renamed 2026-08-26, was "Give Me a Sneak Peek") | Ցույց տվեք հիմա (was Ցույց տվեք նախապես) | The system reveals the selected book on-screen before the user confirms/places the order |

Exactly one mode must be selected (Step 4, Section 13.8) before a recommendation is generated.

---

### 13.2 Recommendation Signals

The recommendation engine combines four categories of signal:

**A. User Profile** (already collected at registration/onboarding)
- Favorite genres
- Favorite authors
- About Me
- Preferred language, if available

**B. Reading Behavior** (when available)
- Previously read books
- Rated books
- Liked books
- Disliked books
- Saved books
- Previous Mystery Book feedback

**C. Current Intent** (collected during the current Mystery Book session)
- Current mood
- Desired reading experience
- Mystery/reveal preference

**D. Book Metadata** (per candidate title)
- Genre
- Subgenre
- Author
- Language
- Mood tags
- Themes
- Pace
- Length
- Rating/popularity
- Age/content suitability, if relevant

> **Open item:** Signal D (Book Metadata) is richer than the free-text Genre field on user-added library books (Section 11.4). It implies a separately curated Mystery Book catalog — maintained by the team/founder — with structured metadata per title. Cataloging this metadata is an operational prerequisite for the recommendation engine to function, not just an app feature. Flagged as a new item in Open Questions (Section 16, #11).

---

### 13.3 Cold-Start Principle

**Do not ask users for information the system already knows.** If the user's profile or reading history already provides enough signal about their taste, skip asking for it again in the flow.

**Example — Returning/known user**
User has: Fantasy selected during onboarding, 10 rated books, 6 Fantasy books rated highly
→ **Do not show the Genre step** (Section 13.6).

**Example — New user**
User has: no selected genres, no reading history, no ratings, no favorite authors
→ **Show the Genre step.**

The system dynamically decides — per user, per session — whether Step 2 (Genre/Taste) is needed.

---

### 13.4 Entry Screen

| Element | Armenian | English |
|---|---|---|
| Title | Առեղծվածային գիրք | Mystery Book |
| Subtitle | Թույլ տվեք ընտրել Ձեր հաջորդ գիրքը՝ հիմնվելով Ձեր տրամադրության և ճաշակի վրա։ | Let us pick your next read based on your mood and taste. |
| Visual | A covered, blurred, or otherwise concealed book visual (no localized text). The actual book cover must not be identifiable at this stage. | — |
| CTA | Գտնել իմ առեղծվածը | Find My Mystery |

---

### 13.5 Step 1 — Mood (Mandatory)

| Element | Armenian | English |
|---|---|---|
| Title | Ի՞նչ տրամադրության եք հիմա։ | What are you in the mood for? |
| Supporting text | Ընտրեք առավելագույնը 2 տրամադրություն։ (updated 2026-08-26) | Pick up to 2 moods. |
| CTA | Շարունակել | Continue |

**Mood options (MVP taxonomy):**

| Emoji | Armenian | English |
|---|---|---|
| ✨ | Կախարդական | Magical |
| 🌿 | Հարմարավետ | Cozy |
| 🌙 | Փախուստային | Escapist |
| ❤️ | Հուզական | Emotional |
| 🔥 | Ինտենսիվ | Intense |
| 😂 | Թեթև ու զվարճալի | Light & Fun |
| 🧠 | Մտածելու տեղիք տվող | Thought-provoking |
| 🕯️ | Խորհրդավոր | Mysterious |

- UI: selectable cards or chips
- Selection: minimum 1, maximum 2
- Once 2 moods are selected, **disable** the remaining options rather than showing an error
- Validation (0 selected on Continue): `Ընտրեք առնվազն մեկ տրամադրություն։` / `Choose at least one mood.`

---

### 13.6 Step 2 — Genre / Taste (Conditional)

Shown only if the Cold-Start check (Section 13.3) determines the system lacks sufficient taste data. Otherwise this step is skipped entirely and the flow proceeds to Step 3.

| Element | Armenian | English |
|---|---|---|
| Title | Ի՞նչ տեսակի գրքեր եք սիրում։ | What kind of books do you enjoy? |
| Supporting text | Ընտրեք առավելագույնը 3։ | Pick up to 3. |
| CTA | Շարունակել | Continue |
| Optional escape hatch | Բաց թողնել — shown only if the recommendation engine has a meaningful fallback (e.g. falls back to mood-only + popularity scoring) | Skip |

**Genre options (MVP — should reflect the actual Mystery Book catalog, not necessarily the 22-genre list in Section 7):**

| Armenian | English |
|---|---|
| Ֆենթեզի | Fantasy |
| Ռոմանտիկա | Romance |
| Խորհրդավոր և Թրիլլեր | Mystery & Thriller |
| Գիտաֆանտաստիկա | Science Fiction |
| Գրական Գեղարվեստական | Literary Fiction |
| Պատմական Գեղարվեստական | Historical Fiction |
| Սարսափ | Horror |
| Արկածային | Adventure |
| Կենսագրություն | Biography |
| Ինքնազարգացում | Self-Development |
| Պատանեկան | Young Adult |
| Ոչ Գեղարվեստական | Non-fiction |

- Selection: minimum 1, maximum 3
- Validation (0 selected on Continue, and Skip not available): `Ընտրեք առնվազն մեկ ժանր։` / `Choose at least one genre.`

---

### 13.7 Step 3 — Desired Reading Experience (Optional)

| Element | Content |
|---|---|
| Title | What do you want from your next read? |
| Supporting text | Choose what you want to feel or experience. |
| CTA | Continue |
| Secondary action | Skip |

**Options:**

| Option | Description |
|---|---|
| Escape Me | Take me somewhere else. |
| Make Me Feel | Give me an emotional experience. |
| Keep Me Hooked | Something I won't want to put down. |
| Make Me Think | Challenge my perspective. |
| Make Me Smile | Something light and enjoyable. |
| Surprise Me | Take me somewhere unexpected. |

- Selection: optional, maximum 1
- Not required — the engine already has mood (and possibly profile) data without it

---

### 13.8 Step 4 — Mystery Level (Mandatory)

| Element | Content |
|---|---|
| Title | How much do you want to know? |
| CTA | Continue |

**Two large interactive cards** (see Section 13.1 for behavior):

| Card | Label (EN / AM) | Description (EN / AM) |
|---|---|---|
| 🎁 | Keep It a Mystery / Թող մնա առեղծված | Don't show me the book. I want to discover it when it reaches me. / Գիրքը ցույց մի տվեք։ Ուզում եմ բացահայտել այն, երբ այն հասնի ինձ։ |
| 👀 | Show Me Now / Ցույց տվեք հիմա | Show me what you picked for me. / Ցույց տվեք, թե ինչ եք ընտրել ինձ համար։ |

- Selection: exactly one, required
- Validation (none selected on Continue): `Choose how much you want to know.`

---

### 13.9 Recommendation Generation Pipeline

```
User Profile
      +
Reading History
      +
Current Mood
      +
Genre Preference
      +
Desired Experience
      ↓
Recommendation Engine
      ↓
Candidate Books
      ↓
Filtering
      ↓
Ranking
      ↓
One Mystery Book
```

- **Filtering** removes candidates that fail hard constraints (language, age/content suitability, out-of-stock/unavailable in catalog, already read by the user, previously sent as a Mystery Book to this user).
- **Ranking** scores remaining candidates per Section 13.10 and returns the top result.
- If Sneak Peek was chosen (Section 13.1), the top result is shown to the user before order confirmation. If Keep It a Mystery was chosen, the result is withheld until delivery.

---

### 13.10 Mood Matching & Scoring Model

**Do not simply map moods directly to genres** — this is too simplistic:

```
Sad → Romance
Happy → Comedy
Angry → Thriller
```

Instead, every candidate book carries a **mood profile** — a vector of scores (0–1) across the mood taxonomy from Section 13.5. Example:

```
The Night Circus
  Magical:            0.90
  Escapist:           0.90
  Emotional:          0.60
  Romantic:           0.50
  Intense:            0.20
  Thought-provoking:  0.70
```

If the user selects **Magical + Escapist**, this book receives a strong mood-match score because both selected moods score highly in its profile.

**Starting weighted scoring model** (initial values — not final, to be tuned against real user behavior and feedback):

| Signal | Weight |
|---|---|
| Mood match | 40% |
| Genre match | 25% |
| Reading history / taste | 15% |
| Author preference | 10% |
| Book quality / popularity | 10% |

`Previous Mystery Book feedback` (Section 13.2.B) should also negatively weight books similar to ones the user disliked or rated low, once enough feedback history exists.

---

### 13.11 Candidate Filtering

Before ranking, remove unsuitable candidates. A book is filtered out if it is:

- Already read by the user
- Previously rejected by the user
- By a blocked/disliked author
- In an unsupported language
- Out of stock
- Unavailable for delivery to the user's location
- A previously-recommended Mystery Book for this user, where appropriate

Only eligible books enter the ranking stage (Section 13.10).

---

### 13.12 Branch A — Result Screen for "Keep It a Mystery"

If the user selected 🎁 Keep It a Mystery (Section 13.8), the result screen must **not** show: Title, Author, Cover, ISBN, or any other detail that makes the book immediately identifiable.

| Element | Armenian | English |
|---|---|---|
| Heading | Մենք գտանք Ձեր գիրքը։ | We found your match. |
| Subheading | Մենք ընտրեցինք գիրք՝ հիմնվելով Ձեր տրամադրության և ընթերցանության ճաշակի վրա։ | We picked a book based on your mood and reading taste. |
| Section label | Ձեր ընտրությունը | Your Match |
| Section content | The moods selected in Step 1 (e.g. 🌙 Փախուստային · ✨ Կախարդական) | The moods selected in Step 1 (e.g. 🌙 Escapist · ✨ Magical) |
| Reasoning label | Ինչու՞ հենց այս գիրքը | Why this book? |
| Reasoning example *(dynamically generated, not static copy)* | Դուք սիրում եք ընկղմող պատմություններ և փնտրում եք մի բան, որը կօգնի Ձեզ փախչել իրականությունից։ | You enjoy immersive stories and you're looking for something that helps you escape. |
| CTA | Ուղարկեք ինձ առեղծվածը | Send Me the Mystery |

---

### 13.13 Branch B — Result Screen for "Give Me a Sneak Peek"

If the user selected 👀 Give Me a Sneak Peek, do **not** reveal the full recommendation at once — use progressive disclosure across two stages.

**Stage 1 — teaser**

| Element | Armenian | English |
|---|---|---|
| Heading | Ձեր առեղծվածը պատրաստ է... | Your mystery is ready... |
| Shown | Blurred cover, Genre (Ժանր), Mood match (Տրամադրության համապատասխանություն), Approximate length (Մոտավոր ծավալ) | Blurred cover, Genre, Mood match, Approximate length |
| Example *(dynamic)* | Ֆենթեզի · Կախարդական · Փախուստային · ~400 էջ | Fantasy · Magical · Escapist · ~400 pages |
| CTA | Բացահայտել վերնագիրը | Reveal the Title |

**Stage 2 — full reveal**

| Element | Armenian | English |
|---|---|---|
| Revealed | Title and Author, then the real cover *(book titles/authors are never translated — Section 15)* | Title and Author, then the real cover |
| Reasoning label | Ինչու՞ ընտրեցինք սա | Why we picked it |
| Reasoning example *(dynamic)* | Դուք սիրում եք ընկղմող ֆենթեզի և հակված եք նախընտրել հուզականորեն հարուստ պատմություններ։ | You enjoy immersive fantasy and tend to prefer emotionally rich stories. |
| CTA | Ստանալ այս գիրքը | Get This Book |

---

### 13.14 Order Flow — "Keep It a Mystery"

| Element | Armenian | English |
|---|---|---|
| Title | Ձեր առեղծվածը պատրաստ է առաքման։ | Your mystery is ready to ship. |
| Line item | Առեղծվածային գիրք | Mystery Book |
| Line item | Գին | Price |
| Line item | Առաքման արժեք | Delivery fee |
| Line item | Առաքման մոտավոր ժամկետ | Estimated delivery |
| Line item | Առաքման հասցե | Delivery address |
| CTA | Պատվիրել | Place Order |

The book is **not** revealed on this screen — consistent with Section 13.12.

---

### 13.15 Order Flow — "Give Me a Sneak Peek"

Same line items as Section 13.14, plus the revealed book identity:

| Element | Armenian | English |
|---|---|---|
| Shown | Գրքի կազմ, Վերնագիր, Հեղինակ | Book cover, Title, Author |
| + | Գին, Առաքման արժեք, Առաքման մոտավոր ժամկետ, Առաքման հասցե | Price, Delivery fee, Estimated delivery, Delivery address |
| CTA | Պատվիրել | Place Order |

---

### 13.16 Delivery Address

Only requested once the user proceeds toward a physical order (not earlier in the flow).

| Field | Armenian | English |
|---|---|---|
| Full name | Անուն Ազգանուն | Full name |
| Country | Երկիր | Country |
| City | Քաղաք | City |
| Street address | Փողոցի հասցե | Street address |
| Building / Apartment | Շենք / Բնակարան | Building / Apartment |
| Postal code | Փոստային ինդեքս | Postal code |
| Phone number | Հեռախոսահամար | Phone number |

- **Saved for reuse:** the delivery address is saved to the user's profile (decision confirmed 2026-08-25) and prefilled on future Mystery Book orders — shown as `Առաքել՝` / `Deliver to` with the saved address, editable before confirming.
- CTA: `Անցնել վճարմանը` / `Continue to Payment`
- **Follow-up:** this introduces a new profile data group not currently listed in Section 10 (About Me) — recommend adding a "Delivery Address" field group there so users can manage it outside the order flow too. Not yet added to Section 10; flagged here pending confirmation.

---

### 13.17 Payment

Standard checkout:

| Element | Armenian | English |
|---|---|---|
| Payment method | Վճարման եղանակ | Payment method |
| Order summary | Պատվերի ամփոփում | Order summary |
| Total | Ընդամենը | Total |
| Delivery information | Առաքման տվյալներ | Delivery information |
| CTA | Պատվիրել | Place Order |

**Non-returnable acknowledgment (added 2026-08-25):** since Mystery Book is confirmed non-returnable, checkout requires a checked acknowledgment before "Place Order" is enabled:

> `Ես հասկանում եմ, որ Առեղծվածային գիրքը ենթակա չէ վերադարձման։` / `I understand the Mystery Book is non-returnable.`

This is a placeholder for the actual legal disclosure text — final wording is still blocked on Open Question #4 (whether Armenian consumer protection law permits a fully non-returnable mystery product). This checkbox should not be treated as a substitute for that legal review.

**Payment flow resolved (2026-08-25):** this checkout — payment collected online before the order ships — resolves Open Question #3. Updated in Section 16.

---

### 13.18 Order Confirmation — "Keep It a Mystery"

| Element | Armenian | English |
|---|---|---|
| Heading | Ձեր առեղծվածը ճանապարհին է 🎁 | Your Mystery is on its way 🎁 |
| Subheading | Ձեր գիրքը մանրակրկիտ ընտրվել է՝ հիմնվելով Ձեր տրամադրության և ընթերցանության նախասիրությունների վրա։ | Your book has been carefully selected based on your mood and reading preferences. |
| Shown | Selected moods (Section 13.5), Delivery status | Selected moods, Delivery status |
| Delivery status stages | Պատրաստվում է → Առաքվել է → Հանձնվել է | Preparing → Shipped → Delivered |

The book identity remains hidden on this screen.

---

### 13.19 Order Confirmation — "Give Me a Sneak Peek"

| Element | Armenian | English |
|---|---|---|
| Heading | Ձեր գիրքը ճանապարհին է 📚 | Your book is on its way 📚 |
| Shown | Cover, Title, Author, Delivery status (same stages as 13.18) | Cover, Title, Author, Delivery status |

---

### 13.20 Post-Delivery Feedback

Critical input for the learning loop (Section 13.21).

| Element | Armenian | English |
|---|---|---|
| Title | Ինչպե՞ս ստացվեց։ | How did we do? |
| Option | ❤️ Հավանեցի | ❤️ Loved it |
| Option | 👍 Նորմալ էր | 👍 It was okay |
| Option | 👎 Իմը չէր | 👎 Not for me |
| Optional follow-up title | Ի՞նչն էր դուր եկել Ձեզ։ | What did you like about it? |
| Option | Ժանրը | The genre |
| Option | Պատմությունը | The story |
| Option | Գրելաոճը | The writing |
| Option | Կերպարները | The characters |
| Option | Տրամադրությունը | The mood |
| Option | Հեղինակը | The author |

This feedback is written back into the user's recommendation profile (Section 13.2.B — Previous Mystery Book feedback).

---

### 13.21 Recommendation Learning Loop

```
Mystery #1
    ↓
Mood + Genre
    ↓
Book
    ↓
Feedback
    ↓
Taste Profile Updated
    ↓
Mystery #2
    ↓
Better Recommendation
    ↓
Next Mystery
```

Over time, the system should ask fewer questions and rely more on learned behavior — this is the mechanism the Cold-Start Principle (Section 13.3) depends on over a user's lifetime.

---

### 13.22 Core UX Principle (Recap)

**Ask only for information we don't already know.** This is the central rule of the entire feature, restated from Section 13.3:

- User has Favorite genre: Fantasy, and chooses Mood: Escapist → do **not** ask for Genre again.
- User has no genre, no history, no ratings → **ask** for Genre.

---

### 13.23 Required vs. Optional Steps

| Step | Screen (Armenian) | Required? |
|---|---|---|
| Mood | Ի՞նչ տրամադրության եք հիմա (13.5) | ✅ Required |
| Genre | Ի՞նչ տեսակի գրքեր եք սիրում (13.6) | Conditional (Cold-Start, 13.3) |
| Desired Experience | Ի՞նչ եք ուզում Ձեր հաջորդ գրքից (13.7) | ❌ Optional |
| Mystery Level | Որքա՞ն եք ուզում իմանալ (13.8) | ✅ Required |
| Delivery Address | Առաքման հասցե (13.16) | ✅ Required before physical order |
| Payment | Վճարման եղանակ (13.17) | ✅ Required before order |
| Feedback | Ինչպե՞ս ստացվեց (13.20) | ❌ Optional |

---

### 13.24 Navigation Requirements

The user must be able to: go back, change previous selections, and cancel the Mystery flow entirely.

If the user changes their mood *after* a recommendation has already been generated, offer `Թարմացնել իմ առեղծվածը` / `Update My Mystery` — this recalculates the recommendation. Previously entered selections stay saved so the user never has to restart the whole flow from scratch.

---

### 13.25 No-Match State

If the engine cannot find a suitable candidate after filtering (Section 13.11):

| Element | Armenian | English |
|---|---|---|
| Heading | Այս անգամ չկարողացանք գտնել հարմար առեղծված։ | We couldn't find the right mystery this time. |
| Subheading | Փորձեք փոխել Ձեր տրամադրությունը կամ ժանրը՝ մեզ ավելի շատ տարբերակներ տալու համար։ | Try changing your mood or genre to give us more options. |
| CTA | Փոխել նախասիրությունները | Change Preferences |
| Secondary | Փորձել կրկին | Try Again |

Never silently return an unrelated book just to avoid an empty state. If a fallback recommendation is needed, it must be an explicit, defined part of the recommendation strategy (Section 13.10) — not an ad hoc substitution.

---

### 13.26 Out-of-Stock State

If the selected book becomes unavailable before checkout completes:

| Element | Armenian | English |
|---|---|---|
| Heading | Այս առեղծվածն այլևս հասանելի չէ։ | This mystery just disappeared. |
| Subheading | Մեր ընտրած գիրքն այլևս հասանելի չէ։ Թույլ տվեք գտնել մեկ ուրիշը։ | The book we picked is no longer available. Let us find you another one. |
| CTA | Գտնել այլ առեղծված | Find Another Mystery |

The system retains the user's Mood, Genre, Desired Experience, and Mystery preference — the user is never asked to answer the questions again.

---

### 13.27 UI Requirements

**General**
- Mobile-first
- One primary question per screen
- Large typography
- Card/chip-based selection (no dropdowns for mood or genre)
- Minimal supporting text, one clear primary CTA
- No long forms during the recommendation portion of the flow
- No technical/engineering terminology in user-facing copy

**Visual language**
Mystery mode should use a covered book, blur, progressive reveal, a reveal animation, and subtle suspense — but must not feel like gambling or a game. The core experience is still book discovery, not chance.

---

### 13.28 Progress Indicator

Do **not** use literal step counters (`Step 1 of 5`, `Step 2 of 5`) — this makes the flow feel like a questionnaire. Use a subtle indicator instead, e.g. `● ● ○ ○` or a minimal progress bar.

---

### 13.29 Analytics Requirements

Track at minimum (event names are technical identifiers — not localized):

| Event | Trigger | Key properties |
|---|---|---|
| `mystery_book_opened` | Entry screen (13.4) | — |
| `mystery_mood_selected` | Step 1 (13.5) | `mood`, `number_of_moods` |
| `mystery_genre_selected` | Step 2 (13.6) | `genres`, `cold_start` (true/false) |
| `mystery_experience_selected` | Step 3 (13.7) | — |
| `mystery_reveal_preference_selected` | Step 4 (13.8) | `mystery` / `sneak_peek` |
| `mystery_recommendation_generated` | 13.9 pipeline output | `book_id`, `recommendation_score`, `mood_score`, `genre_score` |
| `mystery_book_revealed` | Sneak Peek stage 2 (13.13) | — |
| `mystery_order_started` | 13.14 / 13.15 | — |
| `mystery_order_completed` | After 13.17 | — |
| `mystery_feedback_submitted` | 13.20 | `loved` / `okay` / `not_for_me` |

---

### 13.30 MVP Success Metrics

Track from launch:

- **Conversion:** Mystery opened → Recommendation generated
- **Recommendation acceptance:** Recommendation → Order
- **Mystery retention:** First Mystery → Second Mystery
- **Satisfaction:** % of users selecting "Loved it" (13.20)
- **Reveal preference:** Keep It a Mystery vs. Sneak Peek split — do not assume users prefer the surprise experience; measure it.

---

### 13.31 Final UX Architecture (Full Flow)

```
                     MYSTERY BOOK
                          │
                          ▼
             What are you in the mood for?
                          │
                       1–2 moods
                          │
                          ▼
              ┌─────────────────────────┐
              │ Does the system know    │
              │ enough about the user's │
              │ taste?                  │
              └────────────┬────────────┘
                       NO  │  YES
                           │
                           ▼
                What kind of books
                    do you enjoy?
                           │
                       1–3 genres
                           │
                           ▼
             What do you want from
                  your next read?
                     Optional
                           │
                           ▼
              How much do you want to know?
                    /                \
                   /                  \
                  ▼                    ▼
        KEEP IT A MYSTERY       GIVE ME A SNEAK PEEK
                  │                    │
                  ▼                    ▼
        Hidden Recommendation    Progressive Reveal
                  │                    │
                  └─────────┬──────────┘
                            ▼
                          ORDER
                            │
                            ▼
                         DELIVERY
                            │
                            ▼
                         FEEDBACK
                            │
                            ▼
                   TASTE PROFILE UPDATE
                            │
                            └──────► NEXT MYSTERY
```

**Core product logic, in one line each:**
- Profile = what we already know about you
- Mood = what you want right now
- Taste question = what we don't know yet (Cold-Start, 13.3)
- Mystery level = how much you want revealed (13.1)
- Feedback = how the system gets smarter (13.21)

---

### 13.32 Still Open for This Feature

- **Tier availability** — is the full Mystery Book flow available to Free users, or is personalization itself Paid-only? Still Open Question #12, unconfirmed.
- **Legal review of the non-returnable policy** — Section 13.17 now ships a placeholder acknowledgment checkbox, but the underlying legality (Open Question #4) is still unresolved. Final checkout copy must be revisited once legal answers it.
- **Fulfillment ownership** — who physically selects/ships the book — still Open Question #9.
- **Book catalog metadata sourcing** (Section 13.2, Signal D) — still Open Question #11.
- **Delivery Address on the About Me page** — Section 13.16 assumes the address is saved to the user's profile, but Section 10 doesn't yet have a field group for it. Recommend adding one; not yet done.

---

## 14. Free vs. Paid Tier

### Free Tier
- Up to 150 books
- Reading status, rating, genre (fixed list)
- Basic reading lists
- Characters (flat name list)
- Quotes (unlimited per book)
- Basic notes / commentary
- 1 photo per book
- Manual plot notes

### Paid Tier (Subscription)
- Unlimited books
- AI-generated spoiler-free plot summary
- Mystery Book: better-weighted recommendations (fuller use of reading-history signal, see Section 13.10), plus discounts/priority/special editions
- Advanced personal reading stats and insights
- More customization options
- Unlimited photos per book
- Audio/video media (future, not promised in MVP)
- Custom genre tags (private)
- Custom fields

### Mystery Book
- Full flow (Section 13) — mood + taste quiz, one physical book — available to both Free and Paid users as a separate one-off purchase (**assumption, see Section 13.32 / Open Question #12**)
- Paid subscribers get better-personalized picks (Section 13.10) plus discounts, priority, or special editions
- Physical delivery — handled manually by founder (not a platform feature in MVP)
- Non-returnable — checkout requires an explicit acknowledgment (Section 13.17); final legal wording still pending (Open Question #4)
- **Payment flow (resolved 2026-08-25):** online payment at checkout, before the order ships — see Section 13.17

---

## 15. Language

- **UI language:** Armenian and English (both in MVP)
- **Language switcher:** Location TBD (to be decided during navigation/layout spec)
- **Input fields:** Accept any script freely — no script enforcement on any field
- **Exception — Registration Name/Surname:** Latin characters only (enforced with inline validation)
- **User-entered content:** Never auto-translated. Content stays as typed regardless of active UI language.
- **Genre labels:** Localized to active UI language; underlying value is language-agnostic

---

## 16. Open Questions

| # | Question | Owner | Blocking? |
|---|---|---|---|
| 1 | What is the exact relationship between About Me profile data (Genre, Favorite Authors, About Me text) and the Mystery Book selection logic? Does the founder manually use this data, or is there a system? | Product | ~~Yes~~ **Resolved 2026-08-25** — see Section 13.2.A; it's a direct input to the scoring model, not manual founder judgment |
| 2 | What is the AI rate limit / cost strategy for the "Regenerate AI Summary" feature for paid users? Cap per month? Flat rate? | Engineering | No |
| 3 | ~~What is the payment flow for Mystery Book purchases?~~ | Product / Legal | **Resolved 2026-08-25** — online payment at checkout, before shipping (Section 13.17) |
| 4 | Does Armenian consumer protection law allow a fully non-returnable "mystery" physical product sold online? A placeholder acknowledgment checkbox now ships at checkout (Section 13.17) pending this answer. | Legal | Yes (before Mystery Book launch) |
| 5 | Where exactly does the language switcher live in the UI (nav, header, settings)? | Design | No |
| 6 | ~~What are the exact Mood-Based Recommendations questionnaire questions?~~ | Product | **Resolved 2026-08-25** — see Section 13 (merged into Mystery Book flow) |
| 7 | What does the Paid subscription cost (AMD/month or AMD/year)? | Product / Business | No |
| 8 | What is the "Regenerate AI Summary" UX — is there a visible limit shown to the user, or silent throttling? | Design / Engineering | No |
| 9 | Who selects and ships the Mystery Book — founder manually, or bookstore partner directly? And which bookstore(s)? | Operations | Yes (before Mystery Book launch) |
| 10 | Should the AI Summary generation be triggered automatically when a book is added (paid users only), or always manual (button tap)? | Product | No |
| 11 | Who curates and maintains the Mystery Book candidate catalog and its metadata (subgenre, mood tags, themes, pace, length, popularity, age suitability — Section 13.2.D)? Is there tooling for this, or is it a manual spreadsheet/admin process pre-launch? | Product / Operations | Yes (before Mystery Book launch — engine has no candidates without it) |
| 12 | Is the full Mystery Book recommendation flow (Section 13) available to Free-tier users, or only the purchase itself with a lower-fidelity/no personalization version? The Free/Paid tier tables (Section 14) currently assume both tiers get the full flow, with Paid getting better-weighted personalization. Please confirm or correct. | Product | Yes (before Mystery Book spec is final) |
| 13 | Delivery Address is now saved to the user's profile (Section 13.16) but has no field group on the About Me page (Section 10). Should it be added there as an editable section, and if so, editable/deletable like the other About Me fields? | Design / Product | No |

---

## 17. Still to Spec

The following sections have not yet been defined and are required before the PRD is complete:

- **Mystery Book — remaining commercial terms** — non-return policy final legal wording, catalog curation ownership, fulfillment ownership, tier availability (blocked on Open Questions #4, #9, #11, #12). Recommendation flow, result screens, order flow, payment, confirmation, and feedback loop are now fully specced in Section 13.
- **Subscription / Payment flow** — plan selection, payment gateway, upgrade/downgrade, cancellation (separate from the one-off Mystery Book checkout specced in Section 13.17)
- **Reading Lists** — monthly/yearly list creation, how lists relate to book status and dashboard
- **Navigation / layout details** — language switcher placement, header design, responsive breakpoints
- **Personal stats / insights (paid)** — what data is shown, how it is calculated
- **About Me — Delivery Address field group** — Section 13.16 assumes it exists; not yet added to Section 10 (Open Question #13)

---

## 18. Out of Scope (Future Phases)

- Mobile app (iOS / Android) — Phase 2 after web app validation
- English UI localization — Phase 2
- External book API + manual fallback (Google Books, Open Library) — Phase 2
- Barcode/ISBN scanning — Phase 2
- Soft-delete / trash / recovery — Post-MVP
- Audio/video media attachments — Post-MVP
- Social features (friends, book clubs, shared shelves) — Not planned
- Email change flow — Post-MVP security feature
- Advanced character notes (roles, relationships) — Post-MVP if users request it

---

*Document status: Work in progress. Section 13 (Mystery Book flow — discovery, ordering, delivery, feedback loop) was added and fully specced 2026-08-25, merging the former separate "Mood-Based Recommendations" page into Mystery Book, and bilingual (Armenian/English) UI copy was added throughout. Sections 16–17 will be completed as remaining product/legal decisions are finalized.*
