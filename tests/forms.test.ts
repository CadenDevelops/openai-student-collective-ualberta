import test from "node:test";
import assert from "node:assert/strict";
import {
  makeForm,
  validateDefinition,
  validateSlug,
  validateAnswers,
  isOpen,
  csvCell,
} from "../src/lib/forms";
test("a complete check-in is validated and unknown fields are discarded", () => {
  const f = makeForm("checkin");
  const a = validateAnswers(f.fields, {
    name: " Caden ",
    program: "Computing Science",
    faculty: "Science",
    role: "Undergraduate student",
    isAdmin: true,
  });
  assert.equal(a.name, "Caden");
  assert.equal(a.isAdmin, undefined);
});
test("required fields and invented choices cannot bypass validation", () => {
  const f = makeForm("checkin");
  assert.throws(() => validateAnswers(f.fields, { name: "Caden" }));
  assert.throws(() =>
    validateAnswers(f.fields, {
      name: "Caden",
      program: "CS",
      source: "injected",
    }),
  );
});
test("multiple choice validates required answers and rejects duplicates", () => {
  const f = {
    id: "q",
    label: "Choose",
    type: "multi" as const,
    required: true,
    options: ["A", "B"],
  };
  assert.throws(() => validateAnswers([f], { q: [] }));
  assert.throws(() => validateAnswers([f], { q: ["A", "A"] }));
  assert.deepEqual(validateAnswers([f], { q: ["B"] }).q, ["B"]);
});
test("published opening and closing boundaries are enforced", () => {
  const f = {
    ...makeForm("checkin"),
    status: "published" as const,
    opensAt: "2026-09-15T12:00:00Z",
    closesAt: "2026-09-15T13:00:00Z",
  };
  assert.equal(isOpen(f, Date.parse(f.opensAt) - 1), false);
  assert.equal(isOpen(f, Date.parse(f.opensAt)), true);
  assert.equal(isOpen(f, Date.parse(f.closesAt)), false);
  assert.equal(
    isOpen({ ...f, status: "closed" }, Date.parse(f.opensAt)),
    false,
  );
});
test("definition rejects duplicate ids, empty options, and unsafe keys", () => {
  const f = makeForm("checkin");
  assert.throws(() =>
    validateDefinition({ ...f, fields: [f.fields[0], f.fields[0]] }),
  );
  assert.throws(() =>
    validateDefinition({ ...f, fields: [{ ...f.fields[0], id: "__proto__" }] }),
  );
  assert.throws(() =>
    validateDefinition({
      ...f,
      fields: [{ ...f.fields[0], type: "select", options: [] }],
    }),
  );
});
test("CSV handles quotes, multiline values and spreadsheet formulas", () => {
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell("=1+1"), '"\'=1+1"');
  assert.equal(csvCell(" +cmd"), '"\' +cmd"');
  assert.equal(csvCell("a\nb"), '"a\nb"');
});

test("program choices must match faculty and hidden years are discarded", () => {
 const f=makeForm("checkin");
 const a={name:"Test",role:"Faculty member",faculty:"Engineering",program:"Mechanical Engineering",year:"4"};
 assert.equal(validateAnswers(f.fields,a).year,undefined);
 assert.throws(()=>validateAnswers(f.fields,{...a,faculty:"Science"}));
 assert.equal(validateAnswers(f.fields,{...a,program:"Not applicable"}).program,"Not applicable");
});
test("background settings are validated and older forms get defaults", () => {
 const f=makeForm("checkin");
 assert.throws(()=>validateDefinition({...f,background:"invalid"}));
 assert.equal(validateDefinition({...f,background:undefined,animated:undefined}).background,"aurora");
 assert.equal(validateDefinition({...f,animated:false}).animated,false);
});

test("custom links are lowercased and cannot shadow a form id or a route", () => {
  assert.equal(validateSlug("  Fall-Kickoff  "), "fall-kickoff");
  assert.equal(validateSlug("check_in_2026"), "check_in_2026");
  for (const bad of [
    "ab",                                     // under three characters
    "-leading",                               // must start alphanumeric
    "trailing-",                              // must end alphanumeric
    "has space",
    "has/slash",
    "Ünicode",
    "f",                                      // reserved route word
    "forms",
    "responses",
    "a".repeat(49),                           // over the length ceiling
    "3f2504e0-4f89-11d3-9a0c-0305e82c3301",   // shaped like a document id
  ])
    assert.throws(() => validateSlug(bad), Error, `expected ${bad} to be rejected`);
  assert.throws(() => validateSlug(""), Error);
  assert.throws(() => validateSlug(null), Error);
});
