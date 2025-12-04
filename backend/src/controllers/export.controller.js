const Entry = require('../models/Entry');

async function exportCSV(req, res, next) {
  try {
    const items = await Entry.find({ userId: req.user.id }).sort({ date: -1 });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    const filename = `wellness_export_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const header = 'date,mood,sleep,steps,water,notes\n';
    res.write('\uFEFF'); // BOM for Excel UTF-8
    res.write(header);
    for (const e of items) {
      const row = [
        new Date(e.date).toISOString().slice(0, 10),
        e.mood,
        e.sleep,
        e.steps,
        e.water,
        (e.notes || '').replace(/\n|\r|,|"/g, ' ')
      ].join(',') + '\n';
      res.write(row);
    }
    res.end();
  } catch (err) { next(err); }
}

module.exports = { exportCSV };
