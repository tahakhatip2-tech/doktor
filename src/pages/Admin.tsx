import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminPanel from "./admin/AdminPanel";

const Admin = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to new admin panel
        navigate("/admin-panel");
    }, [navigate]);

    return <AdminPanel />;
};

export default Admin;
