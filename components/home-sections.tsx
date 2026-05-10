"use client";

export function HomeSections({
  genre1, genre2, genre3
}: {
  genre1: { name: string; slug: string; emoji: string };
  genre2: { name: string; slug: string; emoji: string };
  genre3: { name: string; slug: string; emoji: string };
}) {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold text-white relative pl-4 after:content-[''] after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-6 after:bg-primary after:rounded-full">
          Komik Hot 🔥
        </h2>
        <p>Popular manga loading...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-white relative pl-4 after:content-[''] after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-6 after:bg-primary after:rounded-full">
          List {genre1.name} {genre1.emoji}
        </h2>
        <p>Genre manga loading...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-white relative pl-4 after:content-[''] after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-6 after:bg-primary after:rounded-full">
          List {genre2.name} {genre2.emoji}
        </h2>
        <p>Genre manga loading...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-white relative pl-4 after:content-[''] after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-6 after:bg-primary after:rounded-full">
          List {genre3.name} {genre3.emoji}
        </h2>
        <p>Genre manga loading...</p>
      </section>
    </div>
  );
}
