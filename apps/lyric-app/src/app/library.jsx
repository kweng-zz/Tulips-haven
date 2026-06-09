import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function LibraryScreen() {
    const [songs, setSongs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';


    //Load all songs when screen opens
    useEffect(() => {
        loadAllSongs();
    }, []);


    const loadAllSongs = async () => {
    try {
        const data = await AsyncStorage.getItem('@saved_songs');
        
        if (!data) {
            setSongs([]);
            return;
        }

        const parsedSongs = JSON.parse(data);

        const loadedSongs = parsedSongs.map(song => ({
            ...song,
            lastModified: new Date(song.createdAt || Date.now())
        }));

        loadedSongs.sort((a, b) => b.lastModified - a.lastModified);
        setSongs(loadedSongs);

    } catch (error) {
        console.error('Error loading songs:', error);
        Alert.alert('Error', 'Failed to load your songs');
    }
};

    const saveCurrentDraftAsSong = async () => {
    try {
        const currentLyrics = await AsyncStorage.getItem('current_draft');
        const currentTitle = await AsyncStorage.getItem('current_title');
        const currentGenre = await AsyncStorage.getItem('current_genre');
        const currentMood = await AsyncStorage.getItem('current_mood');

        if (!currentLyrics || currentLyrics.trim().length === 0) {
            Alert.alert('No Lyrics', 'Write something first before saving');
            return;
        }

        const existing = await AsyncStorage.getItem('@saved_songs');
        const songs = existing ? JSON.parse(existing) : [];

        const newSong = {
            id: `${Date.now()}`,
            title: currentTitle || 'Untitled Song',
            lyrics: currentLyrics,
            genre: currentGenre || 'Afro-pop',
            mood: currentMood || 'uplifting',
            createdAt: new Date().toISOString(),
        };

        songs.unshift(newSong);
        await AsyncStorage.setItem('@saved_songs', JSON.stringify(songs));
        Alert.alert('Saved!', 'Your bars are saved! ;)');
        loadAllSongs();

    } catch (error) {
        console.error('Error saving:', error);
        Alert.alert('Error', 'An error occurred, please try again');
    }
};

    const deleteSong = (songId, songTitle) => {
    Alert.alert(
        'Delete Song',
        `Are you sure you wanna delete "${songTitle}"?`,
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const data = await AsyncStorage.getItem('@saved_songs');
                        const savedSongs = JSON.parse(data);
                        const updated = savedSongs.filter(s => s.id !== songId);
                        await AsyncStorage.setItem('@saved_songs', JSON.stringify(updated));
                        
                        // Update state directly — no need to reload from storage
                        setSongs(prev => prev.filter(s => s.id !== songId));
                        
                        Alert.alert('Deleted', 'Song has been removed');
                    } catch (error) {
                        console.error('Error deleting:', error);
                        Alert.alert('Error', 'There was an error deleting, try again later');
                    }
                }
            }
        ]
    );
};

    const debugStorage = async () => {
    const allKeys = await AsyncStorage.getAllKeys();

    if (allKeys.length === 0) {
        Alert.alert('Storage Empty', 'Nothing stored yet');
        return;
    }

    const results = [];
    for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        results.push(`${key}: ${value}`);
    }

    console.log('ALL STORAGE:', results.join('\n'));
    Alert.alert('Keys found', allKeys.join('\n'));
};


    const loadSongToEditor = async (song) => {
        // Save to current draft
        await AsyncStorage.setItem('current_draft', song.lyrics);
        await AsyncStorage.setItem('current_title', song.title);
        await AsyncStorage.setItem('current_genre', song.genre);
        await AsyncStorage.setItem('current_mood', song.mood);

        Alert.alert('Loaded', `"${song.title}" is now in your editor`);
    };

    const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.lyrics.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const dynamicStyles = {
        container: {
            backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
        },
        searchInput: {
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderColor: isDarkMode ? '#333333' : '#ddd',
        },
        songCard: {
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
        },
        songTitle: {
            color: isDarkMode ? '#ffffff' : '#000000',
        },
        songPreview: {
            color: isDarkMode ? '#aaaaaa' : '#666666',
        },
        songMeta: {
            color: isDarkMode ? '#888888' : '#999999',
        },
        emptyText: {
            color: isDarkMode ? '#888888' : '#999999',
        },
    };

    return (
        <ScrollView style={[styles.container, dynamicStyles.container]}>
            <View style={styles.header}>
                <TextInput
                    style={[styles.searchInput, dynamicStyles.searchInput]}
                    placeholder="Search songs..."
                    placeholderTextColor={isDarkMode ? '#8888' : '#9999'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    />

                   <TouchableOpacity 
                        style={styles.saveCurrentButton}
                        onPress={saveCurrentDraftAsSong}>
                            <Text style={styles.saveCurrentButtonText}>
                                Save Current Draft as Song
                            </Text>
                    </TouchableOpacity>
                   {/* <TouchableOpacity onPress={debugStorage} style={{ padding: 10,
                        backgroundColor: 'red'
                    }}>
                        <Text style={{ color: '#fff' }}>DEBUG: Check Storage</Text>
                    </TouchableOpacity> */}
            </View>

            {filteredSongs.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
                        {songs.length === 0 
                            ? 'No songs yet. Write some bars!'
                            : 'No matching songs found'
                        }
                    </Text>
                </View>
            ): (
                filteredSongs.map((song) => (
                    <View 
                        key={song.id}
                        style={[styles.songCard, dynamicStyles.songCard]}>

                            <View 
                                style={styles.songInfo}>
                                    <Text style={[styles.songTitle, dynamicStyles.songTitle]}>
                                        {song.title}
                                    </Text>
                                    <Text style={[styles.songPreview, dynamicStyles.songPreview]} numberOfLines={2}>
                                        {song.lyrics.substring(0, 100)}...
                                    </Text>

                            <View 
                                style={styles.songMetaRow}>
                                    <Text style={[styles.songMeta, dynamicStyles.songMeta]}>
                                        {song.genre} • {song.mood} 
                                    </Text>
                                    <Text style={[styles.songMeta, dynamicStyles.songMeta]}>
                                        {new Date(song.lastModified).toLocaleDateString()}
                                    </Text>
                                    
                                </View>
                            </View>

                            <View 
                                style={styles.songActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.loadButton]}
                                        onPress={() => loadSongToEditor(song)}
                                    >
                                        <Text style={styles.actionButtonText}>
                                            Load
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.deleteButton]}
                                        onPress={() => deleteSong(song.id, song.title)}
                                    >
                                        <Text style={styles.actionButtonText}>
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                    </View>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    searchInput: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
        marginBottom: 12,
    },
    saveCurrentButton: {
        backgroundColor: '#6200ee',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveCurrentButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    songCard: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    songInfo: {
        marginBottom: 12,
    },
    songTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    songPreview: {
        fontSize: 14,
        marginBottom: 6,
        lineHeight: 20,
    },
    songMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    songMeta: {
        fontSize: 12,
    },
    songActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        minWidth: 70,
        alignItems: 'center',
    },
    loadButton: {
        backgroundColor: '#03dac6',
    },
    deleteButton: {
        backgroundColor: '#ff6b6b',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});