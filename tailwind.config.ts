@import "tailwindcss";

@theme {
  /* --- Existing Colors & Radius --- */
  --color-border: hsl(220 13% 91%);
  --color-input: hsl(220 13% 91%);
  --color-ring: hsl(220 91% 50%);
  --color-background: hsl(0 0% 98%);
  --color-foreground: hsl(222.2 84% 4.9%);

  --color-primary: hsl(220 91% 50%);
  --color-primary-foreground: hsl(0 0% 100%);

  --color-school-blue: hsl(220 91% 50%);
  --color-school-orange: hsl(25 95% 53%);
  --color-school-blue-light: hsl(220 91% 95%);
  --color-school-orange-light: hsl(25 95% 95%);

  --radius-lg: 0.5rem;
  --radius-md: calc(0.5rem - 2px);
  --radius-sm: calc(0.5rem - 4px);

  /* --- Container Configuration --- */
  /* V4 automatically centers containers if you set the max-width */
  --container-2xl: 1400px;

  /* --- Animations & Keyframes --- */
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
  --animate-fade-in: fade-in 0.6s ease-out;
  --animate-slide-in: slide-in 0.3s ease-out;

  @keyframes accordion-down {
    from { height: 0; }
    to { height: var(--radix-accordion-content-height); }
  }
  @keyframes accordion-up {
    from { height: var(--radix-accordion-content-height); }
    to { height: 0; }
  }
  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes slide-in {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(0); }
  }
}

/* --- Tailwind Animate Plugin --- */
/* In v4, you don't 'require' it in a JS file. You import it or use the built-in logic. 
   Most shadcn components use 'tailwindcss-animate' which you can keep in package.json */
@plugin "tailwindcss-animate";

@layer base {
  *, ::after, ::before {
    @apply border-border;
  }
  /* Your existing body gradient remains here */
}
