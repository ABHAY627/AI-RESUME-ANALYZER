import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/auth", "routes/auth.tsx"),
    route("/logout", "routes/logout.tsx"),
    route("/upload" , "routes/upload.tsx"),
    route("/resume/:id" , "routes/resume.tsx"),
    route("/resume/:id/pdf", "routes/resume-pdf.tsx"),
    route("/wipe" , "routes/wipe.tsx"),
] satisfies RouteConfig;
