const mariadb = require('mariadb');

let pool;
if (process.env.NODE_ENV === 'production') {
  pool = mariadb.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    connectionLimit: 5
  });
} else {
  pool = mariadb.createPool({
    host: 'localhost',
    user: 'grand_central',
    connectionLimit: 5
  });
}

module.exports = (sql, args) => {
  return pool.getConnection().then(connection => {
    return connection
      .query(sql, args)
      .catch(error => {
        console.error(error);
        throw new Error('Database error.');
      })
      .finally(() => {
        connection.end();
      });
  });
};
