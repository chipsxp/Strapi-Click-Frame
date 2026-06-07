// Passenger entry point for Astro SSR
import('./dist/server/entry.mjs').catch(err => {
    console.error("Failed to start Astro server:", err);
    process.exit(1);
});
