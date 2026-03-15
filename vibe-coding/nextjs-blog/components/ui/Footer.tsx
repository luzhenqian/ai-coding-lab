export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Next.js Blog. Built with Next.js &
          Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
