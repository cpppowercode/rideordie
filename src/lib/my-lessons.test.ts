import assert from "node:assert/strict";
import { validateMyLessonLookupInput } from "@/lib/my-lessons-shared";

const badName = validateMyLessonLookupInput({ customerName: "김", customerPhone: "01012345678" });
assert.equal(badName.ok, false);

const badPhone = validateMyLessonLookupInput({ customerName: "홍길동", customerPhone: "123" });
assert.equal(badPhone.ok, false);

const ok = validateMyLessonLookupInput({ customerName: "홍 길동", customerPhone: "010-1234-5678" });
assert.equal(ok.ok, true);
if (ok.ok) {
  assert.equal(ok.name, "홍 길동");
  assert.equal(ok.phone, "01012345678");
}

console.log("my-lessons input validation ok");
