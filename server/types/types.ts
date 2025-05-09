export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

export interface Form {
  id: number;
  title: string;
  slug: string;
  description?: string;
  allowedDomains?: string[];
  limitOneResponse?: boolean;
  creatorId: string;
}

export interface Question {
  id: number; 
  name: string;
  choice_type: string;
  choices: string[];
  is_required: boolean;
  form_id: number;
}

export interface FormDetailResponse {
  message: string;
  form: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    limit_one_response: number; 
    creator_id: string;
    allowed_domains: string[];
    questions: Question[];
  };
}

export interface Answer {
  question_id: number;
  value: string;
}

export interface Response {
  id: number;
  form_id: number;
  user_id: string;
  answers: Answer[];
  submitted_at: string;
}

export interface DatabaseSchema {
  users: User[];
  sessions: Session[];
  forms: Form[];
  questions: Question[];
  responses: Response[];
}
