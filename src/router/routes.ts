import HomeView from "@/views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
    redirect: "/code",
    children: [
      {
        path: "code",
        name: "Code",
        component: () => import("@/views/CodeView.vue"),
      },
      {
        path: "calls",
        name: "Calls",
        component: () => import("@/views/CallView.vue"),
      },
    ],
  },
  {
    path: "/tests",
    name: "Tests",
    component: () => import("@/views/TestView.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/AboutView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
  },
];

export default routes;
