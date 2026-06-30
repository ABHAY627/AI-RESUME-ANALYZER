import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
    const { auth, isLoading } = usePuterStore();

    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">
                    ResumeXpert
                </p>
            </Link>

            <div className="flex items-center gap-4">
                {!isLoading && (
                    auth.isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 hidden sm:block">
                                {auth.user?.username}
                            </span>
                            <button
                                onClick={auth.signOut}
                                className="text-sm text-gray-500 hover:text-red-500 transition-colors duration-200 border border-gray-200 rounded-full px-4 py-2"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/auth?next=/"
                            className="text-sm text-gray-500 hover:text-gray-800 transition-colors duration-200 border border-gray-200 rounded-full px-4 py-2"
                        >
                            Sign In
                        </Link>
                    )
                )}
                <Link to="/upload" className="primary-button w-fit">
                    Upload Resume
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
