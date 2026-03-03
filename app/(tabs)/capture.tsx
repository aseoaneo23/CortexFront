/*
 * SPDX-FileCopyrightText: 2026 Antonio Seoane De Ois
 *
 * SPDX-License-Identifier: MIT
 */


import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { fetchAPI } from '../../constants/api';

export default function CaptureScreen() {
    const router = useRouter();
    const [type, setType] = useState('TEXT');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsSubmitting(true);
        try {
            await fetchAPI('/inbox', {
                method: 'POST',
                body: JSON.stringify({ type: type === 'IMG' ? 'image' : type.toLowerCase(), rawContent: content })
            });
            setContent('');
            setSuccessMessage('✓ Captured');
            setTimeout(() => {
                setSuccessMessage('');
                router.replace('/(tabs)/home');
            }, 800);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            base64: true,
            quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setType('IMG');
            setContent(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.captureBox}>
                <Text style={styles.mainTitle}>Capture</Text>

                <View style={styles.inputContainer}>
                    {type === 'IMG' && content?.startsWith('data:image') ? (
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => setContent('')}>
                            <Image source={{ uri: content }} style={{ flex: 1, borderRadius: 10, resizeMode: 'cover' }} />
                            <Text style={{ position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: 5, borderRadius: 5 }}>Tap to clear</Text>
                        </TouchableOpacity>
                    ) : (
                        <TextInput
                            multiline
                            placeholder="Type anything — an idea, a URL, an image..."
                            style={styles.input}
                            placeholderTextColor="#AAA"
                            value={content}
                            onChangeText={setContent}
                        />
                    )}
                </View>

                <View style={styles.selectorRow}>
                    {['TEXT', 'URL', 'IMG'].map((item) => (
                        <TouchableOpacity
                            key={item}
                            onPress={() => {
                                if (item === 'IMG') {
                                    pickImage();
                                } else {
                                    setType(item);
                                }
                            }}
                            style={[styles.typeBtn, type === item && styles.typeBtnActive]}
                        >
                            <Text style={[styles.typeText, type === item && styles.typeTextActive]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Text style={styles.submitText}>...</Text>
                    ) : successMessage ? (
                        <Text style={[styles.submitText, { color: 'green' }]}>{successMessage}</Text>
                    ) : (
                        <Text style={styles.submitText}>Capture →</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF', justifyContent: 'center', padding: 25 },
    captureBox: { backgroundColor: '#F9F9F9', borderRadius: 40, padding: 30, borderWidth: 1, borderColor: '#EEE' },
    mainTitle: { fontSize: 32, marginBottom: 20, color: '#444' },
    inputContainer: { height: 120, backgroundColor: '#FFF', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#DDD' },
    input: { fontSize: 16, color: '#333', textAlignVertical: 'top' },
    selectorRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 25 },
    typeBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#DDD' },
    typeBtnActive: { backgroundColor: '#000', borderColor: '#000' },
    typeText: { fontWeight: 'bold', color: '#888' },
    typeTextActive: { color: '#FFF' },
    submitBtn: { alignSelf: 'center' },
    submitText: { fontSize: 20, color: '#444', fontWeight: '500' }
});
