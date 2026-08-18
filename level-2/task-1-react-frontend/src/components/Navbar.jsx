import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar">

            <div className="navbar-container">

                <h2>Codveda Users</h2>

                <div className="nav-links">

                    <Link to="/">
                        Home
                    </Link>

                    <Link to="/users">
                        Users
                    </Link>

                </div>

            </div>

        </nav>
    );
}

export default Navbar;