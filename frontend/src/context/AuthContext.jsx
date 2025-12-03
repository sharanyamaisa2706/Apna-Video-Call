import axios from "axios";
import { Children, useState, useContext } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment.js";

export const AuthContext = createContext({})

const httpStatus = {
    CREATED: 201,
    OK: 200
};

const client = axios.create({
    baseURL: `${server}/api/v1/users`
});

export const AuthProvider = ({ children }) => {

    const authContext = useContext(AuthContext);

    const [userData, setUseraData] = useState(authContext);

    const handleRegister = async (name, username, password) => {
        try {
            // Validate all statuses so Axios does not throw error in console
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            }, { validateStatus: () => true });

            if (request.status === httpStatus.CREATED) {
                return request.data.message; // "User Registered"
            } else {
                // Handle 409 Conflict or other backend messages gracefully
                return request.data.message || "Something went wrong";
            }

        } catch (err) {
            return "Something went wrong";
        }
    }

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            }, { validateStatus: () => true });

            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
                return "Login successful";
            } else {
                return request.data.message || "Invalid credentials";
            }

        } catch (err) {
            return "Something went wrong";
        }
    }

   const getHistoryOfUser = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        let request = await client.get("/get_all_activity", {
            params: { token }  
        });

        return request.data; 
    } catch (err) {
        console.error("Error fetching history:", err);
        throw err;
    }
};


   const addToUserHistory = async(meetingCode) => {
    try {
        let request = await client.post("/add_to_activity", {
            token: localStorage.getItem("token"),
            meeting_code: meetingCode
        });
        return request.status;
    } catch(e) {
        throw e;
    }
    }

    const router = useNavigate();

    const data = {
        userData,
        setUseraData,
        handleRegister,
        handleLogin,
        getHistoryOfUser,
        addToUserHistory
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}
