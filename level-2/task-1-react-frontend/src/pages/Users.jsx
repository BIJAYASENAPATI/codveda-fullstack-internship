import { useEffect, useState } from "react";

import UserForm from "../components/UserForm";
import UserList from "../components/UserList";
import Loading from "../components/Loading";

import {
    getUsers,
    createUser,
    deleteUser,
} from "../services/userService";


function Users() {

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    const fetchUsers = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getUsers();

            setUsers(data);

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchUsers();

    }, []);


    const handleCreateUser = async (userData) => {

        const newUser = await createUser(userData);

        setUsers((previousUsers) => [
            ...previousUsers,
            newUser,
        ]);

    };


    const handleDeleteUser = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmed) {
            return;
        }


        try {

            await deleteUser(id);

            setUsers((previousUsers) =>
                previousUsers.filter(
                    (user) => user.id !== id
                )
            );

        } catch (error) {

            setError(error.message);

        }
    };


    return (
        <div>

            <h1 className="page-title">
                User Management
            </h1>


            <UserForm
                onUserCreated={handleCreateUser}
            />


            {loading && <Loading />}


            {error && (
                <div className="error-box">
                    {error}
                </div>
            )}


            {!loading && !error && (
                <UserList
                    users={users}
                    onDelete={handleDeleteUser}
                />
            )}

        </div>
    );
}

export default Users;