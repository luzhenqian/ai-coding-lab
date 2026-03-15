export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-500 dark:text-gray-400 lg:px-8">
        &copy; {new Date().getFullYear()} Blog. All rights reserved.
      </div>
    </footer>
  );
}
