// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_cynical_alex_wilder.sql';
import m0001 from './0001_rich_starfox.sql';
import m0002 from './0002_stormy_storm.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002
    }
  }
  