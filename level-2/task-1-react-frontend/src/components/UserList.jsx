function UserList({ users, onDelete }) {

    if (users.length === 0) {

        return (
            <div className="empty">
                No users found.
            </div>
        );

    }


    return (
        <div className="user-list">

            <h2>Users</h2>

            <div className="table-container">

                <table>

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Age</th>
                            <th>Action</th>
                        </tr>

                    </thead>


                    <tbody>

                        {users.map((user) => (

                            <tr key={user.id}>

                                <td>{user.id}</td>

                                <td>{user.name}</td>

                                <td>{user.email}</td>

                                <td>{user.age}</td>

                                <td>

                                    <button
                                        className="delete-button"
                                        onClick={() => onDelete(user.id)}
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default UserList;