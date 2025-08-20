import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { OptionType } from "@/app/common/types/option.type";

export const overviewBreadcrumb: BreadcrumbType[] = [
  {
    title: "courses",
    disabled: false,
  },
  {
    title: "overview",
    disabled: true,
  },
];

export const introOptions: OptionType[] = [
  {
    title: "Facebook",
    icon: "bx bxl-facebook-circle ",
    value: "facebook",
  },
  {
    title: "Whatsapp",
    icon: "bx bxl-whatsapp",
    value: "whatsapp",
  },
  {
    title: "Instagram",
    icon: "bx bxl-instagram ",
    value: "instagram",
  },
];

export const tabs = [
  {
    title: "Description",
    value: "description",
  },
  {
    title: "Video Tutorials",
    value: "tutorial",
  },
  {
    title: "Reviews",
    value: "review",
  },
  {
    title: "FAQs",
    value: "faqs",
  },
];

export const tutorials = [
  {
    title: "Introduction to JavaScript + Setup",
    lessons: 4,
    value: "intro",
    videos: [
      {
        name: "What JavaScript framework should I learn?",
        time: "03:20 min",
      },
      {
        name: "What is JavaScript for example?",
        time: "07:32 min",
      },
      {
        name: "Which is a framework of JavaScript?",
        time: "08:54 min",
        isPlaying: true,
      },
      {
        name: "What is JavaScript and why it is used?",
        time: "06:37 min",
      },
    ],
  },
  {
    title: "Variables in JavaScript",
    lessons: 7,
    value: "variables",
    videos: [
      {
        name: "What are the variables in JavaScript?",
        time: "08:34 min",
      },
      {
        name: "What is a variable in JavaScript example?",
        time: "10:08 min",
      },
      {
        name: "What are the three variables in JavaScript?",
        time: "11:33 min",
      },
      {
        name: "How to write variables in JavaScript?",
        time: "07:31 min",
      },
      {
        name: "What are 3 types of variables?",
        time: "14:46 min",
      },
      {
        name: "What is a variable with example?",
        time: "09:33 min",
      },
    ],
  },
  {
    title: "Const, let and var in JavaScript ",
    lessons: 3,
    value: "keywords",
    videos: [
      {
        name: "What JavaScript framework should I learn?",
        time: "03:20 min",
      },
      {
        name: "What is JavaScript for example?",
        time: "07:32 min",
      },
      {
        name: "What is JavaScript and why it is used?",
        time: "06:37 min",
      },
    ],
  },
];

export const faqs = [
  {
    question: "What are good questions to ask about course?",
    answer: `What textbooks are required for the course? What
    days/times do class sessions occur or are they fully online? Are there
    any online platforms, programs, and/or softwares needed for the course?
    When are major assignments/ exams due for this course and what are its
    point values?`,
  },
  {
    question: "How does online learning work?",
    answer: `Distance learning is an educational process where
    students receive instruction through online classes, video recordings,
    video conferencing, or any other audio/visual technology medium.`,
  },
  {
    question: "Why is online learning better?",
    answer: `Because online courses provide students with full
    control over their studies, they can work at their own pace. Pupils, on
    average, work faster and absorb more information in online courses than
    they would otherwise.`,
  },
  {
    question: "How successful is online learning?",
    answer: `Some students do as well in online courses as in
    in-person courses, some may actually do better, but, on average,
    students do worse in the online setting, and this is particularly true
    for students with weaker academic backgrounds.`,
  },
  {
    question: "How do you ask questions about learning?",
    answer: `Avoid asking leading questions, those that prompt
    or suggest the answer, and yes/no questions. If a yes/no question is
    warranted, be ready with a follow-up question to encourage students to
    critically evaluate the material and engage in discussion.`,
  },
  {
    question: "What are course objectives?",
    answer: `A course objective specifies a behavior, skill,
    or action that a student can demonstrate if they have achieved mastery
    of the objective.`,
  },

  {
    question: "What is the advantage of learning?",
    answer: `By consistently educating yourself and trying new
    things, you'll learn you're capable of change and growth, which keeps
    you open to new opportunities in life. “Learning a new skill can get you
    out of a rut.`,
  },
];
