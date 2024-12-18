import SQLite from 'react-native-sqlite-storage';

// Open or create the SQLite database
const db = SQLite.openDatabase(
  {
    name: 'JokesAppDB.db',
    location: 'default',
  },
  () => console.log('Database opened successfully!'),
  (error) => console.error('Error opening database:', error)
);

// Initialize the database: Create the "users" table
export const initializeDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )`,
      [],
      () => console.log('Users table created successfully.'),
      (tx, error) => console.error('Error creating Users table:', error)
    );
  });
};

// // Add a new user to the "users" table
// export const addUser = (email, password) => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `INSERT INTO users (email, password) VALUES (?, ?)`,
//         [email, password],
//         (_, result) => resolve(result.insertId), // Return the new user's ID
//         (_, error) => reject(error) // Reject if the insertion fails
//       );
//     });
//   });
// };


// Add a new user to the "users" table
export const addUser = async (email, password) => {
  try {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        // Check if the email already exists in the database
        tx.executeSql(
          `SELECT * FROM users WHERE email = ?`,
          [email],
          (_, result) => {
            if (result.rows.length > 0) {
              reject(new Error('User with this email already exists.'));
            } else {
              // Insert a new user into the "users" table
              tx.executeSql(
                `INSERT INTO users (email, password) VALUES (?, ?)`,
                [email, password],
                (_, result) => resolve(result.insertId), // Return the new user's ID
                (_, error) => reject(error) // Reject if the insertion fails
              );
            }
          },
          (_, error) => reject(error) // SQL query failed
        );
      });
    });
  } catch (error) {
    console.error('Error in addUser:', error.message);
    throw new Error('Could not add user. Please try again later.');
  }
};



// Export the database instance for optional future use
export default db;
