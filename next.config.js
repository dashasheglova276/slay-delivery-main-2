/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "loremflickr.com" },
      { protocol: "https", hostname: "*.staticflickr.com" }
    ]
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" }
        ]
      }
    ];
  },
  async redirects() {
    return [
      // /account/register раньше рендерился отдельной страницей с client-side
      // redirect() — это добавляло лишнюю запись в историю браузера и ломало
      // кнопку "Назад" (зависание на паре /register <-> /account/register).
      // Редирект на уровне конфигурации Next.js не создаёт такую запись.
      { source: "/account/register", destination: "/register", permanent: true }
    ];
  }
};

module.exports = nextConfig;
