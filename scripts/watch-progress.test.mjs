import assert from "node:assert/strict";
import test from "node:test";
import {
  isResumableWatchProgress,
  parseWatchProgressStorage,
  WATCH_PROGRESS_MINIMUM_SECONDS,
} from "../src/features/watch-progress/watch-progress-storage.ts";

test("accepts stored progress only for the current storage schema", () => {
  const stored = JSON.stringify({
    progressBySlug: {
      honey: {
        durationSeconds: 148,
        positionSeconds: 64.2,
        updatedAt: 1,
      },
    },
    version: 1,
  });

  assert.deepEqual(parseWatchProgressStorage(stored), {
    honey: {
      durationSeconds: 148,
      positionSeconds: 64.2,
      updatedAt: 1,
    },
  });
  assert.deepEqual(parseWatchProgressStorage('{"version":2,"progressBySlug":{}}'), {});
  assert.deepEqual(parseWatchProgressStorage("not-json"), {});
});

test("makes progress resumable after one minute but clears completed videos", () => {
  assert.equal(isResumableWatchProgress({ durationSeconds: 148, positionSeconds: WATCH_PROGRESS_MINIMUM_SECONDS - 0.1, updatedAt: 1 }), false);
  assert.equal(isResumableWatchProgress({ durationSeconds: 148, positionSeconds: WATCH_PROGRESS_MINIMUM_SECONDS, updatedAt: 1 }), true);
  assert.equal(isResumableWatchProgress({ durationSeconds: 148, positionSeconds: 135, updatedAt: 1 }), false);
});
