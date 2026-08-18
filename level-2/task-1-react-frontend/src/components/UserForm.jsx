import { useState } from "react";

function UserForm({ onUserCreated }) {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        if (!name || !email || !age) {
            setError("All fields are required");
            return;
        }

        try {

            setLoading(true);

            await onUserCreated({
                name,
                email,
                age: Number(age),
            });

            setName("");
            setEmail("");
            setAge("");

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="form-card">

            <h2>Add User</h2>

            <form onSubmit={handleSubmit}>

                <div className="form-group">

                    <label>Name</label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
                    />

                </div>


                <div className="form-group">

                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                    />

                </div>


                <div className="form-group">

                    <label>Age</label>

                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Enter age"
                    />

                </div>


                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}


                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add User"}
                </button>

            </form>

        </div>
    );
}

export default UserForm;