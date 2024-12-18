import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Modal, ImageBackground, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite'; // Import SQLite
import { Alert } from 'react-native';

const backgroundImage = { uri: 'https://mrwallpaper.com/images/high/laughing-smiley-plain-yellow-iphone-ox4xg4hu4pjhs9lx.webp' };

async function openDatabase() {
  const db = await SQLite.openDatabaseAsync('JokesAppDB');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      username TEXT UNIQUE NOT NULL, 
      password TEXT NOT NULL
    );
  `);
  return db;
}

let db;

function App() {
  const [view, setView] = useState('enter'); // Main view state
  const [currentUser, setCurrentUser] = useState(null); // Tracks logged-in user
  const [favorites, setFavorites] = useState([]); // Favorite jokes
  const [isModalVisible, setModalVisible] = useState(false); // Favorites modal state

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      db = await openDatabase();
    })();
  }, []);

  const addUserToDB = async (username, password) => {
    try {
      const result = await db.runAsync('INSERT INTO users (username, password) VALUES (?, ?)', username, password);
      console.log('User added successfully:', result);
    } catch (error) {
      console.error('Error inserting user:', error);
    }
  };

  const getUserFromDB = async (username, password) => {
    try {
      const user = await db.getFirstAsync('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
      return user;
    } catch (error) {
      console.error('Error retrieving user:', error);
      return null;
    }
  };

  const handleSignUp = async () => {
    if (username && password) {
      try {
        const userExists = await db.getFirstAsync('SELECT * FROM users WHERE username = ?', [username]);
        if (userExists) {
          setError('Username already exists');
        } else {
          await addUserToDB(username, password);
          setError('');
          setView('enter');
          setUsername('');
          setPassword('');
        }
      } catch (error) {
        console.error('Error checking user existence:', error);
      }
    } else {
      setError('Please fill in both fields');
    }
  };

  const handleLogin = async () => {
    const user = await getUserFromDB(username, password);
    if (user) {
      setCurrentUser(user);
      setView('categories');
      setError('');
      setUsername('');
      setPassword('');
    } else {
      setError('Invalid username or password');
    }
  };
  const categories = [
    { id: 'One Liners Jokes', name: 'One Liners Jokes', jokes: [
      'I told my wife she was drawing her eyebrows too high. She looked surprised!',
      'Im on a whiskey diet—Ive lost three days already!',
      'I used to play piano by ear, but now I use my hands.',
      'I would tell you a joke about an elevator, but its an uplifting experience!',
    ]},
    { id: 'Dad Jokes', name: 'Dad Jokes', jokes: [
      'Why dont skeletons fight each other? They dont have the guts!',
      'I used to have a handle on life, but then it broke.',
      'Why did the scarecrow win an award? Because he was outstanding in his field!',
      'Im afraid for the calendar. Its days are numbered.',
      'Why did the golfer bring two pairs of pants? In case he got a hole in one!',
    ]},
  ];

  const addToFavorites = (joke) => {
    if (!favorites.includes(joke)) {
      setFavorites([...favorites, joke]);
    }
  };
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const renderView = () => {
    switch (view) {
      case 'enter':
        return (
          <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
            <View style={styles.center}>
              <Text style={styles.welcome}>Jokes Library</Text>
              <TouchableOpacity style={styles.customButton} onPress={() => setView('login')}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.customButton} onPress={() => setView('signup')}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        );
      case 'signup':
        return renderAuthForm('Sign Up', handleSignUp);
      case 'login':
        return renderAuthForm('Login', handleLogin);
      case 'categories':
        return renderCategories();
      case 'updateAccount':
            return (
              <View style={styles.center}>
                <Text style={styles.title}>Update Your Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                {error !== '' && <Text style={styles.errorText}>{error}</Text>}
                <TouchableOpacity style={styles.customButton} onPress={() => updateUserPassword(password)}>
                  <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.customButton} onPress={() => setView('categories')}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            );
          
      default:
        return renderCategoryJokes(view);
    }
  };

  const renderAuthForm = (title, submitHandler) => (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error !== '' && <Text style={styles.errorText}>{error}</Text>}
  
      {/* Submit Button */}
      <TouchableOpacity style={styles.customButton} onPress={submitHandler}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
  
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => setView('enter')}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
  







  

const renderCategories = () => (
    <View style={styles.center}>
      <Text style={styles.title}>Welcome, {currentUser?.username}!</Text>
      <Text style={styles.select}>Select a Joke Category</Text>
      {categories.map(category => (
        <TouchableOpacity key={category.id} style={styles.categoryButton} onPress={() => setView(category.id)}>
          <Text style={styles.categoryButtonText}>{category.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.customButton} onPress={() => setView('updateAccount')}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.customButton} onPress={handleDeleteAccount}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.customButton} onPress={toggleModal}>
        <Text style={styles.buttonText}>View Favorites</Text>
      </TouchableOpacity>
    </View>
  );
  
  
  const renderCategoryJokes = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return (
      <View style={styles.jokesView}>
        <Text style={styles.title}>{category.name}</Text>
        <FlatList
          data={category.jokes}
          renderItem={({ item }) => (
            <View style={styles.jokeContainer}>
              <Text style={styles.jokeText}>{item}</Text>
              <TouchableOpacity onPress={() => addToFavorites(item)}>
                <Text style={styles.favoriteText}>
                  {favorites.includes(item) ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <TouchableOpacity style={styles.customButton} onPress={() => setView('categories')}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };
  


  const updateUserPassword = async (newPassword) => {
    try {
      await db.runAsync('UPDATE users SET password = ? WHERE id = ?', [newPassword, currentUser.id]);
      setError('');
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password.');
    }
  };
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: deleteUserAccount, style: "destructive" }
      ]
    );
  };
  
  const deleteUserAccount = async () => {
    try {
      await db.runAsync('DELETE FROM users WHERE id = ?', [currentUser.id]);
      setCurrentUser(null);
      setView('enter');
      alert('Account deleted successfully!');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account.');
    }
  };
  
console.log(favorites)
  return (
    <View style={styles.appContainer}>
      {renderView()}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            <Text style={styles.title}>Your Favorite Jokes</Text>
            
            {/* FlatList to display favorite jokes */}
            <FlatList
                data={favorites}
                renderItem={({ item }) => (
                <View style={styles.jokeContainer}>
                    <Text >{item}zzzz</Text>
                </View>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
            
            {/* Button to exit the modal */}
            <TouchableOpacity style={styles.customButton} onPress={toggleModal}>
                <Text style={styles.buttonText}>Exit</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>

    </View>
  );
}


 

const styles = StyleSheet.create({
    appContainer: {
      flex: 1,
      padding: 20,
      backgroundColor: '#FFBA02',
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      marginBottom: 40,
      marginTop: 40,
    },
    customButton: {
        margin:3,
      width:200,
      backgroundColor: '#FFBA00', 
      paddingVertical: 5,
      paddingHorizontal: 30,
      borderRadius: 25,
      borderWidth: 1,
    },
    lowerContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      marginBottom: 70, 
    },
    backtocat: {
      backgroundColor: '#FFFFFF', 
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
      marginTop: 10,
      alignItems: 'center',
      margin: 20, 
    },
    backtext:{
      fontSize:17,
      color: 'black',
    },
    welcome:{
      fontSize:35, 
      fontWeight: 'bold',
      marginTop:110,
    },
    select:{
      fontSize:28, 
      fontWeight: 'bold',
      marginBottom : 50,
      marginTop : 50,
    },
    buttonText: {
      color: 'white',
      fontSize: 14,
      textAlign: 'center',
    },
    categoryButton: {
      marginBottom: 15,
      padding: 15,
      backgroundColor: 'white',
      borderRadius: 5,
      height: 55,
      width: 230,
      justifyContent: 'center', 
    },
    categoryButtonText: {
      color: 'black',
      textAlign: 'center',
      fontSize: 20,
    },
    favoritesButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      zIndex: 1,
    },
    jokesView: {
      flex: 1,
    },
    jokeContainer: {
      backgroundColor: '#FF9901',
      padding: 15,
      borderRadius: 20,
      borderWidth: 2,
      marginVertical: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 15,
    },
    jokeText: {
      flex: 1,
      fontSize: 18,
      marginRight: 10,
    },
    favoriteButton: {
      backgroundColor: 'transparent',
    },
    favoriteText: {
      fontSize: 20,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: 30,
      borderRadius: 10,
      width: '80%',
      alignItems: 'center',
      marginBottom: 5,
    },
    backgroundImage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      resizeMode: 'cover',
    },
  });
  

export default App;
