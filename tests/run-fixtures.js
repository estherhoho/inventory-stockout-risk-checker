#!/usr/bin/env node
"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var app = require("../code/app.js");

var root = path.resolve(__dirname, "..");

function readFixture(name) {
  return fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8");
}

function sampleCsv() {
  return fs.readFileSync(path.join(root, "data", "sample", "shopify-inventory-sample.csv"), "utf8");
}

function bySku(result, sku) {
  return result.rows.find(function find(row) { return row.sku === sku; });
}

function approx(actual, expected, delta, message) {
  assert.ok(Math.abs(actual - expected) <= delta, message + " expected " + expected + " got " + actual);
}

function test(name, fn) {
  try {
    fn();
    console.log("PASS " + name);
  } catch (error) {
    console.error("FAIL " + name);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

test("valid sample matches playground sanity checks", function validSample() {
  var result = app.analyzeCsv(sampleCsv());
  assert.equal(result.ok, true);
  assert.equal(result.summary.skuCount, 10);
  assert.equal(result.summary.stockoutHigh, 4);
  assert.equal(result.summary.deadstock, 3);
  assert.equal(result.summary.totalCashTiedUp, 2296);

  var sku1004 = bySku(result, "SKU-1004");
  approx(sku1004.metrics.daysOfCover, 1.2, 0.001, "SKU-1004 days cover");
  assert.equal(sku1004.action, "expedite");
  assert.equal(sku1004.metrics.reorderQuantity, 108);
  assert.equal(sku1004.defaultTemplate, "urgent_expedite");

  assert.equal(bySku(result, "SKU-1003").metrics.deadstockCandidate, true);
  assert.equal(bySku(result, "SKU-1010").metrics.deadstockCandidate, true);
  assert.equal(bySku(result, "SKU-1008").action, "hold");
});

test("missing required column fails validation", function missingRequired() {
  var result = app.analyzeCsv(readFixture("missing-required-column.csv"));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(function has(error) { return error.indexOf("Missing required column: lead_time_days") >= 0; }));
});

test("invalid numeric field fails validation", function invalidNumber() {
  var result = app.analyzeCsv(readFixture("invalid-number.csv"));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(function has(error) { return error.indexOf("Invalid number in units_sold_30d") >= 0; }));
});

test("duplicate SKU fails validation", function duplicateSku() {
  var result = app.analyzeCsv(readFixture("duplicate-sku.csv"));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(function has(error) { return error.indexOf("Duplicate SKU found: SKU-DUP") >= 0; }));
});

test("committed exceeds on-hand floors available inventory and warns", function committedExceeds() {
  var result = app.analyzeCsv(readFixture("committed-exceeds-onhand.csv"));
  assert.equal(result.ok, true);
  var row = bySku(result, "SKU-COMMIT");
  assert.equal(row.metrics.availableInventory, 0);
  assert.equal(row.caveats.committedExceedsOnHand, true);
  assert.equal(result.dataQuality.warnings.committedExceedsOnHand, 1);
});

test("newly active SKU caveat triggers", function newlyActive() {
  var result = app.analyzeCsv(readFixture("newly-active-sku.csv"));
  assert.equal(result.ok, true);
  assert.equal(bySku(result, "SKU-NEW").caveats.newlyActiveSku, true);
  assert.equal(result.dataQuality.warnings.newlyActiveSku, 1);
});

test("urgent expedite template includes projected days short", function urgentTemplate() {
  var result = app.analyzeCsv(readFixture("expedite-projected-days-short.csv"));
  assert.equal(result.ok, true);
  var row = bySku(result, "SKU-RUSH");
  assert.equal(row.action, "expedite");
  assert.equal(row.defaultTemplate, "urgent_expedite");
  assert.ok(app.buildSupplierDraft(row, "urgent_expedite").indexOf("Projected days short") >= 0);
});

test("long lead time safety buffer scales", function longLeadTime() {
  assert.equal(app.computeSafetyBufferDays(14), 7);
  assert.equal(app.computeSafetyBufferDays(30), 8);
  assert.equal(app.computeSafetyBufferDays(45), 12);
  assert.equal(app.computeSafetyBufferDays(60), 15);
});

test("inline lead-time edit recalculates action and template", function leadEdit() {
  var result = app.analyzeCsv(readFixture("lead-time-edit.csv"));
  var row = bySku(result, "SKU-EDIT");
  assert.equal(row.action, "reorder");
  var edited = app.recalcRowForLeadTimeEdit(row, 60);
  assert.equal(edited.action, "expedite");
  assert.equal(edited.defaultTemplate, "urgent_expedite");
});

test("track stub is inert", function trackStub() {
  var networkCalls = 0;
  var cookieWrites = 0;
  var previousFetch = globalThis.fetch;
  var previousDocument = globalThis.document;

  globalThis.fetch = function fetchStub() {
    networkCalls += 1;
  };
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      get cookie() {
        return "";
      },
      set cookie(value) {
        cookieWrites += 1;
      }
    }
  });

  assert.doesNotThrow(function callTrack() {
    app.track("foo", { bar: 1 });
  });
  assert.equal(networkCalls, 0);
  assert.equal(cookieWrites, 0);

  if (previousFetch === undefined) delete globalThis.fetch;
  else globalThis.fetch = previousFetch;
  if (previousDocument === undefined) delete globalThis.document;
  else Object.defineProperty(globalThis, "document", { configurable: true, value: previousDocument });
});
