import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ENDPOINTS} from "../../constants/endpoints";

const useMotorcycle = () => {

    return useQuery({
        queryKey: ["getMovies"],
        queryFn: async () => {
            try {
                const response = await axios.get(ENDPOINTS.MOVIES,{
                    params: {
                        api_key: '3dd6e0992ace23cd935958c6d3750eee',
                    }
                });
                return response.data;
            } catch (error) {
                throw new Error(error);
            }
        }
    });
}

export default useMotorcycle;