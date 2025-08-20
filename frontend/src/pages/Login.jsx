// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useAppContext } from "../context/AppContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// function Login() {
//   const [loginInfo, setLoginInfo] = useState({
//     email: "",
//     password: "",
//     role: "User",
//   });
//   const [loading, setLoading] = useState(false);
//   const { setUser } = useAppContext();
//   const navigate = useNavigate();

//   const handleChange = (e) =>
//     setLoginInfo((prev) => ({...prev, [e.target.name]: e.target.value }));

//   const validateForm = () => {
//     if (!loginInfo.email || !loginInfo.password) {
//       toast.error("Please enter both email and password.");
//       return false;
//     }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInfo.email)) {
//       toast.error("Please enter a valid email address.");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     try {
//       setLoading(true);
//       const response = await axios.post(
//         "https://voyagerserver.onrender.com/api/users/login",
//         loginInfo,
//         {
//           headers: { "Content-Type": "application/json" },
//           withCredentials: true,
//           timeout: 5000,
//         }
//       );
//       const { token, user } = response.data;

//       if (!token || !user) {
//         throw new Error("Authentication failed, missing token or user data.");
//       }

//       // Save user data
//       localStorage.setItem("authToken", token);
//       localStorage.setItem("userRole", user.role);
//       localStorage.setItem("userEmail", user.email);
//       localStorage.setItem("userName", user.name);

//       // Update Context
//       setUser({ token, role: user.role, email: user.email, name: user.name });
//       toast.success("Login Successful!");

//       // Role-based navigation
//       if (user.role === "Owner") {
//         navigate("/hotelApp");
//       } else if (user.role === "Vendor") {
//         navigate("/vendorApp");
//       } else {
//         navigate("/"); // Default for regular user
//       }
//     } catch (error) {
//       let errorMessage = "Login failed. Please try again.";
//       if (error.response) {
//         errorMessage =
//           error.response.data?.message ||
//           `Server error (${error.response.status})`;
//         if (error.response.status === 401)
//           errorMessage = "Invalid email or password.";
//         if (error.response.status === 403)
//           errorMessage = "You don't have permission.";
//       } else if (error.code === "ECONNABORTED") {
//         errorMessage = "Request timed out. Please try again.";
//       } else if (error.message.includes("Network Error")) {
//         errorMessage = "Network error. Please check your connection.";
//       }
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-800">
//       <div className="bg-gray-300 shadow-lg rounded-lg p-8 w-96 text-center">
//         <h2 className="text-3xl font-bold text-gray-800 mb-2">Voyager</h2>
//         <h3 className="text-lg font-semibold mb-4">Login</h3>
//         <form onSubmit={handleSubmit}>
//           {/* Role Selection */}
//           <div className="mb-3 text-left">
//             <label
//               htmlFor="role"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Login as:
//             </label>
//             <select
//               name="role"
//               id="role"
//               value={loginInfo.role}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-gray-800"
//               disabled={loading}
//             >
//               <option value="User">User</option>
//               <option value="Owner">Owner</option>
//               <option value="Vendor">Vendor</option>
//             </select>
//           </div>

//           <input
//             type="email"
//             name="email"
//             value={loginInfo.email}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-gray-500"
//             placeholder="Email Address"
//             required
//             disabled={loading}
//           />

//           <input
//             type="password"
//             name="password"
//             value={loginInfo.password}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
//             placeholder="Password"
//             required
//             disabled={loading}
//           />

//           <button
//             type="submit"
//             className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
//             disabled={loading}
//           >
//             {loading ? "Signing In..." : "Login"}
//           </button>

//           <p className="text-gray-600 text-sm mt-3">
//             Don’t have an account?{" "}
//             <Link
//               to="/register"
//               className="text-blue-500 font-medium hover:underline"
//             >
//               Sign Up
//             </Link>
//           </p>
//         </form>
//       </div>

//       <ToastContainer />
//     </div>
//   );
// }

// export default Login;


import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../context/AppContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // import styles

// Optional: customize progress bar look
NProgress.configure({ showSpinner: false, speed: 500 });

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
    role: "User",
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppContext();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setLoginInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateForm = () => {
    if (!loginInfo.email || !loginInfo.password) {
      toast.error("Please enter both email and password.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInfo.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      NProgress.start(); // start top progress bar

      const response = await axios.post(
        "https://voyagerserver.onrender.com/api/users/login",
        loginInfo,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: 15000, // increased timeout
        }
      );

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Authentication failed, missing token or user data.");
      }

      // Save user data
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name);

      // Update Context
      setUser({ token, role: user.role, email: user.email, name: user.name });
      toast.success("Login Successful!");

      // Role-based navigation
      if (user.role === "Owner") {
        navigate("/hotelApp");
      } else if (user.role === "Vendor") {
        navigate("/vendorApp");
      } else {
        navigate("/");
      }
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error (${error.response.status})`;
        if (error.response.status === 401)
          errorMessage = "Invalid email or password.";
        if (error.response.status === 403)
          errorMessage = "You don't have permission.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      NProgress.done(); // stop top progress bar
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-800">
      <div className="bg-gray-300 shadow-lg rounded-lg p-8 w-96 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Voyager</h2>
        <h3 className="text-lg font-semibold mb-4">Login</h3>
        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="mb-3 text-left">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Login as:
            </label>
            <select
              name="role"
              id="role"
              value={loginInfo.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-gray-800"
              disabled={loading}
            >
              <option value="User">User</option>
              <option value="Owner">Owner</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>

          <input
            type="email"
            name="email"
            value={loginInfo.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="Email Address"
            required
            disabled={loading}
          />

          <input
            type="password"
            name="password"
            value={loginInfo.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="Password"
            required
            disabled={loading}
          />

          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing In...
              </div>
            ) : (
              "Login"
            )}
          </button>

          <p className="text-gray-600 text-sm mt-3">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-500 font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Login;
