import type { Route } from "./+types/home";
import Navbar from '../components/Navbar';
import ResumeCard from "~/components/ResumeCard";
import { resumes } from "../../constants";
import {usePuterStore} from "~/lib/puter";
import {Link, useLocation, useNavigate} from "react-router";
import {useEffect} from "react";
import {Button} from "@mui/material";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeXpert" },
    { name: "description", content: "Smartest feedback to land your dream job !" },
  ];
}

export default function Home() {
    const {auth}=usePuterStore();
    const navigate=useNavigate();

    useEffect(()=>{
        if(!auth.isAuthenticated) navigate("/auth?next=/");
    },[auth.isAuthenticated])

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">

      <Navbar/>

    <section className="main-section">
        <div className="page-heading py-16">
            <h1>
                Track Your Applications & Resume Ratings
            </h1>
            <h2>Review your submissions and check AI-powered feedback.</h2>
        </div>

      {resumes.length > 0 && (
          <div className="resumes-section">
              {resumes.map((resume) => (
                  <ResumeCard key={resume.id} resume={resume} />
              ))}
          </div>
      )}
    </section>
      <section className="main-section">
          <Link to={'/wipe'}>
              <Button variant="contained" color="error">
                  Wipe App Data
              </Button>
          </Link>
      </section>


  </main>
}
