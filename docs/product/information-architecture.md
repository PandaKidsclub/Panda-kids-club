# Information Architecture

Primary destinations:

- `/` - Home
- `/stories` - Stories
- `/learn` - Learn
- `/heroes` - Heroes
- `/specials` - Specials
- `/my-list` - Device-local saved programme collection
- `/coming-soon` - Cinematic upcoming-title release event
- `/monthly-updates` - Permanent redirect to `/coming-soon`
- `/search` - Local catalogue search; `q` is the shareable routed query parameter
- `/title/[slug]` - Reusable programme title-detail route
- `/watch/[slug]` - Dedicated full-programme playback route

Repeated visual mockups with the same category heading are not separate pages. A category is one vertically scrollable page with multiple sections.

Examples:

- Stories is one `/stories` page with a living hero, Storytime Adventures, and More Storytime Titles.
- Learn is one `/learn` page with a living hero, Learn with Panda, and More Learning Titles.
- Heroes is one `/heroes` page with a living hero and the Real African Heroes collection.
- Specials is one `/specials` page with a living hero and the Featured Specials collection.
- Coming Soon is the canonical release event at `/coming-soon`. It presents one editorially ordered 15-title showcase, with exactly 5 Learning, 5 Storytime Adventures, and 5 Heroes & Folktales records. `/monthly-updates` redirects there.

Language adaptations remain a future content and metadata consideration pending approved product definition. They are not a Stage 5 destination, rail, or filter.

Programme discovery stays explicit: library cards select a programme, the living hero offers Play and More Info, Search and My List result cards open Title Detail, and Watch removes the library chrome for focused viewing. Search starts quietly until a meaningful query is supplied and filters the shared local programme registry; it does not create a search history or recommendations. My List is intentionally browser/device-local until a future approved authenticated-profile storage model exists.

Do not invent real programme data while building route or section architecture.
