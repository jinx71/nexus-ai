const Usage = require('../models/Usage');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

const DAYS = 14;

const ymd = (date) => date.toISOString().slice(0, 10);

/**
 * GET /api/usage  -> everything the dashboard needs in one round trip:
 *   totals  : { requests, inputChars, outputChars }
 *   byTool  : [{ tool, count, outputChars }]
 *   byDay   : [{ date, count }]   (continuous, last 14 days, zero-filled)
 *   recent  : last 8 raw rows
 */
const summary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (DAYS - 1));

  const [totalsAgg, byToolAgg, byDayAgg, recent] = await Promise.all([
    Usage.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          requests: { $sum: 1 },
          inputChars: { $sum: '$inputChars' },
          outputChars: { $sum: '$outputChars' },
        },
      },
    ]),
    Usage.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$tool',
          count: { $sum: 1 },
          outputChars: { $sum: '$outputChars' },
        },
      },
      { $sort: { count: -1 } },
    ]),
    Usage.aggregate([
      { $match: { user: userId, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    Usage.find({ user: userId }).sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  const totals = totalsAgg[0] || { requests: 0, inputChars: 0, outputChars: 0 };
  delete totals._id;

  const byTool = byToolAgg.map((t) => ({
    tool: t._id,
    count: t.count,
    outputChars: t.outputChars,
  }));

  // Build a continuous, zero-filled day series so the chart never has gaps.
  const counts = new Map(byDayAgg.map((d) => [d._id, d.count]));
  const byDay = [];
  for (let i = 0; i < DAYS; i += 1) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = ymd(d);
    byDay.push({ date: key, count: counts.get(key) || 0 });
  }

  return ok(res, {
    totals,
    byTool,
    byDay,
    recent: recent.map((r) => ({
      id: r._id,
      tool: r.tool,
      model: r.model,
      inputChars: r.inputChars,
      outputChars: r.outputChars,
      ms: r.ms,
      createdAt: r.createdAt,
    })),
  });
});

module.exports = { summary };
