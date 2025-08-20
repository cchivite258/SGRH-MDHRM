import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "pages",
    disabled: false,
  },
  {
    title: "pricing",
    disabled: true,
  },
];

export const section1Data = [
  {
    title: "Free Plan",
    description: "For Startup",
    price: "$29.99",
    details: [
      `<div><i class='bx bxs-circle text-primary me-3'></i><b>3</b> Projects</div>`,
      `<div><i class='bx bxs-circle text-primary me-3'></i><b>299</b> Customers</div>`,
      `<div><i class='bx bxs-circle text-primary me-3'></i>Scalable Bandwidth</div>`,
      `<div><i class='bx bxs-circle text-primary me-3'></i><b>0</b> No Team Account</div>`,
      `<div class='text-muted text-decoration-line-through'><i class='bx bxs-circle me-3'></i>In app messaging</div>`,
      `<div class='text-muted text-decoration-line-through'><i class='bx bxs-circle me-3'></i><b>5</b> FTP Login</div>`,
      `<div class='text-muted text-decoration-line-through'><i class='bx bxs-circle me-3'></i>Detailed Analytics</div>`,
      `<div class='text-muted text-decoration-line-through'><i class='bx bxs-circle me-3'></i>Custom domain</div>`,
      `<div class='text-muted text-decoration-line-through'><i class='bx bxs-circle me-3'></i>Smart Workflow</div>`,
      `<div class='text-muted text-decoration-line-through'><i class='bx bxs-circle me-3'></i>IQ test</div>`,
    ],
  },
  {
    title: "Professional Plan",
    description: "Professional plans",
    price: "$49.99",
    isPopular: true,
    isActivePlan: true,
    details: [
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> <b>3</b> Projects</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> <b>299</b> Customers</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> Scalable Bandwidth</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> <b>0</b> No Team Account</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> In app messaging</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> <b>5</b> FTP Login</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> Detailed Analytics</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> Custom domain</div>`,
      `<div class="text-decoration-line-through text-muted"><i class='bx bxs-circle me-3'></i>Smart Workflow</div>`,
      `<div class="text-decoration-line-through text-muted"><i class='bx bxs-circle me-3'></i>IQ test</div>`,
    ],
  },
  {
    title: "Professional Plan",
    description: "Professional plans",
    price: "$99.99",
    details: [
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> <b>3</b> Projects</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> <b>299</b> Customers</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> Scalable Bandwidth</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> <b>0</b> No Team Account</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> In app messaging</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> <b>5</b> FTP Login</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> Detailed Analytics</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> Custom domain</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> Smart Workflow</div>`,
      `<div> <i class='bx bxs-circle me-3 text-primary'></i> IQ test</div>`,
    ],
  },
];

export const section2Data = [
  {
    title: "Personal Plan",
    description: "Perfect plan for Starters",
    price: "$19.99",
    details: [
      `<b>Unlimited</b> Projects`,
      `Share with <b>5</b> team members`,
      `Sync across devices`,
      `Scalable Bandwidth`,
      `<b>5</b> FTP Login`,
    ],
  },
  {
    isPopular: true,
    isActivePlan: true,
    title: "Professional Plan",
    description: "For users who want to do more.",
    price: "$49.99",
    details: [
      `Everything in Free Plans`,
      `<b>Unlimited</b> Projects`,
      `Share with <b>5</b> team members`,
      `Sync across devices`,
      `Scalable Bandwidth`,
      `Share with <b>5</b> team members`,
    ],
  },
  {
    title: "Enterprise Plan",
    description: "Your entire team in one place",
    price: "$49.99",
    details: [
      `Everything in Pro Plan`,
      `<b>Unlimited</b> Projects`,
      `Share with <b>5</b> team members`,
      `Scalable Bandwidth`,
      `Share with <b>5</b> team members`,
      `<b>30</b> day version history`,
      `Admin tools`,
    ],
  },
  {
    title: "Personal Plan",
    description: "Perfect plan for Starters",
    price: "$19.99",
    details: [
      `Everything in Enterprise Plan`,
      `<b>Unlimited</b> Projects`,
      `Share with <b>5</b> team members`,
      `Sync across devices`,
      `Scalable Bandwidth`,
      `Share with <b>5</b> team members`,
      `<b>30</b> day version history`,
      `Admin tools`,
    ],
  },
];

export const section3Data = [
  {
    title: "Starter",
    description: "The perfect way to get started and get used to our tools.",
    price: "$19",
    isActivePlan: true,
    color: "success",
    details: [
      `<b>3</b> Projects`,
      `<b>299</b> Customers`,
      `Scalable Bandwidth`,
      ` <b>5</b> FTP Login`,
    ],
  },
  {
    title: "Professional",
    description:
      "Excellent for scaling teams to build culture. Special plan for professional business.",
    price: "$29",
    color: "secondary",
    details: [
      `<b>8</b> Projects`,
      ` <b>449</b> Customers`,
      `Scalable Bandwidth`,
      `<b>7</b> FTP Login`,
      `<b>24/7</b> Support`,
    ],
  },
  {
    title: "Enterprise",
    description:
      "This plan is for those who have a team already and running a large business.",
    price: "$39",
    color: "primary",
    details: [
      `<b>15</b> Projects`,
      `<b>Unlimited</b> Customers`,
      `Scalable Bandwidth`,
      `<b>12</b> FTP Login`,
      `<b>24/7</b> Support`,
      `<b>35GB</b> Storage`,
    ],
  },
  {
    title: "Unlimited",
    isPopular: true,
    description: "For most businesses that want to optimize web queries.",
    price: "$49",
    color: "info",
    details: [
      `<b>Unlimited</b> Projects`,
      `<b>Unlimited</b> Customers`,
      `Scalable Bandwidth`,
      `<b>Unlimited</b> FTP Login`,
      `<b>24/7</b> Support`,
      `<b>Unlimited</b> Storage`,
      `Domain`,
    ],
  },
];

export const section4Data = [
  {
    title: "Starter",
    description: "Starter plans",
    price: "$24.99",
    color: "success",
    details: [
      `Users:<b>1</b>`,
      `Storage: <b>01 GB</b>`,
      `Domain: <b>No</b>`,
      `Support: <b>No</b>`,
    ],
  },
  {
    title: "Professional",
    description: "Professional plans",
    price: "$49.99",
    color: "primary",
    isPopular: true,
    details: [
      `Users: <b>1</b>`,
      `Storage: <b>5 GB</b>`,
      `Domain: <b>Yes</b>`,
      `Support: <b>No</b>`,
    ],
  },
  {
    title: "Unlimited",
    description: "Unlimited plans",
    price: "$99.99",
    color: "secondary",
    details: [
      `Users: <b>5</b>`,
      `Storage: <b>40 GB</b>`,
      `Domain: <b>Yes</b>`,
      `Support: <b>Yes</b>`,
    ],
  },
];
