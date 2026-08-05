export const menu = {
  hr: [
    {
      name: "Home",
      path: "/hr/dashboard",
    },
    {
      name: "Employees",
      path: "/hr/employee-list",
    },
    {
      name: "Attendance",
      path: "/hr/attendance",
    },
    {
      name: "Users",
      path: "/hr/users",
    },
  ],

  employee: [
    {
      name: "Home",
      path: "/employee/dashboard",
    },
    {
      name: "My Attendance",
      path: "/employee/attendance",
    },
    {
      name: "My Leave",
      path: "/employee/leave",
    },
    {
      name: "My Policies",
      path: "/employee/policies",
    },
    {
      name: "My Payslips",
      path: "/employee/payslips",
    },
  ],
  procurement: [
    {
      name: "Dashboard",
      path: "/procurement/dashboard",
    },
    {
      name: "Vendor",
      path: "/procurement/vendor",
    },
    {
      name: "Purchase Requests",
      path: "/procurement/purchase-requests",
    },
    {
      name: "Purchase Orders",
      path: "/procurement/po",
    },
    {
      name: "Dispatch Instructions",
      path: "/procurement/di",
    },
    {
      name: "BOQ",
      path: "/procurement/boq",
    },
  ],
  admin: [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      name: "Roles",
      path: "/admin/designations",
    },
    {
      name: "Projects",
      path: "/admin/projects",
    },
    {
      name: "Stores",
      path: "/admin/store-manager",
    },
    {
      name: "Drawing",
      path: "/admin/drawing",
    },
    {
      name: "Worksheets",
      path: "/admin/worksheet-templates",
    },
    {
      name: "App Sheet",
      path: "/admin/app-sheet",
    },
    {
      name: "Dataset",
      subItems: [
        {
          name: "Labour Contractors",
          path: "/admin/dataset/labour-contractors",
        },
        {
          name: "Jointers",
          path: "/admin/dataset/jointers",
        },
      ],
    },
  ],
  client: [
    {
      name: "Home",
      path: "/client/dashboard",
    },
    {
      name: "Projects",
      path: "/client/projects",
    },
  ],
  "store manager": [
    {
      name: "Dashboard",
      path: "/store/dashboard",
    },
    {
      name: "Dispatch Items",
      path: "/store/pos",
    },
    {
      name: "Inward Logs",
      path: "/store/inward",
    },
    {
      name: "Outward Logs",
      path: "/store/outward",
    },
    {
      name: "In Hand Stock",
      path: "/store/in-hand-stock",
    },
    {
      name: "Repairs",
      path: "/store/repair",
    }
  ],
  "store": [
    {
      name: "Dashboard",
      path: "/store/dashboard",
    },
    {
      name: "Dispatch Items",
      path: "/store/pos",
    },
    {
      name: "Inward Logs",
      path: "/store/inward",
    },
    {
      name: "Outward Logs",
      path: "/store/outward",
    },
    {
      name: "In Hand Stock",
      path: "/store/in-hand-stock",
    },
    {
      name: "Repairs",
      path: "/store/repair",
    }
  ],
  "senior site supervisor": [
    {
      name: "Dashboard",
      path: "/supervisor/dashboard",
    },
    {
      name: "My Attendance",
      path: "/employee/attendance",
    }
  ]
};
