interface DbUser {
    id: string;
    email: string;
    password: string;
    name: string | null;
    created_at: string;
    updated_at: string;
}

interface DbResume {
    id: string;
    user_id: string;
    company_name: string;
    job_title: string;
    job_description: string;
    pdf_url: string;
    image_url: string;
    feedback: unknown;
    idempotency_key: string;
    created_at: string;
    updated_at: string;
}

interface Job {
    title: string;
    description: string;
    location: string;
    requiredSkills: string[];
}

interface AuthUser {
    id: string;
    email: string;
    name?: string | null;
}

interface Resume {
    id: string;
    companyName?: string;
    jobTitle?: string;
    imagePath: string;
    resumePath: string;
    feedback: Feedback;
}

interface Feedback {
    overallScore: number;
    ATS: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
        }[];
    };
    toneAndStyle: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    content: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    structure: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    skills: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
}