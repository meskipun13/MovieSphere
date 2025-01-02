import { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { fetchGenres } from '../services/api';
import { Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Loading from "../shared/components/loading/Loading";
import {genreImages} from "../constants/constants";

const { width } = Dimensions.get('window');

export default function GenresScreen() {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadGenres();
    }, []);

    const loadGenres = async () => {
        const genresList = await fetchGenres();
        setGenres(genresList);
        setLoading(false);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };

    if (loading) {
        return <Loading />;
    }

    const renderGenreItem = ({ item, index }) => {
        const translateY = scrollY.interpolate({
            inputRange: [(index - 1) * 200, index * 200],
            outputRange: [0, -50],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View
                style={[
                    styles.genreItemContainer,
                    {
                        transform: [{ translateY }],
                        opacity: fadeAnim,
                    },
                ]}
            >
                <Link
                    href={{
                        pathname: '/movies/[id]',
                        params: { id: item.id, name: item.name },
                    }}
                    asChild
                >
                    <TouchableOpacity style={styles.genreCard}>
                        <Image
                            source={{
                                uri: genreImages[item.name] || 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
                            }}
                            style={styles.genreImage}
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
                            style={styles.gradient}
                        >
                            <View style={styles.genreContent}>
                                <Text style={styles.genreTitle}>{item.name}</Text>
                                <View style={styles.playButton}>
                                    <Text style={styles.playButtonText}>Explore</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </Link>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000', '#141414']}
                style={StyleSheet.absoluteFill}
            />
            <Animated.FlatList
                data={genres}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderGenreItem}
                contentContainerStyle={styles.list}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    list: {
        padding: 16,
        paddingTop: 8,
    },
    genreItemContainer: {
        marginBottom: 16,
    },
    genreCard: {
        height: 180,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#2a2a2a',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    genreImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        justifyContent: 'flex-end',
        padding: 16,
    },
    genreContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    genreTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    playButton: {
        backgroundColor: '#e50914',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
    },
    playButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

