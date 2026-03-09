import {
  MenuItemType,
  BrandsListType,
  CartItemType,
  NotificationType,
} from "@/components/layouts/types";
import {
  gitHub,
  bitBucket,
  dribbble,
  dropbox,
  mail_chimp,
  slack,
} from "@/assets/images/brands/utils";
import { Img1, Img5, Img10 } from "@/assets/images/products/utils";
import { Avatar2, Avatar8 } from "@/assets/images/users/utils";

export const menuItems: MenuItemType[] = [
  {
    label: "dashboards", 
    icon: "ph-gauge",
    id: "index",
    prefix: "/",
    link: "/"
  }, 
  {
    label: "personnel-managment",
    isHeader: true,
    id: "HeaderMenu",
  },
  /*{
    label: "apps",
    isHeader: true,
    id: "HeaderApps",
  },
  {
    label: "chat",
    id: "sideBarChat",
    icon: "ph-chats",
    link: "/chat",
  },
  {
    label: "email",
    icon: "ph-envelope",
    link: "/email",
    id: "sidebarEmail",
  },
  {
    label: "ecommerce",
    icon: "ph-storefront",
    id: "sidebarEcommerce",
    prefix: "/ecommerce",
    subMenu: [
      { label: "products", link: "/ecommerce/products" },
      { label: "products-grid", link: "/ecommerce/products-grid" },
      { label: "products-Details", link: "/ecommerce/product-details" },
      { label: "create-product", link: "/ecommerce/add-product" },
      { label: "orders", link: "/ecommerce/orders" },
      { label: "order-overview", link: "/ecommerce/order-overview" },
      { label: "customers", link: "/ecommerce/customers" },
      { label: "shopping-cart", link: "/ecommerce/cart" },
      { label: "checkout", link: "/ecommerce/checkout" },
      { label: "sellers", link: "/ecommerce/sellers" },
      { label: "sellers-overview", link: "/ecommerce/seller-overview" },
    ],
  },
  {
    label: "file-manager",
    icon: "ph-folder-open",
    link: "/file-manager",
    id: "sidebarFileManager",
  },
  {
    label: "learning",
    icon: "ph-graduation-cap",
    id: "sidebarLearning",
    subMenu: [
      {
        label: "courses",
        id: "sidebarCourses",
        prefix: "/learning",
        subMenu: [
          { label: "list-view", link: "/learning/list" },
          { label: "grid-view", link: "/learning/grid" },
          { label: "category", link: "/learning/category" },
          { label: "overview", link: "/learning/overview" },
          { label: "create-course", link: "/learning/create" },
        ],
      },
      {
        label: "students",
        id: "sidebarStudent",
        prefix: "/student",
        subMenu: [
          { label: "my-subscriptions", link: "/student/subscriptions" },
          { label: "my-courses", link: "/student/courses" },
        ],
      },
      {
        label: "instructors",
        id: "sidebarInstructors",
        prefix: "/instructors",
        subMenu: [
          { label: "list-view", link: "/instructors/list" },
          { label: "grid-view", link: "/instructors/grid" },
          { label: "overview", link: "/instructors/overview" },
          { label: "create-instructors", link: "/instructors/create" },
        ],
      },
    ],
  },*/
  {
    label: "institutions",
    icon: "ph ph-buildings",
    id: "sidebarInstitution", 
    prefix: "/institution",
    link: "/institution/list"
  },
  {
    label: "employees",
    icon: "ph ph-users-three",
    id: "sidebarEmployees",
    prefix: "/employee",
    link: "/employee/list"
  },
  /*{
    label: "support-tickets",
    icon: "ph-ticket",
    id: "sidebarTickets",
    prefix: "/tickets",
    subMenu: [
      { label: "list-view", link: "/tickets/list" },
      { label: "overview", link: "/tickets/overview" },
    ],
  },*/
  {
    label: "healthcare-management",
    isHeader: true,
    id: "HeaderMenu",
  },
  {
    label: "service-providers",
    icon: "ph ph-first-aid",
    id: "sidebarServiceProvider",
    prefix: "/service-provider", 
    link: "/service-provider/list"
  },
  {
    label: "billing",
    icon: "ph ph-files",
    id: "sidebarBilling",
    prefix: "/invoices",
    link: "/invoices/list"
  },
  {
    label: "reports",
    icon: "ph ph-presentation-chart",
    id: "sidebarReports",
    prefix: "/reports",
    link: "/reports/list"
  },
  /*{
    label: "real-estate",
    icon: "ph-buildings",
    id: "sidebarRealeEstate",
    prefix: "/real-estate",
    subMenu: [
      { label: "listing-grid", link: "/real-estate/grid" },
      { label: "listing-list", link: "/real-estate/list" },
      { label: "listing-map", link: "/real-estate/map" },
      { label: "property-overview", link: "/real-estate/property-overview" },
      {
        label: "agent",
        id: "sidebarAgent",
        subMenu: [
          { label: "list-view", link: "/real-estate-agent/list" },
          { label: "grid-view", link: "/real-estate-agent/grid" },
          { label: "overview", link: "/real-estate-agent/overview" },
        ],
      },
      {
        label: "agencies",
        id: "sidebarAgencies",
        subMenu: [
          { label: "list-view", link: "/real-estate-agencies/list" },
          { label: "overview", link: "/real-estate-agencies/overview" },
        ],
      },
      { label: "add-property", link: "/real-estate/add-properties" },
      { label: "earnings", link: "/real-estate/earnings" },
    ],
  },*/
  {
    label: "administration",
    isHeader: true,
    id: "HeaderMenu",
  },
  {
    label: "settings",
    icon: "ph-gear",
    id: "sidebarSettings",
    subMenu: [
      //{ label: "period", link: "/users/users/list" },
     // { label: "functions", link: "/auth/signup" },
    ],
  },
  {
    label: "users",
    icon: "ph-user-circle",
    id: "sidebarUsers",
    subMenu: [
      { label: "users", link: "/users/users/list" },
     // { label: "functions", link: "/auth/signup" },
    ],
  },
  {
    label: "base-tables",
    icon: "ph ph-database",
    id: "sidebarAuth",
    subMenu: [
      { label: "countries", link: "/baseTable/country/list" },
      { label: "currencies", link: "/baseTable/currency/list" },
      { label: "hospital_procedure_types", link: "/baseTable/hospitalproceduretype/list" },
      { label: "hospital_procedure_groups", link: "/baseTable/hospitalproceduregroup/list" },
      { label: "institution-types", link: "/baseTable/institutiontype/list" },
      { label: "leave-reason", link: "/baseTable/leavereason/list" },
      { label: "languages", link: "/baseTable/languages/list" },
      { label: "tax-rates", link: "/baseTable/tax-rates/list" },
      { label: "provider-types", link: "/baseTable/provider-types/list" },
    ],
  },
  /*{
    label: "pages",
    isHeader: true,
    id: "sidebarPages",
  },
  {
    label: "authentication",
    icon: "ph-user-circle",
    id: "sidebarAuth",
    subMenu: [
      { label: "signin", link: "/auth/signin" },
      { label: "signup", link: "/auth/signup" },
      { label: "password-reset", link: "/auth/pass-reset" },
      { label: "password-create", link: "/auth/pass-change" },
      { label: "lock-screen", link: "/auth/lockscreen" },
      { label: "logout", link: "/auth/logout" },
      { label: "success-message", link: "/auth/success-msg" },
      { label: "two-step-verification", link: "/auth/twostep" },
      {
        label: "errors",
        id: "sidebarErrors",
        subMenu: [
          { label: "404-error", link: "/auth/404" },
          { label: "500", link: "/auth/500" },
          { label: "503", link: "/auth/503" },
          { label: "offline-page", link: "/auth/offline" },
        ],
      },
    ],
  },
  {
    label: "pages",
    icon: "ph-address-book",
    id: "sidebarPages",
    prefix: "/pages",
    subMenu: [
      { label: "starter", link: "/pages/starter" },
      { label: "profile", link: "/pages/profile" },
      { label: "profile-setting", link: "/pages/profile-settings" },
      { label: "contacts", link: "/pages/contacts" },
      { label: "timeline", link: "/pages/timeline" },
      { label: "faqs", link: "/pages/faqs" },
      { label: "pricing", link: "/pages/pricing" },
      { label: "maintenance", link: "/pages/maintenance" },
      { label: "coming-soon", link: "/pages/coming-soon" },
      { label: "privacy-policy", link: "/pages/privacy-policy" },
      { label: "term-conditions", link: "/pages/term-conditions" },
    ],
  },
  {
    label: "components",
    isHeader: true,
    id: "headerComponents",
  },
  {
    label: "vuetify-ui",
    icon: "ph-codesandbox-logo",
    id: "vuetifyUIPages",
    prefix: "/ui",
    subMenu: [
      { label: "alerts", link: "/ui/alerts" },
      { label: "badges", link: "/ui/badges" },
      { label: "buttons", link: "/ui/buttons" },
      { label: "colors", link: "/ui/colors" },
      { label: "cards", link: "/ui/cards" },
      { label: "carousel", link: "/ui/carousel" },
      { label: "menu", link: "/ui/menu" },
      { label: "grid", link: "/ui/grid" },
      { label: "images", link: "/ui/images" },
      { label: "tabs", link: "/ui/tabs" },
      { label: "expansion-panels", link: "/ui/expansion-panels" },
      { label: "dialogs", link: "/ui/dialogs" },
      { label: "navigation-drawer", link: "/ui/navigation-drawer" },
      { label: "progress", link: "/ui/progress" },
      { label: "media", link: "/ui/media" },
      { label: "embed-video", link: "/ui/embed-video" },
      { label: "typography", link: "/ui/typography" },
      { label: "lists", link: "/ui/lists" },
      { label: "general", link: "/ui/general" },
      { label: "utilities", link: "/ui/utilities" },
    ],
  },
  {
    label: "advance-ui",
    icon: "ph-package",
    id: "advanceUIPages",
    prefix: "/advance-ui",
    subMenu: [
      { label: "sweet-alerts", link: "/advance-ui/sweetalerts" },
      { label: "scrollbar", link: "/advance-ui/scrollbar" },
      { label: "swiper-slider", link: "/advance-ui/swiper" },
      { label: "ratings", link: "/advance-ui/ratings" },
      { label: "highlight", link: "/advance-ui/highlight" },
    ],
  },
  {
    label: "custom-ui",
    icon: "ph-wrench",
    id: "customUIPages",
    prefix: "/ui",
    subMenu: [
      { label: "profile", link: "/ui/profile" },
      { label: "counter", link: "/ui/counter" },
    ],
  },
  {
    label: "widgets",
    icon: "ph-paint-brush-broad",
    link: "/widgets",
    id: "sidebarWidgets",
  },
  {
    label: "forms",
    icon: "ph-file-text",
    id: "formsPages",
    prefix: "/forms",
    subMenu: [
      { link: "/forms/elements", label: "basic-elements" },
      { link: "/forms/select", label: "form-select" },
      { link: "/forms/checkboxs-radios", label: "checkboxes-radios" },
      { link: "/forms/pickers", label: "pickers" },
      { link: "/forms/masks", label: "input-masks" },
      { link: "/forms/advanced", label: "advanced" },
      { link: "/forms/range-sliders", label: "range-slider" },
      { link: "/forms/validation", label: "validation" },
      { link: "/forms/wizard", label: "wizard" },
      { link: "/forms/editors", label: "editors" },
      { link: "/forms/file-uploads", label: "file-uploads" },
      { link: "/forms/layouts", label: "form-layouts" },
    ],
  },
  {
    label: "tables",
    icon: "ph-table",
    id: "tablePages",
    prefix: "/tables",
    subMenu: [{ link: "/tables/basic", label: "basic-tables" }],
  },
  {
    label: "charts",
    icon: "ph-chart-pie",
    id: "charts",
    prefix: "/charts",
    subMenu: [
      {
        label: "apexcharts",
        id: "apexcharts",
        subMenu: [
          { link: "/charts/apex-line", label: "line" },
          { link: "/charts/apex-area", label: "area" },
          { link: "/charts/apex-column", label: "column" },
          { link: "/charts/apex-bar", label: "bar" },
          { link: "/charts/apex-mixed", label: "mixed" },
          { link: "/charts/apex-range-area", label: "range-area" },
          { link: "/charts/apex-funnel", label: "funnel" },
          { link: "/charts/apex-candlestick", label: "candlstick" },
          { link: "/charts/apex-boxplot", label: "boxplot" },
          { link: "/charts/apex-bubble", label: "bubble" },
          { link: "/charts/apex-scatter", label: "scatter" },
          { link: "/charts/apex-heatmap", label: "heatmap" },
          { link: "/charts/apex-treemap", label: "treemap" },
          { link: "/charts/apex-pie", label: "pie" },
          { link: "/charts/apex-radialbar", label: "radialbar" },
          { link: "/charts/apex-radar", label: "radar" },
          { link: "/charts/apex-polar", label: "polar-area" },
        ],
      },
      { label: "chartjs", link: "/charts/chartjs" },
    ],
  },
  {
    label: "icons",
    icon: "ph-traffic-cone",
    id: "sidebarIcons",
    subMenu: [
      { link: "/icons/remix", label: "remix" },
      { link: "/icons/boxicons", label: "boxicons" },
      { link: "/icons/materialdesign", label: "material-design" },
      { link: "/icons/phosphor", label: "phosphor" },
    ],
  },
  {
    label: "maps",
    icon: "ph-map-trifold",
    id: "sidebarMaps",
    subMenu: [
      { link: "/maps/google", label: "google" },
      { link: "/maps/amcharts", label: "amcharts" },
    ],
  },
  {
    label: "multi-level",
    icon: "ph-share-network",
    id: "sidebarMultiLevel",
    subMenu: [
      { label: "level-1.1" },
      {
        label: "level-1.2",
        subMenu: [
          { label: "level-2.1", link: "" },
          { label: "level-2.2", link: "" },
        ],
      },
    ],
  },*/
];

