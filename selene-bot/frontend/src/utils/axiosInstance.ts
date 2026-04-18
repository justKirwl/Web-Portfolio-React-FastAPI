import axios from "axios";

const secureInstance = axios.create();

secureInstance.interceptors.request.use(async (config) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-csrf-token`, {withCredentials: true, validateStatus: status => status === 200 || status === 401})

        if (res.status === 200) {
            config.headers.set('X-CSRFToken', res.data.csrf_token)   
        }

        return config
    }
    catch (err) {
        console.error(err)
        return config
    }
})

export { secureInstance }