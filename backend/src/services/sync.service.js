const crypto = require('crypto');
const User = require('../models/User');
const Entry = require('../models/Entry');

/**
 * Register a device for cloud sync
 */
async function registerDevice(userId, deviceInfo) {
  try {
    const deviceId = crypto.randomBytes(16).toString('hex');
    const { deviceName = 'Unknown Device', platform = 'web' } = deviceInfo;

    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          syncedDevices: {
            id: deviceId,
            name: deviceName,
            platform,
            lastSync: new Date(),
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    return {
      deviceId,
      deviceName,
      platform,
      message: 'Device registered for cloud sync'
    };
  } catch (error) {
    console.error('Error registering device:', error);
    throw error;
  }
}

/**
 * Get all synced devices for a user
 */
async function getSyncedDevices(userId) {
  try {
    const user = await User.findById(userId, 'syncedDevices');
    return user?.syncedDevices || [];
  } catch (error) {
    console.error('Error fetching synced devices:', error);
    throw error;
  }
}

/**
 * Remove a device from cloud sync
 */
async function removeDevice(userId, deviceId) {
  try {
    await User.findByIdAndUpdate(
      userId,
      { $pull: { syncedDevices: { id: deviceId } } },
      { new: true }
    );

    return { removed: true, message: 'Device removed from cloud sync' };
  } catch (error) {
    console.error('Error removing device:', error);
    throw error;
  }
}

/**
 * Sync user data across devices
 * Returns all user data needed to sync to a device
 */
async function syncUserData(userId, lastSyncTimestamp = null) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get all entries (or just modified ones since last sync)
    const entryQuery = { userId };
    if (lastSyncTimestamp) {
      entryQuery.updatedAt = { $gt: new Date(lastSyncTimestamp) };
    }

    const entries = await Entry.find(entryQuery).sort({ date: -1 });

    return {
      user: user.toJSON(),
      entries,
      syncedAt: new Date(),
      dataVersion: '1.0'
    };
  } catch (error) {
    console.error('Error syncing user data:', error);
    throw error;
  }
}

/**
 * Get sync status for a user
 */
async function getSyncStatus(userId) {
  try {
    const user = await User.findById(userId, 'syncedDevices updatedAt');
    const totalEntries = await Entry.countDocuments({ userId });

    return {
      userId,
      lastSyncedAt: user?.updatedAt,
      totalDataPoints: totalEntries,
      devicesConnected: user?.syncedDevices?.length || 0,
      syncStatus: 'synced'
    };
  } catch (error) {
    console.error('Error getting sync status:', error);
    throw error;
  }
}

/**
 * Export user data in standard formats (JSON, CSV)
 */
async function exportUserData(userId, format = 'json') {
  try {
    const user = await User.findById(userId);
    const entries = await Entry.find({ userId }).sort({ date: -1 });

    if (format === 'json') {
      return {
        format: 'json',
        data: {
          user: user.toJSON(),
          entries,
          exportedAt: new Date()
        }
      };
    } else if (format === 'csv') {
      const csvHeader =
        'Date,Mood,Sleep (hrs),Steps,Water (L),Notes,Mood Emoji\n';
      const csvRows = entries
        .map(
          (entry) =>
            `${new Date(entry.date).toISOString().split('T')[0]},${
              entry.mood
            },${entry.sleep},${entry.steps},${entry.water},"${(
              entry.notes || ''
            ).replace(/"/g, '""')}",${entry.moodEmoji || 'N/A'}`
        )
        .join('\n');

      return {
        format: 'csv',
        data: csvHeader + csvRows,
        filename: `wellness-export-${userId}-${
          new Date().toISOString().split('T')[0]
        }.csv`
      };
    }

    throw new Error('Unsupported export format');
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
}

module.exports = {
  registerDevice,
  getSyncedDevices,
  removeDevice,
  syncUserData,
  getSyncStatus,
  exportUserData
};