export const brandsList: BrandsListType[] = [
  { src: gitHub, title: "GitHub" },
  { src: bitBucket, title: "Bitbucket" },
  { src: dribbble, title: "Dribbble" },
  { src: dropbox, title: "Dropbox" },
  { src: mail_chimp, title: "Mail Chimp" },
  { src: slack, title: "Slack" },
];

export const cartItems: CartItemType[] = [
  {
    id: 1,
    src: Img1,
    subTitle: "Fashion",
    title: "Blive Printed Men Round Neck",
    price: 327.49,
    items: 2,
  },
  {
    id: 2,
    src: Img5,
    subTitle: "Sportwear",
    title: "Willage Volleyball Ball",
    price: 49.06,
    items: 3,
  },
  {
    id: 3,
    src: Img10,
    subTitle: "Fashion",
    title: "Cotton collar t-shirts for men",
    price: 53.33,
    items: 3,
  },
];

export const notifications: NotificationType[] = [
  {
    isSelected: false,
    id: "unread-1",
    src: Avatar2,
    title: "Angela Bernier",
    message: "Answered to your comment on the cash flow forecast's graph 🔔.",
    time: "48 min ago",
    isRead: false,
  },
  {
    isSelected: false,
    id: "unread-2",
    icon: "bx bx-badge-check bx-xs",
    message: `<h4>Your <b>Elite</b> author Graphic
    Optimization <span class="text-secondary">reward</span> is ready!</h4>`,
    time: "Just 30 sec ago",
    isRead: false,
  },
  {
    isSelected: false,
    id: "unread-3",
    icon: "bx bx-message-square-dots",
    message: `<h4>You have received <b class="text-success">20</b> new messages in the conversation</h4>`,
    time: "2 hrs ago",
    isRead: false,
  },

  {
    isSelected: false,
    id: "read-1",
    src: Avatar8,
    title: "Maureen Gibson",
    message: "We talked about a project on linkedin.",
    time: "4 hrs ago",
    isRead: true,
  },
];
