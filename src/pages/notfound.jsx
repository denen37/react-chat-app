import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
            <Link to="/" className="text-blue-500">Go Home</Link>
        </div>
    );
}
