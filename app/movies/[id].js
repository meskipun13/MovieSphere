import { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, Image, Animated } from 'react-native';
import {Link, useLocalSearchParams} from 'expo-router';
import { fetchMoviesByGenre } from '../../services/api';
import { Text, TouchableOpacity } from 'react-native';
import Loading from "../../shared/components/loading/Loading";

export default function MoviesScreen() {
    const { id, name } = useLocalSearchParams();
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadMovies();
    }, []);

    const loadMovies = async (loadMore = false) => {
        if (!hasMore && loadMore) return;

        const newPage = loadMore ? page + 1 : 1;
        const data = await fetchMoviesByGenre(id, newPage);

        setMovies(loadMore ? [...movies, ...data.results] : data.results);
        setPage(newPage);
        setHasMore(newPage < data.total_pages);

        if (!loadMore) {
            setLoading(false);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <FlatList
                data={movies}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                renderItem={({ item, index }) => (
                    <Animated.View
                        style={[
                            styles.movieCardContainer,
                            {
                                transform: [
                                    {
                                        translateY: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [50 * (index % 4), 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <Link
                            href={{
                                pathname: '/movie/[id]',
                                params: { id: item.id },
                            }}
                            asChild
                        >
                            <TouchableOpacity style={styles.movieCard}>
                                <Image
                                    source={{
                                        uri: `https://image.tmdb.org/t/p/w342${item.poster_path}`,
                                    }}
                                    style={styles.poster}
                                />
                                <View style={styles.overlay}>
                                    <Text style={styles.title} numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.rating}>⭐ {item.vote_average.toFixed(1)}</Text>
                                </View>
                            </TouchableOpacity>
                        </Link>
                    </Animated.View>
                )}
                contentContainerStyle={styles.list}
                onEndReached={() => loadMovies(true)}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() =>
                    hasMore && <Loading />
                }
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 8,
    },
    movieCardContainer: {
        flex: 1,
        padding: 8,
    },
    movieCard: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        backgroundColor: '#fff',
    },
    poster: {
        width: '100%',
        height: 250,
        resizeMode: 'cover',
    },
    overlay: {
        padding: 12,
        backgroundColor: 'rgba(3, 37, 65, 0.9)',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    rating: {
        fontSize: 12,
        color: '#01b4e4',
    },
});

