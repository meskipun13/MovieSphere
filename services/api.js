import {API_KEY, BASE_URL} from "../constants/endpoints";

export const fetchGenres = async () => {
    try {
        const response = await fetch(
            `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
        );
        const data = await response.json();
        return data.genres;
    } catch (error) {
        console.error('Error fetching genres:', error);
        return [];
    }
};

export const fetchMoviesByGenre = async (genreId, page = 1) => {
    try {
        const response = await fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie:', error);
        return { results: [], total_pages: 0 };
    }
};

export const fetchMovieDetails = async (movieId) => {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,reviews`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
};

export const fetchMovieReviews = async (movieId, page = 1) => {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/${movieId}/reviews?api_key=${API_KEY}&page=${page}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie reviews:', error);
        return { results: [], total_pages: 0 };
    }
};



