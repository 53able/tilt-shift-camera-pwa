import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <Link href="/camera">
        <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700">
          カメラを開く
        </button>
      </Link>
    </main>
  );
}
