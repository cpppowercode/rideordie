import assert from "node:assert/strict";
import { isFeedbackSectionEnabled } from "./feedback-section";

assert.equal(isFeedbackSectionEnabled(undefined), false);
assert.equal(isFeedbackSectionEnabled(""), false);
assert.equal(isFeedbackSectionEnabled("   "), false);
assert.equal(isFeedbackSectionEnabled("0"), false);
assert.equal(isFeedbackSectionEnabled("false"), false);
assert.equal(isFeedbackSectionEnabled("on"), false);
assert.equal(isFeedbackSectionEnabled("yes"), false);
assert.equal(isFeedbackSectionEnabled("1"), true);
assert.equal(isFeedbackSectionEnabled("true"), true);
assert.equal(isFeedbackSectionEnabled("TRUE"), true);
assert.equal(isFeedbackSectionEnabled(" 1 "), true);

console.log("feedback-section.test.ts: ok");
