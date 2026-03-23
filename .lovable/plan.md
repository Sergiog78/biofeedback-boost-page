

## Problem

The day headers ("Sabato 9 maggio 2026 – ore 9:00–13:00") are small, inline text that blends in with the module cards. There's no visual separation between days, making it hard to understand which modules belong to which day.

## Solution

Transform each day header into a prominent, visually distinct card/banner that acts as a clear separator between days. Changes to `src/components/Program.tsx` only:

1. **Replace the simple day header** (lines 190-194) with a styled banner that includes:
   - A "Giornata 1/2/3/4" label as a prominent badge
   - The date and time displayed larger and bolder
   - A colored left border or background accent to create visual weight
   - More vertical spacing (`mt-10` for days after the first) to separate day groups

2. **Wrap each day's modules** in a container with a subtle left border line connecting them visually to their day header, reinforcing the grouping.

The data structure stays the same — only the rendering of the day header row changes.

