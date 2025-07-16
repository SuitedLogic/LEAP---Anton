export const cmsData = [
  {
    id: "hero-section",
    type: "hero",
    attributes: {
      background: {
        type: "image",
        overlay: {
          color: "rgba(0,0,0,0.5)",
          enabled: true,
        },
      },
      content: {
        title: {
          text: "Welcome to Our Platform",
          style: {
            fontSize: "48px",
            color: "#ffffff",
            fontWeight: "bold",
          },
        },
        subtitle: {
          text: "Discover Amazing Features",
          style: {
            fontSize: "24px",
            color: "#f0f0f0",
          },
        },
      },
    },
  },
  {
    id: "feature-grid",
    type: "grid",
    attributes: {
      layout: {
        columns: 3,
        gap: "20px",
        padding: "40px",
      },
      items: [
        {
          id: "feature-1",
          content: {
            title: "Fast Performance",
            description: "Lightning quick loading times",
            alignment: "center",
            icon: "icon-fast-performance",
          },
        },
        {
          id: "feature-2",
          content: {
            title: "Secure Platform",
            description: "Enterprise-grade security",
            alignment: "center",
            icon: "icon-secure-platform",
          },
        },
        {
          id: "feature-3",
          content: {
            title: "Scalable Solution",
            description: "Grows with your business needs",
            alignment: "center",
            icon: "icon-scalable-solution",
          },
        },
      ],
    },
  },
  {
    id: "contact-form",
    type: "form",
    attributes: {
      fields: [
        {
          type: "text",
          name: "fullName",
          label: "Full Name",
          validation: {
            required: true,
            minLength: 2,
            maxLength: 50,
          },
          styling: {
            className: "form-input",
            placeholder: "Enter your full name",
          },
        },
        {
          type: "email",
          name: "email",
          label: "Email Address",
          validation: {
            required: true,
            pattern: "^[^@]+@[^@]+\\.[^@]+$",
          },
          styling: {
            className: "form-input",
            placeholder: "your@email.com",
          },
        },
      ],
      submission: {
        endpoint: "/api/contact",
        method: "POST",
        successMessage: "Thank you for contacting us!",
        errorMessage: "Something went wrong. Please try again.",
      },
    },
  },
];
