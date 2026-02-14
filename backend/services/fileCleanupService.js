const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

class FileCleanupService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '..', 'uploads');
    this.maxAge = 60 * 60 * 1000; // 1 hour in milliseconds
  }

  startCleanupService() {
    console.log('Starting file cleanup service...');
    
    // Run cleanup every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      this.cleanupOldFiles();
    });

    // Also run cleanup on startup after 5 minutes
    setTimeout(() => {
      this.cleanupOldFiles();
    }, 5 * 60 * 1000);
  }

  async cleanupOldFiles() {
    try {
      console.log('Running file cleanup...');
      
      if (!fs.existsSync(this.uploadsDir)) {
        console.log('Uploads directory does not exist, nothing to cleanup');
        return;
      }

      const now = Date.now();
      const entries = fs.readdirSync(this.uploadsDir, { withFileTypes: true });
      let deletedCount = 0;
      let totalSize = 0;

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const jobDir = path.join(this.uploadsDir, entry.name);
          const stats = fs.statSync(jobDir);
          const age = now - stats.mtime.getTime();

          if (age > this.maxAge) {
            try {
              const size = await this.getDirectorySize(jobDir);
              this.removeDirectory(jobDir);
              deletedCount++;
              totalSize += size;
              console.log(`Deleted job directory: ${entry.name} (${this.formatBytes(size)})`);
            } catch (error) {
              console.error(`Failed to delete directory ${entry.name}:`, error);
            }
          }
        }
      }

      if (deletedCount > 0) {
        console.log(`Cleanup completed: deleted ${deletedCount} directories, freed ${this.formatBytes(totalSize)}`);
      } else {
        console.log('Cleanup completed: no old files to delete');
      }

    } catch (error) {
      console.error('File cleanup failed:', error);
    }
  }

  async getDirectorySize(dirPath) {
    let totalSize = 0;

    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
          totalSize += await this.getDirectorySize(itemPath);
        } else {
          const stats = fs.statSync(itemPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      console.error(`Error calculating directory size for ${dirPath}:`, error);
    }

    return totalSize;
  }

  removeDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        this.removeDirectory(itemPath);
      } else {
        fs.unlinkSync(itemPath);
      }
    }

    fs.rmdirSync(dirPath);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Method to manually clean up a specific job
  cleanupJob(jobId) {
    try {
      const jobDir = path.join(this.uploadsDir, jobId);
      
      if (fs.existsSync(jobDir)) {
        const size = this.getDirectorySize(jobDir);
        this.removeDirectory(jobDir);
        console.log(`Manually cleaned up job ${jobId} (${this.formatBytes(size)})`);
        return true;
      } else {
        console.log(`Job directory ${jobId} does not exist`);
        return false;
      }
    } catch (error) {
      console.error(`Failed to cleanup job ${jobId}:`, error);
      return false;
    }
  }

  // Get current storage usage
  async getStorageStats() {
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        return {
          totalSize: 0,
          jobCount: 0,
          oldJobCount: 0
        };
      }

      const entries = fs.readdirSync(this.uploadsDir, { withFileTypes: true });
      const now = Date.now();
      let totalSize = 0;
      let jobCount = 0;
      let oldJobCount = 0;

      for (const entry of entries) {
        if (entry.isDirectory()) {
          jobCount++;
          const jobDir = path.join(this.uploadsDir, entry.name);
          const stats = fs.statSync(jobDir);
          const age = now - stats.mtime.getTime();
          
          if (age > this.maxAge) {
            oldJobCount++;
          }
          
          totalSize += await this.getDirectorySize(jobDir);
        }
      }

      return {
        totalSize,
        jobCount,
        oldJobCount,
        totalSizeFormatted: this.formatBytes(totalSize)
      };

    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        error: error.message
      };
    }
  }
}

module.exports = new FileCleanupService();