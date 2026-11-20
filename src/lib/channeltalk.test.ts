import assert from "node:assert/strict";
import {
  DEFAULT_CHANNELTALK_PLUGIN_KEY,
  getChannelTalkPluginKey,
  isChannelTalkEnabled,
  shouldHideChannelTalk,
  shouldOffsetChannelTalkForMobileCta,
} from "./channeltalk";

assert.equal(getChannelTalkPluginKey(undefined), DEFAULT_CHANNELTALK_PLUGIN_KEY);
assert.equal(getChannelTalkPluginKey(""), DEFAULT_CHANNELTALK_PLUGIN_KEY);
assert.equal(getChannelTalkPluginKey("   "), DEFAULT_CHANNELTALK_PLUGIN_KEY);
assert.equal(getChannelTalkPluginKey("custom-key"), "custom-key");
assert.equal(getChannelTalkPluginKey("  custom-key  "), "custom-key");

assert.equal(isChannelTalkEnabled(), true);
assert.equal(isChannelTalkEnabled("x"), true);

assert.equal(shouldHideChannelTalk("/book"), true);
assert.equal(shouldHideChannelTalk("/book/success"), true);
assert.equal(shouldHideChannelTalk("/checkout"), true);
assert.equal(shouldHideChannelTalk("/checkout/fail"), true);
assert.equal(shouldHideChannelTalk("/"), false);
assert.equal(shouldHideChannelTalk("/product/1"), false);
assert.equal(shouldHideChannelTalk("/booking"), false);

assert.equal(shouldOffsetChannelTalkForMobileCta("/product/abc"), true);
assert.equal(shouldOffsetChannelTalkForMobileCta("/product"), true);
assert.equal(shouldOffsetChannelTalkForMobileCta("/"), false);
assert.equal(shouldOffsetChannelTalkForMobileCta("/book"), false);

console.log("channeltalk.test.ts: ok");
