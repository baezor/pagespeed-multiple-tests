const fs = require("fs");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const reports = [];
const urls = ["https://deepgram.com/"];
(async () => {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const chrome = await chromeLauncher.launch({
      chromeFlags: ["--headless"],
    });
    const options = {
      logLevel: "info",
      output: "json",

      onlyAudits: [
        "first-contentful-paint",
        "interactive",
        "speed-index",
        "total-blocking-time",
        "largest-contentful-paint",
        "cumulative-layout-shift",
      ],
      port: chrome.port,
      settings: {},
    };
    const runnerResult = await lighthouse(url, options);

    reports.push({
      url: runnerResult.lhr.finalUrl,
      score: runnerResult.lhr.categories.performance.score * 100,
      firstContentfulPaint:
        runnerResult.lhr.audits["first-contentful-paint"].displayValue,
      interactive: runnerResult.lhr.audits.interactive.displayValue,
      speedIndex: runnerResult.lhr.audits["speed-index"].displayValue,
      totalBlockingTime:
        runnerResult.lhr.audits["total-blocking-time"].displayValue,
      largestContentfulPaint:
        runnerResult.lhr.audits["largest-contentful-paint"].displayValue,
      cumulativeLayoutShift:
        runnerResult.lhr.audits["cumulative-layout-shift"].displayValue,
    });

    console.log("Report is done for ", url);
    console.log(
      "Performance score was",
      runnerResult.lhr.categories.performance.score * 100
    );
    await chrome.kill();
  }

  // Create CSV file from reports
  const headers = [
    "url,score,firstContentfulPaint,interactive,speedIndex,totalBlockingTime,largestContentfulPaint,cumulativeLayoutShift",
  ];
  const csv = reports.map((r) => Object.values(r).join(",")).join("\n");
  const finalCSV = headers.concat(csv).join("\n");

  fs.writeFileSync("reports2.csv", finalCSV);
})();
