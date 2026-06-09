import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLyricSuggestion, getInstrumentRecommendations } from '../../services/api';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';

const LIBRARY_KEY = '@saved_songs';

export default function HomeScreen() {
    const { song } = useLocalSearchParams();
    const [lyrics, setLyrics] = useState('');
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('Afro-pop');
    const [mood, setMood] = useState('uplifting');
    const [loading, setLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedSuggestion, setEditedSuggestion] = useState('');
    const [draftSaved, setDraftSaved] = useState(false);
    const [lineCount, setLineCount] = useState(0);

    useEffect(() => {
        const count = lyrics.split('\n').filter(l => l.trim().length > 0).length;
        setLineCount(count);
    }, [lyrics]);

    const loadDraft = async () => {
        try {
            const savedLyrics = await AsyncStorage.getItem('current_draft');
            const savedTitle = await AsyncStorage.getItem('current_title');
            const savedGenre = await AsyncStorage.getItem('current_genre');
            const savedMood = await AsyncStorage.getItem('current_mood');

            if (savedLyrics) setLyrics(savedLyrics);
            if (savedTitle) setTitle(savedTitle);
            if (savedGenre) setGenre(savedGenre);
            if (savedMood) setMood(savedMood);
        } catch (e) {
            console.error('Failed to load draft:', e);
        }
    };

    useEffect(() => {
        if (song) {
            try {
                const songData = JSON.parse(decodeURIComponent(song));
                setTitle(songData.title || '');
                setLyrics(songData.lyrics || '');
                setGenre(songData.genre || 'Afro-pop');
                setMood(songData.mood || 'uplifting');
            } catch (e) {
                console.error('Failed to parse song param:', e);
            }
        } else {
            loadDraft();
        }
    }, [song]);

    useFocusEffect(
        useCallback(() => {
            if (!song) loadDraft();
        }, [])
    );

    const saveDraft = async () => {
        try {
            await AsyncStorage.setItem('current_draft', lyrics);
            await AsyncStorage.setItem('current_title', title);
            await AsyncStorage.setItem('current_genre', genre);
            await AsyncStorage.setItem('current_mood', mood);
            setDraftSaved(true);
            setTimeout(() => setDraftSaved(false), 2000);
        } catch (error) {
            Alert.alert('Error', 'Failed to save draft');
        }
    };

    const saveToLibrary = async () => {
        if (!title.trim() || !lyrics.trim()) {
            Alert.alert('Missing info', 'Both a title and lyrics are needed to save');
            return;
        }

        try {
            const libraryData = await AsyncStorage.getItem(LIBRARY_KEY);
            const library = libraryData ? JSON.parse(libraryData) : [];

            const newSong = {
                id: Date.now().toString(),
                title,
                lyrics,
                genre,
                mood,
                createdAt: new Date().toISOString(),
            };

            library.unshift(newSong);
            await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
            Alert.alert('Saved!', `"${title}" added to your library 🎵`);
        } catch (error) {
            Alert.alert('Error', 'Failed to save song');
        }
    };

    const handleSuggestion = async () => {
        if (!lyrics.trim()) {
            Alert.alert('Need lyrics', 'Write something first!');
            return;
        }

        setLoading(true);
        const result = await getLyricSuggestion(lyrics, genre, mood, 'line');
        setLoading(false);

        if (result.success) {
            Alert.alert(
                'AI Suggestion',
                result.suggestion,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Add to Lyrics',
                        onPress: () => setLyrics(prev => prev + '\n' + result.suggestion),
                    },
                    {
                        text: 'Edit',
                        onPress: () => {
                            setEditedSuggestion(result.suggestion);
                            setEditModalVisible(true);
                        },
                    },
                ]
            );
        } else {
            Alert.alert('Oops!', 'Our assistant is taking a little break, try again later 🎵');
        }
    };

    const handleGetRecommendations = async () => {
        if (!lyrics.trim() && !genre && !mood) {
            Alert.alert('Need info!', 'Add some lyrics or specify genre/mood first');
            return;
        }

        setLoading(true);
        const result = await getInstrumentRecommendations(genre, mood, lyrics);
        setLoading(false);

        Alert.alert(
            'Music Recommendations',
            `Key: ${result.key}\n\nInstruments:\n${result.instruments?.join('\n') || 'Not available'}`
        );
    };

    const handleNewSong = () => {
        if (lyrics.trim() || title.trim()) {
            Alert.alert(
                'Start new song?',
                'Your current draft will be saved before starting fresh',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Save & New',
                        onPress: async () => {
                            await saveDraft();
                            setTitle('');
                            setLyrics('');
                            setGenre('');
                            setMood('');
                        },
                    },
                ]
            );
        } else {
            setTitle('');
            setLyrics('');
            setGenre('');
            setMood('');
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.screenLabel}>Lyric studio</Text>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Untitled song"
                        placeholderTextColor="#444"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <View style={styles.tagRow}>
                        <TextInput
                            style={styles.tagInput}
                            value={genre}
                            onChangeText={setGenre}
                            placeholder="genre"
                            placeholderTextColor="#555"
                        />
                        <TextInput
                            style={styles.tagInput}
                            value={mood}
                            onChangeText={setMood}
                            placeholder="mood"
                            placeholderTextColor="#555"
                        />
                    </View>
                </View>

                {/* Lyrics area */}
                <View style={styles.lyricsContainer}>
                    <TextInput
                        style={styles.lyricsInput}
                        multiline
                        placeholder={'Write your lyrics here...\n\nLet the bars flow 🎤'}
                        placeholderTextColor="#3a3a3a"
                        value={lyrics}
                        onChangeText={setLyrics}
                        textAlignVertical="top"
                    />
                    <View style={styles.lyricsFooter}>
                        <Text style={styles.lyricsFooterText}>
                            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
                        </Text>
                        <Text style={styles.lyricsFooterText}>
                            {draftSaved ? '✓ draft saved' : ''}
                        </Text>
                    </View>
                </View>

                {/* Primary AI button */}
                <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                    onPress={handleSuggestion}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.primaryButtonText}>✦  Suggest next line</Text>
                    )}
                </TouchableOpacity>

                {/* Secondary buttons */}
                <View style={styles.secondaryRow}>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleGetRecommendations}
                        disabled={loading}
                    >
                        <Text style={styles.secondaryButtonText}>♪  Get recs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={saveDraft}
                    >
                        <Text style={styles.secondaryButtonText}>↓  Save draft</Text>
                    </TouchableOpacity>
                </View>

                {/* Save to library */}
                <TouchableOpacity
                    style={styles.outlineButton}
                    onPress={saveToLibrary}
                >
                    <Text style={styles.outlineButtonText}>Save to library</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Edit suggestion modal */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Edit suggestion</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={editedSuggestion}
                            onChangeText={setEditedSuggestion}
                            multiline
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                style={styles.modalBtnCancel}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (editedSuggestion.trim()) {
                                        setLyrics(prev => prev + '\n' + editedSuggestion.trim());
                                    }
                                    setEditModalVisible(false);
                                }}
                                style={styles.modalBtnAdd}
                            >
                                <Text style={styles.modalAddText}>Add to lyrics</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity
                style={styles.fab}
                onPress={handleNewSong}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#121212',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },

    // Header
    header: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#2a2a2a',
    },
    screenLabel: {
        fontSize: 11,
        color: '#555',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    titleInput: {
        fontSize: 28,
        fontWeight: '500',
        color: '#ffffff',
        padding: 0,
        marginBottom: 14,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
    },
    tagInput: {
        backgroundColor: '#1e1e1e',
        color: '#aaa',
        fontSize: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#333',
        minWidth: 70,
    },

    // Lyrics
    lyricsContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: '#2a2a2a',
        marginBottom: 16,
        overflow: 'hidden',
    },
    lyricsInput: {
        fontSize: 15,
        color: '#e0e0e0',
        padding: 16,
        minHeight: 280,
        textAlignVertical: 'top',
        fontFamily: 'monospace',
        lineHeight: 26,
    },
    lyricsFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 0.5,
        borderTopColor: '#2a2a2a',
    },
    lyricsFooterText: {
        fontSize: 11,
        color: '#444',
    },

    // Primary button
    primaryButton: {
        backgroundColor: '#7C3AED',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    primaryButtonDisabled: {
        backgroundColor: '#4a2a8a',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },

    // Secondary buttons
    secondaryRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        borderWidth: 0.5,
        borderColor: '#333',
        borderRadius: 10,
        padding: 13,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#ccc',
        fontSize: 13,
    },

    // Outline button
    outlineButton: {
        borderWidth: 0.5,
        borderColor: '#7C3AED',
        borderRadius: 10,
        padding: 13,
        alignItems: 'center',
    },
    outlineButtonText: {
        color: '#a78bfa',
        fontSize: 13,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalBox: {
        backgroundColor: '#1e1e1e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        gap: 14,
        borderTopWidth: 0.5,
        borderColor: '#333',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    modalInput: {
        borderWidth: 0.5,
        borderColor: '#333',
        borderRadius: 8,
        padding: 12,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 14,
        color: '#e0e0e0',
        backgroundColor: '#2a2a2a',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    modalBtnCancel: {
        padding: 10,
    },
    modalCancelText: {
        color: '#888',
        fontSize: 14,
    },
    modalBtnAdd: {
        backgroundColor: '#7C3AED',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 8,
    },
    modalAddText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 50,
        height: 50,
        borderRadius: 28,
        backgroundColor: '#7c4aed',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#7c4aed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    fabIcon: {
        color: '#fff',
        fontSize: 28,
        lineHeight: 32,
        fontWeight: '300',
    }
});