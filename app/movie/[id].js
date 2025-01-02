import { useEffect, useState, useRef } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Image,
    Dimensions,
    FlatList,
    Animated,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { fetchMovieDetails, fetchMovieReviews } from '../../services/api';
import { Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import WebView from 'react-native-webview';
import { AntDesign } from '@expo/vector-icons';
import Loading from "../../shared/components/loading/Loading";

const { width } = Dimensions.get('window');

export default function MovieDetailScreen() {
    const { id } = useLocalSearchParams();
    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewPage, setReviewPage] = useState(1);
    const [hasMoreReviews, setHasMoreReviews] = useState(true);
    const [loading, setLoading] = useState(true);
    const [expandedReviews, setExpandedReviews] = useState({});
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadMovieDetails();
        loadReviews();
    }, []);

    const loadMovieDetails = async () => {
        const data = await fetchMovieDetails(id);
        setMovie(data);
        setLoading(false);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };

    const loadReviews = async (loadMore = false) => {
        if (!hasMoreReviews && loadMore) return;

        const newPage = loadMore ? reviewPage + 1 : 1;
        const data = await fetchMovieReviews(id, newPage);

        setReviews(loadMore ? [...reviews, ...data.results] : data.results);
        setReviewPage(newPage);
        setHasMoreReviews(newPage < data.total_pages);
    };

    const toggleReviewExpansion = (reviewId) => {
        setExpandedReviews(prev => ({
            ...prev,
            [reviewId]: !prev[reviewId]
        }));
    };

    if (loading || !movie) {
        return <Loading />;
    }

    const translateY = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [0, -200],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const trailer = movie.videos.results.find(
        (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );

    const renderReviewItem = ({ item, index }) => {
        const isExpanded = expandedReviews[item.id];
        const reviewContent = isExpanded ? item.content : item.content.slice(0, 150);
        const showExpandButton = item.content.length > 150;

        return (
            <Animated.View
                style={[
                    styles.reviewCard,
                    {
                        opacity: fadeAnim,
                        transform: [{
                            translateX: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [(index % 2 === 0 ? -100 : 100), 0],
                            })
                        }]
                    }
                ]}
            >
                <View style={styles.reviewHeader}>
                    <View style={styles.reviewAuthorContainer}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                                {item.author.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.reviewAuthor}>{item.author}</Text>
                            <Text style={styles.reviewDate}>
                                {new Date(item.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.ratingContainer}>
                        <AntDesign name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>
                            {item.author_details.rating || '-'}/10
                        </Text>
                    </View>
                </View>
                <Text style={styles.reviewContent}>
                    {reviewContent}
                    {!isExpanded && item.content.length > 150 && '...'}
                </Text>
                {showExpandButton && (
                    <TouchableOpacity
                        onPress={() => toggleReviewExpansion(item.id)}
                        style={styles.expandButton}
                    >
                        <Text style={styles.expandButtonText}>
                            {isExpanded ? 'Show less' : 'Read more'}
                        </Text>
                    </TouchableOpacity>
                )}
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                <Animated.View
                    style={[
                        styles.headerContainer,
                        {
                            transform: [{ translateY }],
                            opacity: headerOpacity,
                        },
                    ]}
                >
                    <Image
                        source={{
                            uri: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`,
                        }}
                        style={styles.backdrop}
                    />
                    <LinearGradient
                        colors={['transparent', '#000']}
                        style={styles.gradientOverlay}
                    />
                </Animated.View>

                <View style={styles.content}>
                    <Text style={styles.title}>{movie.title}</Text>
                    <View style={styles.infoRow}>
                        <View style={styles.ratingContainer}>
                            <AntDesign name="star" size={18} color="#FFD700" />
                            <Text style={styles.rating}>{movie.vote_average.toFixed(1)}</Text>
                        </View>
                        <Text style={styles.date}>{movie.release_date.split('-')[0]}</Text>
                    </View>
                    <Text style={styles.overview}>{movie.overview}</Text>

                    {trailer && (
                        <View style={styles.trailerContainer}>
                            <Text style={styles.sectionTitle}>Trailer</Text>
                            <View style={styles.trailerWrapper}>
                                <WebView
                                    style={styles.trailer}
                                    javaScriptEnabled={true}
                                    source={{
                                        uri: `https://www.youtube.com/embed/${trailer.key}`,
                                    }}
                                />
                            </View>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Reviews</Text>
                    <FlatList
                        data={reviews}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderReviewItem}
                        onEndReached={() => loadReviews(true)}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={() =>
                            hasMoreReviews && <Loading />
                        }
                        scrollEnabled={false}
                    />
                </View>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    headerContainer: {
        height: width * 0.5625,
        position: 'relative',
    },
    backdrop: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '50%',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    rating: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 4,
    },
    date: {
        fontSize: 16,
        color: '#888',
    },
    overview: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 24,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    trailerContainer: {
        marginBottom: 24,
    },
    trailerWrapper: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    trailer: {
        width: '100%',
        height: width * 0.5625,
    },
    reviewCard: {
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    reviewAuthorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e50914',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    reviewAuthor: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    reviewDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    ratingText: {
        color: '#fff',
        marginLeft: 4,
    },
    reviewContent: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 20,
    },
    expandButton: {
        marginTop: 8,
    },
    expandButtonText: {
        color: '#e50914',
        fontSize: 14,
        fontWeight: '600',
    },
});

