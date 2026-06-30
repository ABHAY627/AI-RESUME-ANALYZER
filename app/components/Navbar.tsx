import { Form, Link } from "react-router";

interface NavbarProps {
    user?: { name?: string | null; email: string } | null;
}

const Navbar = ({ user }: NavbarProps) => {
    const displayName = user?.name ?? user?.email?.split("@")[0] ?? "";
    const initials = displayName.slice(0, 2).toUpperCase();

    return (
        <nav className="navbar shadow-sm border border-white/60 backdrop-blur-md">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
                <p className="text-2xl font-bold text-gradient tracking-tight group-hover:opacity-80 transition-opacity">
                    ResumeXpert
                </p>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {user ? (
                    <>
                        {/* User pill */}
                        <div className="flex items-center gap-2.5 bg-gradient-to-r from-[#c1d3f81a] to-[#a7bff14d] border border-[#a7bff180] rounded-full px-4 py-2">
                            {/* Avatar circle */}
                            <div className="w-7 h-7 rounded-full primary-gradient flex items-center justify-center shrink-0">
                                <span className="text-white text-xs font-bold leading-none">
                                    {initials}
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[140px] truncate">
                                {displayName}
                            </span>
                        </div>

                        {/* Sign out */}
                        <Form method="post" action="/logout">
                            <button
                                type="submit"
                                className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors duration-200 px-3 py-2 rounded-full hover:bg-red-50 cursor-pointer"
                            >
                                Sign out
                            </button>
                        </Form>
                    </>
                ) : (
                    <Link
                        to="/auth"
                        className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors duration-200 border border-gray-200 hover:border-indigo-300 rounded-full px-4 py-2"
                    >
                        Sign In
                    </Link>
                )}

                {/* Upload CTA */}
                <Link
                    to="/upload"
                    className="primary-button w-fit text-sm font-semibold px-5 py-2.5 hover:opacity-90 transition-opacity"
                >
                    Upload Resume
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
