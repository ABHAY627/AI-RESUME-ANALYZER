import { Form, Link } from "react-router";

interface NavbarProps {
  user?: { name?: string | null; email: string } | null;
}

const Navbar = ({ user }: NavbarProps) => {
  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">ResumeXpert</p>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {user.name ?? user.email}
            </span>
            <Form method="post" action="/logout">
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-red-500 transition-colors duration-200 border border-gray-200 rounded-full px-4 py-2"
              >
                Sign Out
              </button>
            </Form>
          </div>
        ) : (
          <Link
            to="/auth"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors duration-200 border border-gray-200 rounded-full px-4 py-2"
          >
            Sign In
          </Link>
        )}
        <Link to="/upload" className="primary-button w-fit">
          Upload Resume
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
