import { createContext , useState , useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({children})=>
{

    const [user,setUser] = useState(()=>
    {
     const storedUser = localStorage.getItem("pos-user");
    return storedUser ? JSON.parse(storedUser):null;
    });

    const login = (userdata,token)=>
    {
       setUser(userdata)
       localStorage.setItem("pos-user",JSON.stringify(userdata));
       localStorage.setItem("pos-token",token);
    }

    const logout = (userdata,token)=>
    {
        setUser(null);
        localStorage.removeItem("pos-user")
        localStorage.removeItem("pos-token")
    }
    return (
    <AuthContext.Provider value={{user,login,logout}}>
           {children}
    </AuthContext.Provider>);
}

export const useAuth = () => {
  return useContext(AuthContext);
};
export default AuthProvider;
