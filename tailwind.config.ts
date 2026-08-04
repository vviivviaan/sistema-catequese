import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cal: '#F5F3ED', // paredes caiadas do Convento da Penha — fundo
        noite: '#1B2A41', // indigo profundo — texto principal
        'noite-suave': '#4A5872', // texto secundário
        rocha: '#C15B3C', // rocha avermelhada da Penha — acento primário
        vela: '#B8873A', // luz de vela — acento secundário / conquistas
        mar: '#2F6E8C', // mar de Vila Velha — links, ação
        vinho: '#6B2338', // litúrgico — estados especiais, alertas
        cartao: '#FBFAF6',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-source-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      borderRadius: {
        conta: '999px',
      },
      boxShadow: {
        suave: '0 2px 12px rgba(27, 42, 65, 0.08)',
        elevado: '0 8px 30px rgba(27, 42, 65, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
